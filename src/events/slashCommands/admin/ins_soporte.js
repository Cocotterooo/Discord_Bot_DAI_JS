import { SlashCommandBuilder, PermissionFlagsBits, TextDisplayBuilder, ContainerBuilder, MessageFlags, SectionBuilder, ButtonBuilder, ActionRowBuilder, SeparatorBuilder, SectionComponent, UserSelectMenuBuilder, ThumbnailBuilder } from 'discord.js'
import { discordConfig } from '../../../../config.js';
export default {
    data: new SlashCommandBuilder()
        .setName('ins_soporte')
        .setDescription('Creador de canales de soporte y verificación de la DAI')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    // MARK: Mensaje de inscripción
    async execute(interaction, client) {
        // Marca la interacción como respondida no como pensando
        await interaction.reply({
            content: '<:si:1288631406452412428> Creador de canales de soporte y verificación de la DAI enviado',
            flags: MessageFlags.Ephemeral
        })
        const container = new ContainerBuilder()
        const title = new TextDisplayBuilder()
            .setContent('# <:dai:1288623399672741930>  Soporte y Verificación')
        container.addTextDisplayComponents(title)
        container.addSeparatorComponents(
            new SeparatorBuilder()
        )
        // MARK: TICKETS
        // Sección de tickets con thumbnail
        const ticketsText = new TextDisplayBuilder()
            .setContent(
                '## 🎫 Crea un Ticket para recibir ayuda de la administración. \n> Una vez creado, **descríbenos tu duda o problema** para que podamos asistirte de manera adecuada.\n> \n> Nos esforzaremos por ayudarte lo antes posible.'
            )
        const ticketsMiniatura = new ThumbnailBuilder({
            media: {
                url: 'https://cdn.discordapp.com/attachments/1288785370783420416/1395093555537510421/ayudenme-bubbles.gif?ex=6879319f&is=6877e01f&hm=18fa0781e4891fc3b5fd8424e3a9b8d66cb4c46cb8dc8347f01c0d33b736da3a&'
            }
        })
        const ticketsSection = new SectionBuilder()
            .addTextDisplayComponents(ticketsText)
            .setThumbnailAccessory(ticketsMiniatura)
        container.addSectionComponents(ticketsSection)
        // Boton de ticket
        const ticketsButton = new ButtonBuilder()
            .setCustomId('ins_soporte_tickets')
            .setLabel('Crea un Ticket si necesitas ayuda ❓')
            .setStyle('Primary')
            .setEmoji('🎫')
        const ticketRow = new ActionRowBuilder()
            .addComponents(ticketsButton)
        container.addActionRowComponents(ticketRow)
        container.addSeparatorComponents(
            new SeparatorBuilder()
            .setDivider(false)
            .setSpacing(2)
        )
        // MARK: VERIFICACIÓN
        const verificacionText = new TextDisplayBuilder()
            .setContent(
                '## <:verificado:1288628715982553188> Verifica tu cuenta para acceder a todos los canales del servidor.\n> Para obtener **acceso a eventos exclusivos de la EEI**, así como a **canales privados y de apuntes**, **verifica que eres estudiante de la EEI** enviándonos tu **matrícula** o una **captura de Moovi**. \n> \n> Procesaremos tu verificación a la mayor brevedad posible.'
            )
        const verifiacionMiniatura = new ThumbnailBuilder({
            media: {
                url: 'https://cdn.discordapp.com/attachments/1288785370783420416/1395093537917239527/verify.gif?ex=6879319b&is=6877e01b&hm=3d14cfe3a43702be216ed8c6755929fbb6caf138d1fc3eaabd5c4fbd66f78cca&'
            }
        })
        const verificacionSection = new SectionBuilder()
            .addTextDisplayComponents(verificacionText)
            .setThumbnailAccessory(verifiacionMiniatura)
        container.addSectionComponents(verificacionSection)
        const verificacionButton = new ButtonBuilder()
            .setCustomId('ins_soporte_verificacion')
            .setLabel('Verifica tu cuenta si estudias en la EEI 🙂')
            .setStyle('Success')
            .setEmoji('<:verificado:1288628715982553188>')
        const verifRow = new ActionRowBuilder()
            .addComponents(verificacionButton)
        container.addActionRowComponents(verifRow)
        container.addSeparatorComponents(
            new SeparatorBuilder()
        )
        // Firma
        const firma = new TextDisplayBuilder()
            .setContent('-# <:dai:1288623399672741930>  Delegación de alumnado de industriales - UVigo · **Soporte y Verificación**')
        container.addTextDisplayComponents(firma)
        container.setAccentColor(discordConfig.COLOR)
        // Enviar el mensaje
        await interaction.channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        })
    }
}
