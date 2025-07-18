    import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ButtonBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    MessageFlags,
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder
    } from 'discord.js'
    import { discordConfig } from '../../../../config.js'

    export default {
    data: new SlashCommandBuilder()
        .setName('ins_canales_voz')
        .setDescription('Instala el sistema de canales de voz personalizados')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),

    async execute(interaction, client) {
        try {
        // Responder inmediatamente para evitar timeout
        await interaction.reply({
            content: '<:si:1288631406452412428> Instalando sistema de canales de voz...',
            flags: MessageFlags.Ephemeral
        })

        const CATEGORIA_ID = '1292969422868320397' // Categoría de canales personalizados

        // Verificar que la categoría existe
        const categoria = await client.channels.fetch(CATEGORIA_ID).catch(() => null)
        if (!categoria) {
            return await interaction.editReply({
            content: '<:no:1288631410558767156> No se pudo encontrar la categoría de canales personalizados.'
            })
        }

        // Crear los botones numerados del 2 al 10
        const buttons = []
        const boton2 = new ButtonBuilder()
            .setCustomId('canal_voz_2')
            .setEmoji('2️⃣')
            .setStyle('Secondary')
        const boton3 = new ButtonBuilder()
            .setCustomId('canal_voz_3')
            .setEmoji('3️⃣')
            .setStyle('Secondary')
        const boton4 = new ButtonBuilder()
            .setCustomId('canal_voz_4')
            .setEmoji('4️⃣')
            .setStyle('Secondary')
        const boton5 = new ButtonBuilder()
            .setCustomId('canal_voz_5')
            .setEmoji('5️⃣')
            .setStyle('Secondary')
        const boton6 = new ButtonBuilder()
            .setCustomId('canal_voz_6')
            .setEmoji('6️⃣')
            .setStyle('Secondary')
        const boton7 = new ButtonBuilder()
            .setCustomId('canal_voz_7')
            .setEmoji('7️⃣')
            .setStyle('Secondary')
        const boton8 = new ButtonBuilder()
            .setCustomId('canal_voz_8')
            .setEmoji('8️⃣')
            .setStyle('Secondary')
        const boton9 = new ButtonBuilder()
            .setCustomId('canal_voz_9')
            .setEmoji('9️⃣')
            .setStyle('Secondary')
        const boton10 = new ButtonBuilder()
            .setCustomId('canal_voz_10')
            .setEmoji('🔟')
            .setStyle('Secondary')

        buttons.push(boton2, boton3, boton4, boton5, boton6, boton7, boton8, boton9, boton10)
        // Crear botones de acción
        const row1 = new ActionRowBuilder().addComponents(buttons.slice(0, 5))
        const row2 = new ActionRowBuilder().addComponents(buttons.slice(5, 10))

        // Crear container para el mensaje V2
        const container = new ContainerBuilder()

        // Título principal
        const titulo = new TextDisplayBuilder()
            .setContent('# <a:flecha:1290411623802208257> ¡Crea tu Sala de Voz!\n> Crea un canal de voz personalizado para **trabajar**, **estudiar** o **jugar** con tus amigos; solo **elige la cantidad de usuarios** que podrán unirse a tu canal y **listo**.')

        container.addTextDisplayComponents(titulo)

        // Separador
        container.addSeparatorComponents(new SeparatorBuilder())

        // Detalles
        const detalles = new TextDisplayBuilder()
            .setContent(`## <:moderador:1288628804276977735> **Detalles:**
                        ### 🔊 Crear un canal de Voz:
                        > Para crear un canal, solo pulsa uno de los **botones de debajo**, estos marcan la **cantidad de usuarios** que podrán unirse a él.
                        ### 👤 Cambiar límite de usuarios:
                        > Si ya has creado un canal de voz y quieres cambiar el **límite de usuarios** del mismo, solo selecciona la cantidad que desees en los **botones de debajo**.
                        ### 🔇 Borrado de canales:
                        > Cada usuario puede crear un **solo canal de voz**, este canal desaparecerá si permanece **inactivo durante 10 minutos**. **Cuando aparezca** con el símbolo \`🔇\` significa que **quedan 5 minutos** para desaparecer **si no se vuelve a utilizar**.`)

        container.addTextDisplayComponents(detalles)
        container.addSeparatorComponents(new SeparatorBuilder())
        container.addActionRowComponents(row1)
        container.addActionRowComponents(row2)

        // Separador
        container.addSeparatorComponents(new SeparatorBuilder())

        // Firma
        const firma = new TextDisplayBuilder()
            .setContent('-# <:dai:1288623399672741930>  Delegación de alumnado de industriales - UVigo  ·  **Canales de voz personalizados**')

        container.addTextDisplayComponents(firma)
        container.setAccentColor(discordConfig.COLOR)

        // Enviar al canal actual donde se ejecutó el comando
        await interaction.channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container,]
        })

        await interaction.editReply({
            content: '<:si:1288631406452412428> Sistema de canales de voz personalizados instalado correctamente.'
        })
        } catch (error) {
        console.error('Error al instalar canales de voz:', error)
        await interaction.reply({
            content: '<:no:1288631410558767156> Hubo un error al instalar el sistema de canales de voz.',
            flags: MessageFlags.Ephemeral
        })
        }
    }
    }
