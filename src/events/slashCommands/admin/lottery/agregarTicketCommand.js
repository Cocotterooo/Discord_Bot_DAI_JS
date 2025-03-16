// src/slashCommands/admin/agregarTicketCommand.js
import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('agregar_ticket')
  .setDescription('Agrega tickets a un usuario (solo para administradores)')
  .setDefaultMemberPermissions(0x0000000000000008) // ADMINISTRATOR permission
  .addUserOption(option =>
    option
      .setName('usuario')
      .setDescription('Usuario al que se le agregará un ticket')
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option
      .setName('cantidad')
      .setDescription('Cantidad de tickets a agregar')
      .setRequired(true)
      .setMinValue(1)
  )

export async function execute (interaction, client) {
  const ticketService = client.services.ticketService
  const targetUser = interaction.options.getUser('usuario')
  const cantidad = interaction.options.getInteger('cantidad')

  // Verificar que se proporcionaron todos los parámetros
  if (!targetUser || !cantidad) {
    await interaction.reply({
      content: 'Debes especificar un usuario y una cantidad de tickets.',
      ephemeral: true
    })
    return
  }

  // Agregar tickets
  let ticketCount = ticketService.getTickets(targetUser.id)

  for (let i = 0; i < cantidad; i++) {
    ticketCount = ticketService.addTicket(targetUser.id)
  }

  const ticketEmbed = {
    title: '🎫 Tickets Agregados',
    color: 0x2ECC71,
    description: `Se han agregado **${cantidad}** ticket(s) a ${targetUser.tag}`,
    fields: [
      { name: 'Usuario', value: `<@${targetUser.id}>`, inline: true },
      { name: 'Tickets actuales', value: `${ticketCount}`, inline: true }
    ],
    timestamp: new Date()
  }

  await interaction.reply({ embeds: [ticketEmbed] })
}

export default { data, execute }
