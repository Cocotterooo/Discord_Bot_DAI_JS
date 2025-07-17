import { MessageFlags, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder } from 'discord.js';
import { sendVerificationStatusDM } from './verificacion.js';

export default {
    // ID personalizado para verificar usuario
    id: 'verificar_usuario',

    /**
     * Ejecuta la lógica para verificar un usuario y cerrar el ticket
     * @param {Interaction} interaction - La interacción del botón
     * @param {Client} client - El cliente de Discord
     */
    async execute(interaction, client) {
        try {
            const userId = interaction.customId.split('_')[2]; // Extraer ID del usuario del customId
            const channel = interaction.channel;
            const guild = interaction.guild;
            const staffMember = interaction.member;
            const ROL_VERIFICADOR_ID = '1288206919118618839'; // Rol que puede verificar
            const ROL_VERIFICADO_ID = '1299781091451867146'; // Rol a asignar al verificar

            // Verificar que quien presiona el botón tiene el rol necesario
            if (!staffMember.roles.cache.has(ROL_VERIFICADOR_ID)) {
                return await interaction.reply({
                    content: '<:no:1288631410558767156> No tienes permisos para verificar usuarios.',
                    flags: MessageFlags.Ephemeral
                });
            }

            // Verificar que el canal es realmente un ticket de verificación
            if (!channel.name.startsWith('✅⦙')) {
                return await interaction.reply({
                    content: '<:no:1288631410558767156> Este no es un canal de verificación válido.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const user = await guild.members.fetch(userId);
            const rolVerificado = guild.roles.cache.get(ROL_VERIFICADO_ID);

            if (!rolVerificado) {
                return await interaction.reply({
                    content: '<:no:1288631410558767156> No se pudo encontrar el rol de verificado.',
                    flags: MessageFlags.Ephemeral
                });
            }

            // Verificar si el usuario ya tiene el rol
            if (user.roles.cache.has(ROL_VERIFICADO_ID)) {
                return await interaction.reply({
                    content: '<:no:1288631410558767156> Este usuario ya está verificado.',
                    flags: MessageFlags.Ephemeral
                });
            }

            // Asignar el rol de verificado al usuario
            await user.roles.add(rolVerificado);

            // Confirmar la verificación
            await interaction.reply({
                content: `<:si:1288631406452412428> Usuario **${user.user.username}** verificado exitosamente por **${staffMember.user.username}**.`
            });

            // Enviar mensaje de confirmación al usuario por DM
            await sendVerificationStatusDM(user.user, true, staffMember.user.username);

            // Enviar mensaje final al usuario
            await channel.send({
                content: `<:si:1288631406452412428> ${user} Ha sido **verificado exitosamente**. El ticket se cerrará automáticamente en unos segundos.`
            });

            // Log de la verificación exitosa
            await logVerificationSuccess(client, user.user, channel, staffMember.user);

            // Esperar un poco antes de eliminar el canal
            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (error) {
                    console.error('Error al eliminar el canal de verificación:', error);
                }
            }, 10000); // 10 segundos para que el usuario vea el mensaje
        } catch (error) {
            console.error('Error al verificar el usuario:', error);
            await interaction.reply({
                content: '<:no:1288631410558767156> Hubo un error al verificar el usuario.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

/**
 * Registra la verificación exitosa de un usuario
 */
async function logVerificationSuccess(client, user, channel, staffMember) {
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

        // Mensaje con toda la información detallada
        const infoTicket = new TextDisplayBuilder()
            .setContent(`## ✅ ✨ **USUARIO VERIFICADO EXITOSAMENTE** <@${user.id}>
            > 📅 Fecha y hora de **verificación**: \`${fechaFormateada}\`
            > 📊 **Estado**: ✅ **VERIFICADO**
            ### INFORMACIÓN DEL USUARIO:
            > 👤 **Usuario**: <@${user.id}> \`${user.username}\` 
            > 🏷️ **Rol asignado**: <@&1299781091451867146>
            ### INFORMACIÓN DEL TICKET:
            > ✅  **Canal**: \`#${channel.name}\`
            > 📍 **ID del canal**: \`${channel.id}\`
            > 👮 **Verificado por**: <@${staffMember.id}> \`${staffMember.username}\``
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
        console.error('Error al registrar la verificación exitosa:', error);
    }
}
