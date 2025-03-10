import {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('ping3')
    .setDescription('Ping pong')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // 🔹 Solo admins pueden verlo y usarlo
    .setDMPermission(false), // 🔹 No disponible en mensajes directos
  async execute (client, interaction) {
    // Crear el embed
    const embed = new EmbedBuilder()
      .setTitle('Pong!')
      .setDescription(`🏓 ${client.ws.ping}ms`)
      .setColor('#e00000')

    // Crear el botón
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('miBoton')
        .setLabel('Haz clic aquí')
        .setStyle(ButtonStyle.Primary)
    )

    // Enviar el mensaje con el embed y el botón
    await interaction.reply({ embeds: [embed], components: [row] })

    // Crear un collector para manejar el clic en el botón
    const filter = (i) => i.customId === 'ping_button' && i.user.id === interaction.user.id
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 })

    collector.on('collect', async (i) => {
      await interaction.followUp({
        content: 'Secret Pong!',
        flags: MessageFlags.Ephemeral,
        allowed_mentions: {
          parse: []
        }
      })
    })

    collector.on('end', () => {
      console.log('Se cerró la interacción del botón.')
    })
  }
}
