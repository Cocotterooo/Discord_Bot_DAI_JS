import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from 'discord.js'
import { iniciarReunion, finalizarReunion } from './asistencia/reunionHandlers.js'

export default {
  data: new SlashCommandBuilder()
    .setName('asistencia')
    .setDescription('Gestiona reuniones y registro de asistencia')
    .addSubcommand(subcommand =>
      subcommand
        .setName('iniciar')
        .setDescription('Inicia una reunión en el canal de voz actual')
        .addStringOption(option =>
          option
            .setName('título')
            .setDescription('Título de la reunión')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('finalizar')
        .setDescription('Finaliza la reunión activa')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand()

    switch (subcommand) {
      case 'iniciar':
        await iniciarReunion(interaction, client)
        break
      case 'finalizar':
        await finalizarReunion(interaction, client)
        break
    }
  }
}
