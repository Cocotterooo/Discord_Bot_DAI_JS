var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default {
    name: 'voiceStateUpdate',
    execute(oldState, newState) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user = (_a = newState.member) === null || _a === void 0 ? void 0 : _a.user;
            if (!user)
                return; // Validación por si no hay usuario
            if (!oldState.channel && newState.channel) {
                console.log(`${user.tag} se unió al canal de voz ${newState.channel.name}`);
            }
            else if (oldState.channel && !newState.channel) {
                console.log(`${user.tag} salió del canal de voz ${oldState.channel.name}`);
            }
        });
    }
};
