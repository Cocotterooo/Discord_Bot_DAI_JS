import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('ping2')
    .setDescription('Ping pong')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // 🔹 Solo admins pueden verlo y usarlo
    .setDMPermission(false), // 🔹 No disponible en mensajes directos
  async execute (client, interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Pong!')
      .setDescription(`🏓 ${client.ws.ping}ms`)
      .setColor('#e00000')

    await interaction.reply({ embeds: [embed] })
  }
}
