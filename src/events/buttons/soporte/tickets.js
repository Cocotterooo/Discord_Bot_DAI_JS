import { MessageFlags, ChannelType, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder, EmbedBuilder, SlashCommandBuilder, TextDisplayBuilder, ContainerBuilder, SectionBuilder, SeparatorBuilder, SectionComponent, UserSelectMenuBuilder, ThumbnailBuilder } from 'discord.js';

export default {
    // ID personalizado del botón que debe coincidir con el definido en staffRoles.js
    id: 'ins_soporte_tickets',

    /**
     * Ejecuta la lógica del botón para crear un canal de soporte o no si ya lo tiene
     * @param {Interaction} interaction - La interacción del botón
     * @param {Client} client - El cliente de Discord
     */
    async execute(interaction, client) {
        try {
            // ID de la categoría donde se crearán los tickets
            const CATEGORIA_SOPORTE_ID = '1299774761798205500';
            const guild = interaction.guild;
            const user = interaction.user;
            const userName = user.username; // Nombre de usuario (no nickname)

            // Verificar si ya existe un ticket para este usuario
            const categoria = guild.channels.cache.get(CATEGORIA_SOPORTE_ID);
            if (!categoria) {
                return await interaction.reply({
                    content: '<:no:1288631410558767156>: No se pudo encontrar la categoría de soporte.',
                    flags: MessageFlags.Ephemeral
                });
            }

            // Buscar si ya existe un canal con el nombre del usuario
            const canalExistente = categoria.children.cache.find(channel =>
                channel.name === `❓⦙${userName.toLowerCase()}`
            );

            if (canalExistente) {
                return await interaction.reply({
                    content: `<:no:1288631410558767156> Ya tienes un ticket abierto: ${canalExistente}`,
                    flags: MessageFlags.Ephemeral
                });
            }

            // Crear el canal de soporte
            const canalSoporte = await guild.channels.create({
                name: `❓⦙${userName}`,
                type: ChannelType.GuildText,
                parent: CATEGORIA_SOPORTE_ID,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.AttachFiles,
                            PermissionFlagsBits.EmbedLinks
                        ]
                    },
                    {
                        id: '1288272050993106954', // Rol STAFF (toda la delegación)
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageMessages,
                            PermissionFlagsBits.AttachFiles,
                            PermissionFlagsBits.EmbedLinks
                        ]
                    }
                ]
            });

            // Responder a la interacción
            await interaction.reply({
                content: `<:si:1288631406452412428> Se ha creado un **chat de soporte**: ${canalSoporte}`,
                flags: MessageFlags.Ephemeral
            });

            // Crear botón para cerrar el ticket
            const cerrarTicketButton = new ButtonBuilder()
                .setCustomId(`cerrar_ticket_${user.id}`)
                .setLabel('Cerrar Ticket')
                .setStyle('Danger')
                .setEmoji('🗑️');

            const row = new ActionRowBuilder().addComponents(cerrarTicketButton);

            // Crear embed de bienvenida
            const embedBienvenida = new EmbedBuilder()
                .setTitle('🎫 Ticket de Soporte Creado')
                .setDescription(`## <:info:1288631394502709268> ¡Bienvenido al Soporte ${user}!\n### Te atenderá un miembro de la DAI lo antes posible.\nPor favor, cuéntanos tu problema o duda para que podamos ayudarte.`)
                .setColor(0x0099ff)
                .setTimestamp()
                .setImage('https://i.imgur.com/8GkOfv1.png')
                .setFooter({ text: 'Delegación de Alumnos de Industriales - UVigo' });

            // Enviar mensaje en el canal creado
            await canalSoporte.send({
                content: `${user}`,
                embeds: [embedBienvenida],
                components: [row]
            });

            // Log de creación del ticket
            await logTicketCreation(client, user, canalSoporte);
        } catch (error) {
            console.error('Error al crear el ticket:', error);
            await interaction.reply({
                content: '<:no:1288631410558767156> Hubo un error al crear el ticket. Por favor, contacta con un administrador.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

/**
 * Registra la creación de un ticket en el canal de logs
 */
async function logTicketCreation(client, user, channel) {
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
            .setContent(`## 🎫 📝 **TICKET CREADO** <@${user.id}>
            > 📅 Fecha y hora de **creación**: \`${fechaFormateada}\`
            ### INFORMACIÓN DEL USUARIO:
            > 👤 **Usuario**: <@${user.id}> \`${user.username}\` 
            ### INFORMACIÓN DEL TICKET:
            > 🎫  **Canal**: <#${channel.id}> \`#${channel.name}\`
            > 📍 **ID del canal**: \`${channel.id}\``
        );

        container.addTextDisplayComponents(infoTicket);

        // separador
        container.addSeparatorComponents(new SeparatorBuilder());

        // firma
        const firma = new TextDisplayBuilder()
            .setContent('-# <:dai:1288623399672741930>  Delegación de alumnado de industriales - UVigo  ·  **Registro de ticket**');

        container.addTextDisplayComponents(firma);

        // Enviar mensaje con el contenedor
        await logChannel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container],
            allowedMentions: { parse: [] }
        });
    } catch (error) {
        console.error('Error al registrar la creación del ticket:', error);
    }
}
