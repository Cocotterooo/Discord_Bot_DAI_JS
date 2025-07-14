import { SlashCommandBuilder } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('asistencia')
    .setDescription('Comando de asistencia'),

  async execute(interaction, client) {
    await interaction.reply('Comando de asistencia funcionando!')
  }
}
