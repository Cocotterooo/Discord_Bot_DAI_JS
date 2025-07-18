    import { MessageFlags, ChannelType, PermissionFlagsBits, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder } from 'discord.js'

    // Store para manejar los canales activos
    const activeChannels = new Map()
    const channelTimeouts = new Map()
    const channelLimits = new Map()

    export async function handleVoiceChannelButton(interaction, client, limit) {
    try {
        const CATEGORIA_ID = '1292969422868320397'
        const guild = interaction.guild
        const user = interaction.user
        const userName = user.username

        // Verificar que la categoría existe
        const categoria = guild.channels.cache.get(CATEGORIA_ID)
        if (!categoria) {
        return await interaction.reply({
            content: '<:no:1288631410558767156> No se pudo encontrar la categoría de canales personalizados.',
            flags: MessageFlags.Ephemeral
        })
        }

        // Buscar si ya existe un canal para este usuario
        const canalExistente = categoria.children.cache.find(channel =>
        channel.name.includes(userName.toLowerCase()) &&
        (channel.name.startsWith('🔊⦙') || channel.name.startsWith('🔇⦙'))
        )

        if (canalExistente) {
        // Si ya tiene un canal, solo cambiar el límite
        await canalExistente.setUserLimit(limit)
        channelLimits.set(canalExistente.id, limit)

        return await interaction.reply({
            content: `<:si:1288631406452412428> Se ha modificado el **límite de usuarios** a \`${limit}\` usuarios.`,
            flags: MessageFlags.Ephemeral
        })
        }

        // Crear nuevo canal
        const canalVoz = await guild.channels.create({
        name: `🔊⦙${userName}`,
        type: ChannelType.GuildVoice,
        parent: CATEGORIA_ID,
        userLimit: limit,
        permissionOverwrites: [
            {
            id: guild.roles.everyone.id,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.Connect,
                PermissionFlagsBits.Speak
            ]
            }
        ]
        })

        // Registrar el canal como activo
        activeChannels.set(canalVoz.id, {
        userId: user.id,
        userName,
        createdAt: Date.now(),
        limit
        })
        channelLimits.set(canalVoz.id, limit)

        // Log de creación
        await logChannelCreation(client, user, canalVoz, limit)

        // Iniciar timer de inactividad inmediatamente ya que el canal está vacío
        startInactivityTimer(canalVoz.id, client)

        await interaction.reply({
        content: `<:si:1288631406452412428> Se ha creado el canal de voz ${canalVoz} con un **límite** de \`${limit}\` usuarios.`,
        flags: MessageFlags.Ephemeral
        })
    } catch (error) {
        console.error('Error al crear canal de voz:', error)
        await interaction.reply({
        content: '<:no:1288631410558767156> Hubo un error al crear el canal de voz.',
        flags: MessageFlags.Ephemeral
        })
    }
    }

    export function startInactivityTimer(channelId, client) {
    // Limpiar timeout existente si existe
    if (channelTimeouts.has(channelId)) {
        clearTimeout(channelTimeouts.get(channelId))
        channelTimeouts.delete(channelId)
    }

    // Primer timeout: cambiar a 🔇 después de 5 minutos
    const warningTimeout = setTimeout(async () => {
        try {
        const channel = await client.channels.fetch(channelId).catch(() => null)
        if (!channel) return

        if (channel.members.size === 0) {
            const channelData = activeChannels.get(channelId)
            if (channelData) {
            await channel.setName(`🔇⦙${channelData.userName}`)

            // Segundo timeout: eliminar después de otros 5 minutos
            const deleteTimeout = setTimeout(async () => {
                await deleteInactiveChannel(channelId, client)
            }, 5 * 60 * 1000) // 5 minutos

            channelTimeouts.set(channelId, deleteTimeout)
            }
        }
        } catch (error) {
        console.error('Error en warning timeout:', error)
        }
    }, 5 * 60 * 1000) // 5 minutos

    channelTimeouts.set(channelId, warningTimeout)
    }

    export function stopInactivityTimer(channelId) {
    if (channelTimeouts.has(channelId)) {
        clearTimeout(channelTimeouts.get(channelId))
        channelTimeouts.delete(channelId)
    }
    }

    export async function deleteInactiveChannel(channelId, client) {
    try {
        const channel = await client.channels.fetch(channelId).catch(() => null)
        if (!channel) return

        const channelData = activeChannels.get(channelId)
        if (!channelData) return

        // Enviar mensaje privado al usuario
        try {
        const user = await client.users.fetch(channelData.userId)
        const container = new ContainerBuilder()

        const mensaje = new TextDisplayBuilder()
            .setContent(`## 🔇 Canal de voz eliminado
                        > Tu canal de voz **${channel.name}** ha sido **eliminado automáticamente** por **inactividad**.
                        > 
                        > Puedes **crear uno** nuevo **cuando quieras**.`)

        container.addTextDisplayComponents(mensaje)
        container.addSeparatorComponents(new SeparatorBuilder())

        const firma = new TextDisplayBuilder()
            .setContent('-# <:dai:1288623399672741930>  Delegación de alumnado de industriales - UVigo  ·  **Canales Temporales**')

        container.addTextDisplayComponents(firma)

        await user.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        })
        } catch (error) {
        console.log('No se pudo enviar mensaje privado al usuario:', error.message)
        }

        // Log de eliminación
        await logChannelDeletion(client, channelData, channel)

        // Eliminar el canal
        await channel.delete('Canal inactivo por más de 10 minutos')

        // Limpiar datos
        activeChannels.delete(channelId)
        channelTimeouts.delete(channelId)
        channelLimits.delete(channelId)
    } catch (error) {
        console.error('Error al eliminar canal inactivo:', error)
    }
    }

    export async function cleanupExistingChannels(client) {
    try {
        const CATEGORIA_ID = '1292969422868320397'
        const PROTECTED_CHANNEL_ID = '1292969525607927928'

        const categoria = await client.channels.fetch(CATEGORIA_ID).catch(() => null)
        if (!categoria) return

        const channels = categoria.children.cache.filter(channel =>
        channel.type === ChannelType.GuildVoice &&
        channel.id !== PROTECTED_CHANNEL_ID &&
        (channel.name.startsWith('🔊⦙') || channel.name.startsWith('🔇⦙'))
        )

        for (const [channelId, channel] of channels) {
        try {
            await channel.delete('Limpieza al iniciar el bot')
            console.log(`🗑️ Canal de voz eliminado: ${channel.name}`)
        } catch (error) {
            console.error(`Error al eliminar canal ${channel.name}:`, error)
        }
        }

        console.log(`✅ Se eliminaron ${channels.size} canales de voz personalizados`)
    } catch (error) {
        console.error('Error en limpieza de canales:', error)
    }
    }

    async function logChannelCreation(client, user, channel, limit) {
    try {
        const LOG_CHANNEL_ID = '1395110127614296165'
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID)

        const fecha = new Date()
        const fechaFormateada = fecha.toLocaleString('es-ES', {
        timeZone: 'Europe/Madrid',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
        })

        const container = new ContainerBuilder()

        const infoCanal = new TextDisplayBuilder()
        .setContent(`## 🔊 📝 **CANAL DE VOZ CREADO** <@${user.id}>
        > 📅 Fecha y hora de **creación**: \`${fechaFormateada}\`
        > 👤 **Usuario**: <@${user.id}> \`${user.username}\`
        > 🔊 **Canal**: <#${channel.id}> \`#${channel.name}\`
        > 👥 **Límite de usuarios**: \`${limit}\`
        > 📍 **ID del canal**: \`${channel.id}\``)

        container.addTextDisplayComponents(infoCanal)
        container.addSeparatorComponents(new SeparatorBuilder())

        const firma = new TextDisplayBuilder()
        .setContent('-# <:dai:1288623399672741930>  Delegación de alumnado de industriales - UVigo  ·  **Canales Temporales**')

        container.addTextDisplayComponents(firma)

        await logChannel.send({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
        allowedMentions: { parse: [] }
        })
    } catch (error) {
        console.error('Error al registrar creación del canal:', error)
    }
    }

    async function logChannelDeletion(client, channelData, channel) {
    try {
        const LOG_CHANNEL_ID = '1395110127614296165'
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID)

        const fecha = new Date()
        const fechaFormateada = fecha.toLocaleString('es-ES', {
        timeZone: 'Europe/Madrid',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
        })

        const container = new ContainerBuilder()

        const infoCanal = new TextDisplayBuilder()
        .setContent(`## 🔇 🗑️ **CANAL DE VOZ ELIMINADO** <@${channelData.userId}>
        > 📅 Fecha y hora de **eliminación**: \`${fechaFormateada}\`
        > 👤 **Usuario**: <@${channelData.userId}> \`${channelData.userName}\`
        > 🔇 **Canal eliminado**: \`#${channel.name}\`
        > 👥 **Límite de usuarios**: \`${channelData.limit}\`
        > 📍 **ID del canal**: \`${channel.id}\``)

        container.addTextDisplayComponents(infoCanal)
        container.addSeparatorComponents(new SeparatorBuilder())

        const firma = new TextDisplayBuilder()
        .setContent('-# <:dai:1288623399672741930>  Delegación de alumnado de industriales - UVigo  ·  **Canales Temporales**')

        container.addTextDisplayComponents(firma)

        await logChannel.send({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
        allowedMentions: { parse: [] }
        })
    } catch (error) {
        console.error('Error al registrar eliminación del canal:', error)
    }
    }

    export { activeChannels, channelTimeouts, channelLimits }
