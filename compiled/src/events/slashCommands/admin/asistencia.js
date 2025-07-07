var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
let tracking = false;
let trackedChannelId = null;
let attendees = new Set();
// Lista de IDs de roles permitidos
const allowedRoleIds = [
    '1292467186320805948', // Secretario
    '1288552528484630598', // Desarrollo discord
];
export default {
    data: new SlashCommandBuilder()
        .setName('asistencia')
        .setDescription('Inicia o detiene el registro de asistentes en un canal de voz.'),
    execute(interaction, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = interaction.member;
            // Comprobar si el miembro tiene algún rol permitido por ID
            const hasPermission = member.roles.cache.some(role => allowedRoleIds.includes(role.id));
            if (!hasPermission) {
                yield interaction.reply({ content: '<:no:1288631410558767156> No tienes permisos para usar este comando.', ephemeral: true });
                return;
            }
            const voiceChannel = member.voice.channel;
            if (!voiceChannel) {
                yield interaction.reply({ content: '<:no:1288631410558767156> Debes estar en un canal de voz para usar este comando.', ephemeral: true });
                return;
            }
            if (tracking && trackedChannelId === voiceChannel.id) {
                // Finalizar el registro
                tracking = false;
                trackedChannelId = null;
                const embed = new EmbedBuilder()
                    .setTitle('Registro de Asistentes')
                    .setDescription([...attendees]
                    .map((att, index) => `${index + 1}. ${att}`)
                    .join('\n') || 'No hubo asistentes.')
                    .setColor('Green')
                    .setTimestamp();
                attendees.clear();
                yield interaction.reply({ embeds: [embed] });
            }
            else {
                // Empezar el registro
                tracking = true;
                trackedChannelId = voiceChannel.id;
                attendees.clear();
                // Agregar usuarios que ya están conectados
                voiceChannel.members.forEach((member) => {
                    attendees.add(member.displayName);
                });
                yield interaction.reply({ content: `<:si:1288631406452412428> Comenzado el registro de asistentes en **${voiceChannel.name}**. Usa el comando de nuevo para finalizar.` });
                // Escuchar cambios de voz para ese canal
                const voiceStateUpdateHandler = (oldState, newState) => {
                    if (!tracking || !trackedChannelId)
                        return;
                    const oldChannelId = oldState.channelId;
                    const newChannelId = newState.channelId;
                    // Si alguien se une al canal que estamos siguiendo
                    if (newChannelId === trackedChannelId) {
                        if (newState.member) {
                            attendees.add(newState.member.displayName);
                        }
                    }
                    // Si el canal de seguimiento queda vacío
                    const trackedChannel = client.channels.cache.get(trackedChannelId);
                    if ((trackedChannel === null || trackedChannel === void 0 ? void 0 : trackedChannel.isVoiceBased()) && trackedChannel.members.size === 0) {
                        tracking = false;
                        trackedChannelId = null;
                        const embed = new EmbedBuilder()
                            .setTitle('Registro de Asistentes (Canal vacío)')
                            .setDescription([...attendees]
                            .map((att, index) => `${index + 1}. ${att}`)
                            .join('\n') || 'No hubo asistentes.')
                            .setColor('Orange')
                            .setTimestamp();
                        attendees.clear();
                        interaction.followUp({ embeds: [embed] });
                        client.removeListener('voiceStateUpdate', voiceStateUpdateHandler);
                    }
                };
                client.on('voiceStateUpdate', voiceStateUpdateHandler);
            }
        });
    }
};
