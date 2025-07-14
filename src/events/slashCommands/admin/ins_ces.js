import { SlashCommandBuilder, PermissionFlagsBits, TextDisplayBuilder, ContainerBuilder, MessageFlags, SectionBuilder, ButtonBuilder, ActionRowBuilder, SeparatorBuilder, SectionComponent, UserSelectMenuBuilder, ThumbnailBuilder } from 'discord.js'
import { discordConfig } from '../../../../config.js';
export default {
    data: new SlashCommandBuilder()
        .setName('ins_ces')
        .setDescription('Inscriptor del CES')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    // MARK
    async execute(interaction, client) {
        // Marca la interacción como respondida no como pensando
        await interaction.reply({
            content: '<:si:1288631406452412428> Inscriptor del CES enviado',
            flags: MessageFlags.Ephemeral
        })
        const container = new ContainerBuilder()
        const title = new TextDisplayBuilder()
            .setContent('# <a:flecha:1290411623802208257> ¡Bienvenid@ a la categoría de CES!')
        container.addTextDisplayComponents(title)
        container.addSeparatorComponents(
            new SeparatorBuilder()
        )
        const introduccion = new TextDisplayBuilder()
            .setContent(
                `## <:chat_ind:1288628721842130976> Configuración de la categoría \n> La categoría es totalemte configurable por el rol <@&${discordConfig.mentions.asociationsRoleIds.ces.coord}>`
            )
        const miniatura = new ThumbnailBuilder({
            media: {
                url: 'https://media.discordapp.net/attachments/1288785370783420416/1394312065568473128/CES_1_1.png?ex=687659cd&is=6875084d&hm=17b05256e15f8657b9453a78221361bc27280b246f249a3c9d0deee2b64b65f6&=&format=webp&quality=lossless&width=912&height=745'
            }
        })
        const seccionInicion = new SectionBuilder()
            .addTextDisplayComponents(introduccion)
            .setThumbnailAccessory(miniatura)
        container.addSectionComponents(seccionInicion)
        container.addSeparatorComponents(
            new SeparatorBuilder()
            .setSpacing(2)
        )
        // Selección del usuario
        const miembros = new TextDisplayBuilder()
            .setContent('## <:us:1288631396364976128> Miembros de CES')
        container.addTextDisplayComponents(miembros)
        const seleccionaUsuario = new TextDisplayBuilder()
            .setContent('### <:verificado:1288628715982553188> Selecciona un usuario')
        const userSelect = new UserSelectMenuBuilder()
            .setCustomId('ins_ces_user_select')
            .setPlaceholder('Selecciona un usuario')
            .setMinValues(1)
            .setMaxValues(1)
        const userSelectSection = new ActionRowBuilder()
            .addComponents(userSelect)
        container.addTextDisplayComponents(seleccionaUsuario)
        container.addActionRowComponents(userSelectSection)

        // Secciones para añadir y quitar miembros
        const nuevosMiembrosTexto = new TextDisplayBuilder()
            .setContent(`### <:entrar:1288631392070012960> Añadir nuevo Miembro\n > Otorgará el rol <@&${discordConfig.mentions.asociationsRoleIds.ces.member}> al usuario`)
        const nuevosMiembrosButton = new ButtonBuilder()
            .setCustomId('ins_ces_nuevos')
            .setLabel('Añadir Miembro')
            .setStyle('Success')
        const nuevosMiembros = new SectionBuilder()
            .addTextDisplayComponents(nuevosMiembrosTexto)
            .setButtonAccessory(nuevosMiembrosButton)
        container.addSectionComponents(nuevosMiembros)

        const eliminarMiembrosTexto = new TextDisplayBuilder()
            .setContent(`### <:salir:1288975442828726374> Eliminar Miembro\n > Eliminará el rol <@&${discordConfig.mentions.asociationsRoleIds.ces.member}> del usuario`)
        const eliminarMiembrosButton = new ButtonBuilder()
            .setCustomId('ins_ces_eliminar')
            .setLabel('Eliminar Miembro')
            .setStyle('Danger')
        const eliminarMiembros = new SectionBuilder()
            .addTextDisplayComponents(eliminarMiembrosTexto)
            .setButtonAccessory(eliminarMiembrosButton)
        container.addSectionComponents(eliminarMiembros)
        // Añadir un separador
        container.addSeparatorComponents(
            new SeparatorBuilder()
        )
        container.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('-# <:dai:1288623399672741930>  Delegación de alumnado de industriales - UVigo · **Categoría de CES**')
        )
        await interaction.channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        })
    },

    // MARK: Lógica
    /**
     * Maneja las interacciones de componentes (botones y menús de selección) del comando ins_ces
     * Esta función se ejecuta cuando el usuario interactúa con los botones o menús del comando
     * @param {Interaction} interaction - La interacción del componente
     * @param {Client} client - El cliente de Discord
     */
    async handleComponentInteraction(interaction, client) {
        // Verificar permisos: solo coordinador del CES y administradores
        const member = interaction.member;
        const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
        const isCesCoordinator = member.roles.cache.has(discordConfig.mentions.asociationsRoleIds.ces.coord);

        if (!isAdmin && !isCesCoordinator) {
            return await interaction.reply({
                content: '<:no:1288631410558767156> No tienes permisos para usar esta función. Solo el coordinador del CES y los administradores pueden usarla.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Variable para almacenar el usuario seleccionado del menú
        let selectedUser = null;

        // Verificar si la interacción es un menú de selección de usuarios
        if (interaction.isUserSelectMenu() && interaction.customId === 'ins_ces_user_select') {
            selectedUser = interaction.values[0]; // Obtener el ID del usuario seleccionado

            // Responder a la interacción del menú de selección
            if (interaction.guild.members.cache.get(selectedUser).roles.cache.has(discordConfig.mentions.asociationsRoleIds.ces.member)) { // Verificar si el usuario ya tiene el rol
                await interaction.reply({
                content: `<:verificado:1288628715982553188> Usuario <@${selectedUser}> seleccionado.\n> El usuario **es** miembro del CES.\n > <:salir:1288975442828726374> Presiona **Eliminar Miembro** para eliminarlo.`,
                flags: MessageFlags.Ephemeral
            })
            } else {
                await interaction.reply({
                content: `<:verificado:1288628715982553188> Usuario <@${selectedUser}> seleccionado.\n> El usuario **no** miembro del CES.\n > <:entrar:1288631392070012960> Presiona **Añadir Miembro** para añadirlo.`,
                flags: MessageFlags.Ephemeral
            })
            }
            // Guardar el usuario seleccionado y el ID de la interacción original
            if (!client.tempData) client.tempData = new Map();
            client.tempData.set(`ces_selected_user_${interaction.user.id}`, selectedUser);
            client.tempData.set(`ces_original_interaction_${interaction.user.id}`, interaction);
            return;
        }

        // Verificar si la interacción es un botón
        if (interaction.isButton()) {
            // Obtener el usuario previamente seleccionado y la interacción original
            if (!client.tempData) client.tempData = new Map();
            selectedUser = client.tempData.get(`ces_selected_user_${interaction.user.id}`);
            const originalInteraction = client.tempData.get(`ces_original_interaction_${interaction.user.id}`);

            // Verificar que hay un usuario seleccionado
            if (!selectedUser) {
                return await interaction.reply({
                    content: '<:no:1288631410558767156> Primero debes **seleccionar un usuario** del menú desplegable.',
                    flags: MessageFlags.Ephemeral
                });
            }

            // Verificar que tenemos la interacción original
            if (!originalInteraction) {
                return await interaction.reply({
                    content: '<:no:1288631410558767156> Error: No se encontró la interacción original. Selecciona un usuario nuevamente.',
                    flags: MessageFlags.Ephemeral
                });
            }

            // ID del rol de miembro del CES desde la configuración
            const memberRoleId = discordConfig.mentions.asociationsRoleIds.ces.member;

            try {
                // Obtener el rol del servidor
                const role = interaction.guild.roles.cache.get(memberRoleId);
                if (!role) {
                    return await interaction.reply({
                        content: '<:no:1288631410558767156> No se pudo encontrar el rol de miembro del CES.',
                        flags: MessageFlags.Ephemeral
                    });
                }

                // Obtener el miembro seleccionado del servidor
                const targetMember = await interaction.guild.members.fetch(selectedUser);
                if (!targetMember) {
                    return await interaction.reply({
                        content: '<:no:1288631410558767156> No se pudo encontrar al usuario seleccionado en el servidor.',
                        flags: MessageFlags.Ephemeral
                    });
                }

                // Manejar el botón de añadir miembro
                if (interaction.customId === 'ins_ces_nuevos') {
                    // Verificar si ya tiene el rol
                    if (targetMember.roles.cache.has(memberRoleId)) {
                        await interaction.deferUpdate();
                        return await originalInteraction.editReply({
                            content: `<:no:1288631410558767156> El usuario <@${selectedUser}> **ya es miembro** del CES.`
                        });
                    }

                    // Responder inmediatamente indicando que se está procesando
                    await interaction.deferUpdate();

                    // Añadir el rol al usuario
                    await targetMember.roles.add(role);

                    // Limpiar la selección del usuario
                    client.tempData.delete(`ces_selected_user_${interaction.user.id}`);
                    client.tempData.delete(`ces_original_interaction_${interaction.user.id}`);

                    // Editar la respuesta con el resultado final
                    await originalInteraction.editReply({
                        content: `<:entrar:1288631392070012960> Se ha añadido a <@${selectedUser}> como **miembro del CES**.\n-# La selección se ha limpiado automáticamente. Selecciona otro usuario si necesitas hacer más acciones.`
                    });
                } else if (interaction.customId === 'ins_ces_eliminar') {
                    // Verificar si tiene el rol
                    if (!targetMember.roles.cache.has(memberRoleId)) {
                        await interaction.deferUpdate();
                        return await originalInteraction.editReply({
                            content: `<:no:1288631410558767156> El usuario <@${selectedUser}> **no es miembro** del CES.`
                        });
                    }

                    // Responder inmediatamente indicando que se está procesando
                    await interaction.deferUpdate();

                    // Remover el rol del usuario
                    await targetMember.roles.remove(role);

                    // Limpiar la selección del usuario
                    client.tempData.delete(`ces_selected_user_${interaction.user.id}`);
                    client.tempData.delete(`ces_original_interaction_${interaction.user.id}`);

                    // Editar la respuesta con el resultado final
                    await originalInteraction.editReply({
                        content: `<:salir:1288975442828726374> Se ha eliminado a <@${selectedUser}> como **miembro del CES**.\n-# La selección se ha limpiado automáticamente. Selecciona otro usuario si necesitas hacer más acciones.`
                    });
                }
            } catch (error) {
                console.error('Error manejando la interacción del CES:', error);

                // Manejo de errores robusto
                try {
                    await interaction.deferUpdate();
                    if (originalInteraction) {
                        await originalInteraction.editReply({
                            content: '<:no:1288631410558767156> Hubo un error al procesar la solicitud. Contacta con un administrador.'
                        });
                    }
                } catch (followUpError) {
                    console.error('Error en el seguimiento del error:', followUpError);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: '<:no:1288631410558767156> Hubo un error al procesar la solicitud. Contacta con un administrador.',
                            flags: MessageFlags.Ephemeral
                        });
                    }
                }
            }
        }
    }
}
