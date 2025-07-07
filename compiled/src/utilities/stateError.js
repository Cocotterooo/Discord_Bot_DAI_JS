var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PresenceUpdateStatus } from 'discord.js';
/**
 * Cambia el estado del bot.
 *
 * @param {object} client - El primer número.
 * @param {string} type - 'error', 'warning' o 'success'.
 * @returns {None}
 */
export function stateError(client_1) {
    return __awaiter(this, arguments, void 0, function* (client, type = 'error') {
        var _a, _b, _c;
        try {
            if (type === 'error') {
                yield ((_a = client.user) === null || _a === void 0 ? void 0 : _a.setPresence({ status: PresenceUpdateStatus.DoNotDisturb }));
                console.log('🔴 Estado del bot actualizado a No molestar');
            }
            else if (type === 'warning') {
                yield ((_b = client.user) === null || _b === void 0 ? void 0 : _b.setPresence({ status: PresenceUpdateStatus.Idle }));
                console.log('🟡 Estado del bot actualizado a Ausente');
            }
            else if (type === 'success') {
                yield ((_c = client.user) === null || _c === void 0 ? void 0 : _c.setPresence({ status: PresenceUpdateStatus.Online }));
                console.log('🟢 Estado del bot actualizado a En línea');
            }
            else {
                console.error('❌ Tipo de estado no válido.');
            }
        }
        catch (presenceError) {
            console.error('❌ Error al actualizar el estado del bot:', presenceError.message);
        }
    });
}
