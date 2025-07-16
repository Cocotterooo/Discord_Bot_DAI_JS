import { SlashCommandBuilder, PermissionFlagsBits, TextDisplayBuilder, ContainerBuilder, MessageFlags, SectionBuilder, ButtonBuilder, ActionRowBuilder, SeparatorBuilder, SectionComponent } from 'discord.js'

import { discordConfig } from '../../../../config.js'
export default {
    data: new SlashCommandBuilder()
        .setName('staffroles')
        .setDescription('Selector de roles del staff')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

    async execute(interaction, client) {
        // Marca la interacción como respondida no como pensando
        await interaction.reply({
            content: '<:si:1288631406452412428> Selector de roles enviado',
            flags: MessageFlags.Ephemeral
        })
        const container = new ContainerBuilder()
        const title = new TextDisplayBuilder()
        .setContent('# <a:flecha:1290411623802208257> Selecciona o solicita tus roles.')
        container.addTextDisplayComponents(title)
        container.addSeparatorComponents(
            new SeparatorBuilder()
        )
        const introduccion = new TextDisplayBuilder()
        .setContent(
            '**Selecciona**, **elimina** o **solicita** los roles que pertenezcan a las **funciones que desempeñas** en la **Delegación de Alumnos de Industriales**. Si tienes dudas, contacta con <@&1288552528484630598>.'
        )
        container.addTextDisplayComponents(introduccion)

        const roles = new TextDisplayBuilder()
        .setContent(`### <:escudo:1288628696391090299> Directiva:
        > <@&1292466209165414411> 
        > <@&1292466392439722016> 
        > <@&1292467283284852888> 
        > <@&1292467186320805948> 
        ### <:escudo:1288628696391090299> Directiva Extendida:
        > <@&1292472596146815037> 
        > <@&1296745099497312267> 
        > <@&1299901349994954794> 
        > <@&1299901080745934888> 
        ### <:us:1288631396364976128> Comisiones Delegadas:
        > <@&1292466487247896699>
        > <@&1292466970687442984>
        > <@&1292468137845067776>
        > <@&1292466863707521167>
        ### <:exclamacion:1288628819548176514> Especiales:
        > <@&1288552528484630598> <:desarrollador:1288628718423638037>
        > <@&1288206919118618839> <:moderador:1288628804276977735>
        > <@&1288553111119462451>
        `)

        container.addTextDisplayComponents(roles)
        container.addSeparatorComponents(
            new SeparatorBuilder()
        )
        // MARK: Selección de roles
        // Selección de la comisión deseada
        const seleccionaComision = new TextDisplayBuilder()
        .setContent('## <:verificado:1288628715982553188> Selecciona tu comision \n> Para **obtener** o **eliminar** un rol de la o las comisiones a las que perteneces, **solo haz click en los botones.**')
        container.addTextDisplayComponents(seleccionaComision)
        // Botones para las comisiones
        const buttonInfra = new ButtonBuilder()
        .setCustomId('com_infra')
        .setLabel('Infraestructuras')
        .setStyle('Secondary')
        .setEmoji('🔧')
        const buttonComunicacion = new ButtonBuilder()
        .setCustomId('com_comunicacion')
        .setLabel('Comunicación')
        .setStyle('Secondary')
        .setEmoji('📢')
        const buttonDeportes = new ButtonBuilder()
        .setCustomId('com_deportes')
        .setLabel('Ocio y Deportes')
        .setStyle('Secondary')
        .setEmoji('⚽')
        const buttonExteriores = new ButtonBuilder()
        .setCustomId('com_exteriores')
        .setLabel('Exteriores')
        .setStyle('Secondary')
        .setEmoji('🫂')

        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(buttonInfra, buttonExteriores, buttonDeportes, buttonComunicacion)
        )

        const rolesEspeciales = new TextDisplayBuilder()
        .setContent(`## <:verificado:1288628715982553188> Roles Especiales
        > Para obtener un rol de las secciones **Directiva**, **Directiva Extendida** o **Especiales**, contacta con <@&1288552528484630598>.`)
        container.addTextDisplayComponents(rolesEspeciales)
        container.addSeparatorComponents(
            new SeparatorBuilder()
        )

        const firma = new TextDisplayBuilder()
        .setContent('-# <:dai:1288623399672741930>  Delegación de alumnado de industriales - UVigo  ·  **Selección de roles**')

        container.addTextDisplayComponents(firma)
        container.setAccentColor(discordConfig.COLOR)

        await interaction.channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        })
    }
}
