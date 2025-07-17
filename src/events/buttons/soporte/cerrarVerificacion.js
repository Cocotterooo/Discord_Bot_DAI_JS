import { MessageFlags, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder } from 'discord.js';
import { sendVerificationStatusDM } from './verificacion.js';

export default {
    // ID personalizado para cerrar verificación
    id: 'cerrar_verificacion',

    /**
     * Ejecuta la lógica para cerrar un ticket de verificación sin verificar
     * @param {Interaction} interaction - La interacción del botón
     * @param {Client} client - El cliente de Discord
     */
    async execute(interaction, client) {
        try {
            const userId = interaction.customId.split('_')[2]; // Extraer ID del usuario del customId
            const channel = interaction.channel;
            const guild = interaction.guild;
            const user = await guild.members.fetch(userId);

            // Verificar que el canal es realmente un ticket de verificación
            if (!channel.name.startsWith('✅⦙')) {
                return await interaction.reply({
                    content: '<:no:1288631410558767156> Este no es un canal de verificación válido.',
                    flags: MessageFlags.Ephemeral
                });
            }

            // Confirmar el cierre
            await interaction.reply({
                content: `<:si:1288631406452412428> **Cerrando ticket de verificación**. El usuario **${user.user.username}** **no ha sido verificado**.`,
                flags: MessageFlags.Ephemeral
            });

            // Enviar mensaje de notificación al usuario por DM
            await sendVerificationStatusDM(user.user, false);

            // Enviar mensaje final al usuario
            await channel.send({
                content: `<:si:1288631406452412428> ${user} Ticket de verificación **ha sido cerrado sin completar la verificación**. Si necesitas verificarte nuevamente, puedes crear otro ticket.`
            });

            // Log del cierre sin verificación
            await logVerificationClosure(client, user.user, channel, false, interaction.user);

            // Esperar un poco antes de eliminar el canal
            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (error) {
                    console.error('Error al eliminar el canal de verificación:', error);
                }
            }, 5000);
        } catch (error) {
            console.error('Error al cerrar el ticket de verificación:', error);
            await interaction.reply({
                content: '<:no:1288631410558767156> Hubo un error al cerrar el ticket de verificación.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

/**
 * Registra el cierre de un ticket de verificación
 */
async function logVerificationClosure(client, user, channel, wasVerified, staffMember) {
    try {
        const LOG_CHANNEL_ID = '1395110127614296165';
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);

        const fecha = new Date();
        const fechaFormateada = fecha.toLocaleString('es-ES', {
            timeZone: 'Europe/Madrid',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Crear container
        const container = new ContainerBuilder();

        const status = wasVerified ? '✅ **VERIFICADO**' : '❌ **SIN VERIFICAR**';
        const emoji = wasVerified ? '✅' : '❌';

        // Mensaje con toda la información detallada
        const infoTicket = new TextDisplayBuilder()
            .setContent(`## ${emoji} 🔒 **TICKET DE VERIFICACIÓN CERRADO** <@${user.id}>
            > 📅 Fecha y hora de **cierre**: \`${fechaFormateada}\`
            > 📊 **Estado**: ${status}
            ### INFORMACIÓN DEL USUARIO:
            > 👤 **Usuario**: <@${user.id}> \`${user.username}\` 
            ### INFORMACIÓN DEL TICKET:
            > ${emoji}  **Canal**: \`#${channel.name}\`
            > 📍 **ID del canal**: \`${channel.id}\`
            > 👮 **Cerrado por**: <@${staffMember.id}> \`${staffMember.username}\``
        );

        container.addTextDisplayComponents(infoTicket);

        // separador
        container.addSeparatorComponents(new SeparatorBuilder());

        // firma
        const firma = new TextDisplayBuilder()
            .setContent('-# <:dai:1288623399672741930>  Delegación de alumnado de industriales - UVigo  ·  **Registro de verificación**');

        container.addTextDisplayComponents(firma);

        // Enviar mensaje con el contenedor
        await logChannel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container],
            allowedMentions: { parse: [] }
        });
    } catch (error) {
        console.error('Error al registrar el cierre del ticket de verificación:', error);
    }
}
