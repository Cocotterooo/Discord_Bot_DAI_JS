import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('ping2')
    .setDescription('Ping pong')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // 🔹 Solo admins pueden verlo y usarlo
    .setDMPermission(false), // 🔹 No disponible en mensajes directos
  async execute (interaction) {
    try {
      const { client } = interaction

      if (!client || !client.ws || typeof client.ws.ping !== 'number') {
        console.error('Client, client.ws, or client.ws.ping is invalid')
        await interaction.reply({ content: 'An error occurred while fetching the ping.', ephemeral: true })
        return
      }

      console.log('Ping2')

      const embed = new EmbedBuilder()
        .setTitle('Pong!')
        .setDescription(`🏓 ${client.ws.ping}ms`)
        .setColor('#e00000')

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      console.error('Error in ping2 command:', error)
      await interaction.reply({ content: 'An error occurred while executing this command.', ephemeral: true })
    }
  }
}
