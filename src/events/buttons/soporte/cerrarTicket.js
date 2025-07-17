import { MessageFlags, AttachmentBuilder, ChannelType, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder, EmbedBuilder, SlashCommandBuilder, TextDisplayBuilder, ContainerBuilder, SectionBuilder, SeparatorBuilder, SectionComponent, UserSelectMenuBuilder, ThumbnailBuilder, FileBuilder, Attachment } from 'discord.js';
import { discordConfig } from '../../../../config.js';
export default {
    // ID personalizado del botón para cerrar tickets
    id: 'cerrar_ticket',

    /**
     * Ejecuta la lógica del botón para cerrar un ticket de soporte
     * @param {Interaction} interaction - La interacción del botón
     * @param {Client} client - El cliente de Discord
     */
    async execute(interaction, client) {
        try {
            // Extraer el ID del usuario del customId del botón
            const userId = interaction.customId.split('_')[2];
            const user = await client.users.fetch(userId);
            const channel = interaction.channel;

            // Verificar que el canal es realmente un ticket
            if (!channel.name.startsWith('❓⦙')) {
                return await interaction.reply({
                    content: '<:no:1288631410558767156> Este comando solo puede usarse en canales de tickets.',
                    flags: MessageFlags.Ephemeral
                });
            }

            // Confirmar que se va a cerrar el ticket
            await interaction.reply({
                content: '🗑️ Cerrando ticket...',
                flags: MessageFlags.Ephemeral
            });

            // Enviar mensaje privado al usuario notificando que su ticket se ha cerrado
            try {
                // Crear container para el mensaje de cierre
                const container = new ContainerBuilder();

                // MARK: Mensaje Usuario
                const mensajeCierre = new TextDisplayBuilder()
                    .setContent(`## 🎫🔒 **TICKET CERRADO**
                    > Tu ticket de soporte ha sido **cerrado**.
                    ### 📧 ¿Necesitas más ayuda?
                    > Si necesitas **asistencia adicional**, puedes **crear un nuevo ticket** en el servidor de la **EEI**.
                    ### 📋 DETALLES DEL TICKET:
                    > 🏷️ **Canal**: \`#${channel.name}\`
                    > 📅 **Fecha de inicio**: <t:${Math.floor(channel.createdTimestamp / 1000)}:F>
                    > 📅 **Fecha de cierre**: <t:${Math.floor(Date.now() / 1000)}:F>
                    > 👤 **Cerrado por**: <@${interaction.user.id}> \`${interaction.user.tag}\``
                );

                container.addTextDisplayComponents(mensajeCierre);
                container.setAccentColor(discordConfig.COLOR)

                // separador
                container.addSeparatorComponents(new SeparatorBuilder());

                // firma
                const firma = new TextDisplayBuilder()
                    .setContent('-# <:dai:1288623399672741930>  Delegación de alumnado de industriales - UVigo  ·  **Sistema de tickets**');

                container.addTextDisplayComponents(firma);

                await user.send({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container]
                });
            } catch (dmError) {
                console.log(`No se pudo enviar DM al usuario ${user.tag}: ${dmError.message}`);
                // Enviar mensaje en el canal antes de eliminarlo
                await channel.send('⚠️ No se ha podido enviar la notificación privada al usuario. **El ticket se cerrará de todas formas.**');
            }

            // PRIMERO: Obtener el historial de mensajes antes de cualquier otra operación
            let historialMensajes = 'No se pudieron obtener los mensajes';
            let totalMensajes = 0;
            try {
                console.log('Obteniendo mensajes del canal antes del cierre...');
                const messages = await channel.messages.fetch({ limit: 100 });
                totalMensajes = messages.size;
                console.log(`Se obtuvieron ${totalMensajes} mensajes`);

                // Obtener información de los miembros para conseguir los apodos
                const guild = channel.guild;

                historialMensajes = (await Promise.all(messages.reverse().map(async msg => {
                    const timestamp = msg.createdAt.toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
                    let autorDisplay = msg.author.tag;

                    // Intentar obtener el apodo del usuario
                    try {
                        const member = await guild.members.fetch(msg.author.id);
                        if (member.nickname) {
                            autorDisplay = `(${member.nickname}) @${msg.author.username}`;
                        } else {
                            autorDisplay = `@${msg.author.username}`;
                        }
                    } catch (e) {
                        autorDisplay = `@${msg.author.username}`;
                    }

                    return `[${timestamp}] ${autorDisplay}: ${msg.content || '[Archivo/Embed/Componente]'}`;
                }))).join('\n');

                console.log('Historial de mensajes obtenido correctamente');
            } catch (msgError) {
                console.error('Error al obtener mensajes del canal:', msgError);
                historialMensajes = `Error al obtener mensajes: ${msgError.message}`;
            }

            // Recopilar información del ticket antes de eliminarlo
            const ticketInfo = {
                userName: user.username,
                userTag: user.tag,
                userId: user.id,
                channelName: channel.name,
                channelId: channel.id,
                createdTimestamp: channel.createdTimestamp,
                closedTimestamp: Date.now(),
                closedBy: interaction.user.tag,
                closedById: interaction.user.id,
                historialMensajes,
                totalMensajes
            };

            // Log de cierre del ticket
            await logTicketClosure(interaction.client, ticketInfo, channel);

            // Esperar un momento antes de eliminar el canal
            setTimeout(async () => {
                try {
                    await channel.delete('Ticket cerrado por el staff');
                } catch (deleteError) {
                    console.error('Error al eliminar el canal:', deleteError);
                }
            }, 3000); // 3 segundos de espera
        } catch (error) {
            console.error('Error al cerrar el ticket:', error);
            await interaction.reply({
                content: '<:no:1288631410558767156> Hubo un error al cerrar el ticket.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

/** MARK: 💿 REGISTRO
 * Registra el cierre de un ticket en el canal de logs
 */
async function logTicketClosure(client, ticketInfo, channel) {
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

        const fechaCreacion = new Date(ticketInfo.createdTimestamp).toLocaleString('es-ES', {
            timeZone: 'Europe/Madrid',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // MARK: Obtener historial de mensajes desde ticketInfo (ya obtenido antes)
        const historialMensajes = ticketInfo.historialMensajes || 'No se pudieron obtener los mensajes';
        const totalMensajes = ticketInfo.totalMensajes || 0;

        // MARK: Contenido del archivo - SOLO historial de mensajes (últimos 100)
        const logContent = `HISTORIAL DE MENSAJES DEL TICKET
            ========================================
            Canal: #${ticketInfo.channelName}
            Usuario: ${ticketInfo.userTag}
            Total de mensajes obtenidos: ${totalMensajes}/100 (máximo)
            ========================================

            ${historialMensajes}

            ========================================
            FIN DEL HISTORIAL`;

        // MARK: Crear archivo de log
        const buffer = Buffer.from(logContent, 'utf8');
        const fileName = `ticket_historial_${ticketInfo.userName}_${fecha.getTime()}.txt`;

        // Crear container
        const container = new ContainerBuilder();

        // Mensaje con toda la información detallada
        const infoTicket = new TextDisplayBuilder()
            .setContent(`## 🎫 🔒 **TICKET CERRADO** <@${ticketInfo.userId}>
            > 📅 Fecha y hora de **creación**: \`${fechaCreacion}\`
            > 📅 Fecha y hora de **cierre**: \`${fechaFormateada}\`
            ### INFORMACIÓN DEL USUARIO:
            > 👤 **Usuario**: <@${ticketInfo.userId}> \`${ticketInfo.userName}\` \n### INFORMACIÓN DEL TICKET:
            > 🎫  **Canal**: \`#${ticketInfo.channelName}\`
            > 📍 **ID del canal**: \`${ticketInfo.channelId}\`
            > 💬 **Total de mensajes**: \`${totalMensajes}\`\n### CIERRE DEL TICKET:
            > 🔒 **Cerrado por**: <@${ticketInfo.closedById}> \`${ticketInfo.closedBy}\``
        );

        container.addTextDisplayComponents(infoTicket);

        // separador
        container.addSeparatorComponents(new SeparatorBuilder());

        // Archivo de log
        const attachment = new AttachmentBuilder(buffer, { name: fileName });
        const fileComponent = new FileBuilder({
            file: {
                url: `attachment://${fileName}`
            }
        });
        container.addFileComponents(fileComponent);
        // firma
        const firma = new TextDisplayBuilder()
            .setContent('-# <:dai:1288623399672741930>  Delegación de alumnado de industriales - UVigo  ·  **Registro de ticket**');

        container.addTextDisplayComponents(firma);
        // Enviar mensaje con el contenedor y el archivo integrado
        await logChannel.send({
            flags: MessageFlags.IsComponentsV2,
            files: [attachment],
            components: [container],
            allowedMentions: { parse: [] }
        });
    } catch (error) {
        console.error('Error al registrar el cierre del ticket:', error);
    }
}
