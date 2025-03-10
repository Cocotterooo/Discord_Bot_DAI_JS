import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Ping pong'),

  async execute (client, interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Pong!')
      .setDescription(`🏓 ${client.ws.ping}ms`)
      .setColor('#00ace2')

    await interaction.reply({ embeds: [embed] })
  }
}
