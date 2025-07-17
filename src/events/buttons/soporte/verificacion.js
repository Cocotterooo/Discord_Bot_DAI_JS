import { MessageFlags, ChannelType, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder, EmbedBuilder, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder } from 'discord.js';

export default {
    // ID personalizado del botón para verificación
    id: 'ins_soporte_verificacion',

    /**
     * Ejecuta la lógica del botón para crear un canal de verificación
     * @param {Interaction} interaction - La interacción del botón
     * @param {Client} client - El cliente de Discord
     */
    async execute(interaction, client) {
        try {
            // ID de la categoría donde se crearán los tickets de verificación
            const CATEGORIA_VERIFICACION_ID = '1299774761798205500'; // Usando la misma categoría, puedes cambiarla si quieres una diferente
            const ROL_VERIFICADO_ID = '1299781091451867146'; // Rol de usuario verificado
            const guild = interaction.guild;
            const user = interaction.user;
            const userName = user.username;
            const member = guild.members.cache.get(user.id);

            // Verificar si el usuario ya está verificado
            if (member && member.roles.cache.has(ROL_VERIFICADO_ID)) {
                return await interaction.reply({
                    content: '<:verificado:1288628715982553188><:no:1288631410558767156> **Ya estás verificado**. No puedes crear un ticket de verificación.',
                    flags: MessageFlags.Ephemeral
                });
            }

            // Verificar si ya existe un ticket de verificación para este usuario
            const categoria = guild.channels.cache.get(CATEGORIA_VERIFICACION_ID);
            if (!categoria) {
                return await interaction.reply({
                    content: '<:no:1288631410558767156>: No se pudo encontrar la categoría de verificación.',
                    flags: MessageFlags.Ephemeral
                });
            }

            // Buscar si ya existe un canal de verificación con el nombre del usuario
            const canalExistente = categoria.children.cache.find(channel =>
                channel.name === `✅⦙${userName.toLowerCase()}`
            );

            if (canalExistente) {
                return await interaction.reply({
                    content: `<:verificado:1288628715982553188><:no:1288631410558767156> Ya tienes un ticket de verificación abierto: ${canalExistente}`,
                    flags: MessageFlags.Ephemeral
                });
            }

            // Crear el canal de verificación
            const canalVerificacion = await guild.channels.create({
                name: `✅⦙${userName}`,
                type: ChannelType.GuildText,
                parent: CATEGORIA_VERIFICACION_ID,
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
                    },
                    {
                        id: '1288206919118618839', // Rol que puede verificar
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
                content: `<:verificado:1288628715982553188><:si:1288631406452412428> Se ha creado un **canal de verificación**: ${canalVerificacion}`,
                flags: MessageFlags.Ephemeral
            });

            // Crear botones para cerrar y verificar
            const cerrarVerificacionButton = new ButtonBuilder()
                .setCustomId(`cerrar_verificacion_${user.id}`)
                .setLabel('Cerrar Verificación')
                .setStyle('Danger')
                .setEmoji('🗑️');

            const verificarButton = new ButtonBuilder()
                .setCustomId(`verificar_usuario_${user.id}`)
                .setLabel('Verificar Usuario')
                .setStyle('Success')
                .setEmoji('✅');

            const row = new ActionRowBuilder().addComponents(cerrarVerificacionButton, verificarButton);

            // Crear container para componentes V2
            const container = new ContainerBuilder();

            // Mención del usuario
            const mencionUsuario = new TextDisplayBuilder()
                .setContent(`${user}`);

            container.addTextDisplayComponents(mencionUsuario);

            // Mensaje principal de bienvenida
            const mensajeBienvenida = new TextDisplayBuilder()
                .setContent(`# <:si:1288631406452412428> Ticket de Verificación Creado
                ### <:verificado:1288628715982553188> ¡Bienvenido al Sistema de Verificación ${user}!
                ### Revisaremos tu solicitud de **verificación lo antes posible**.
                > Por favor, **proporciónanos** el documento de **matrícula** o una **captura** de pantalla de **Moovi en la sección de asignaturas**.`);

            container.addTextDisplayComponents(mensajeBienvenida);

            // Separador
            container.addSeparatorComponents(new SeparatorBuilder());

            // Pie del mensaje
            const pieMsg = new TextDisplayBuilder()
                .setContent('-# <:dai:1288623399672741930> Delegación de Alumnos de Industriales - UVigo · **Verificación de Usuarios**');

            container.addTextDisplayComponents(pieMsg);

            // Enviar mensaje en el canal creado con componentes V2
            await canalVerificacion.send({
                flags: MessageFlags.IsComponentsV2,
                components: [container]
            });

            // Enviar los botones en un mensaje separado
            await canalVerificacion.send({
                components: [row]
            });

            // Log de creación del ticket de verificación
            await logVerificationCreation(client, user, canalVerificacion);
        } catch (error) {
            console.error('Error al crear el ticket de verificación:', error);

            // Solo responder si la interacción no ha sido respondida
            if (!interaction.replied && !interaction.deferred) {
                try {
                    await interaction.reply({
                        content: '<:no:1288631410558767156> Hubo un error al crear el ticket de verificación. Por favor, contacta con un administrador.',
                        flags: MessageFlags.Ephemeral
                    });
                } catch (replyError) {
                    console.error('Error al responder a la interacción:', replyError);
                }
            }
        }
    }
};

/**
 * Registra la creación de un ticket de verificación en el canal de logs
 */
async function logVerificationCreation(client, user, channel) {
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
            .setContent(`## ✅ 📝 **TICKET DE VERIFICACIÓN CREADO** <@${user.id}>
            > 📅 Fecha y hora de **creación**: \`${fechaFormateada}\`
            ### INFORMACIÓN DEL USUARIO:
            > 👤 **Usuario**: <@${user.id}> \`${user.username}\` 
            ### INFORMACIÓN DEL TICKET:
            > ✅  **Canal**: <#${channel.id}> \`#${channel.name}\`
            > 📍 **ID del canal**: \`${channel.id}\``
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
        console.error('Error al registrar la creación del ticket de verificación:', error);
    }
}

/**
 * Envía un mensaje privado al usuario informando sobre el resultado de su verificación
 * @param {User} user - El usuario al que enviar el mensaje
 * @param {boolean} wasVerified - Si el usuario fue verificado exitosamente o no
 * @param {string} staffMemberName - Nombre del miembro del staff (opcional)
 */
export async function sendVerificationStatusDM(user, wasVerified, staffMemberName = null) {
    try {
        const container = new ContainerBuilder();

        if (wasVerified) {
            // Mensaje para verificación exitosa
            const mensajeVerificado = new TextDisplayBuilder()
                .setContent(`# <:verificado:1288628715982553188> ¡Verificación Exitosa!
                ### <:info:1288631394502709268> Tu cuenta ha sido verificada correctamente
                > ¡Felicidades! Tu cuenta ha sido **verificada exitosamente** por el staff de la **Delegación de Alumnos de Industriales**.
                > 
                > Ahora tienes acceso a **todos los canales del servidor** y podrás participar en eventos exclusivos de la EEI.`
                );

            container.addTextDisplayComponents(mensajeVerificado);
        } else {
            // Mensaje para ticket cerrado sin verificar
            const mensajeNoVerificado = new TextDisplayBuilder()
                .setContent(`# <:no:1288631410558767156> Ticket de Verificación Cerrado
                ### <:info:1288631394502709268> Tu ticket ha sido cerrado sin verificar
                > Tu ticket de verificación ha sido **cerrado sin completar la verificación**.
                > 
                > Si necesitas verificar tu cuenta, puedes **crear un nuevo ticket** adjuntando **alguna** de la documentación válida:
                > • **Documento de matrícula** de la EEI
                > • **Captura de pantalla de Moovi** en la sección de asignaturas`);

            container.addTextDisplayComponents(mensajeNoVerificado);
        }

        // Separador
        container.addSeparatorComponents(new SeparatorBuilder());

        // Pie del mensaje
        const pieMsg = new TextDisplayBuilder()
            .setContent('-# <:dai:1288623399672741930> Delegación de Alumnos de Industriales - UVigo · **Verificación de Usuarios**');

        container.addTextDisplayComponents(pieMsg);

        // Enviar mensaje privado
        await user.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        });
    } catch (error) {
        console.error('Error al enviar mensaje privado de verificación:', error);
    }
}
