// src/slashCommands/tickets/ticketsCommand.js
import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('tickets')
  .setDescription('Muestra cuántos tickets tienes para el sorteo')

export async function execute (interaction, client) {
  const ticketService = client.services.ticketService
  const userId = interaction.user.id
  const ticketCount = ticketService.getTickets(userId)

  const ticketsEmbed = {
    title: '🎫 Tus Tickets',
    color: 0x3498DB,
    description: `Tienes **${ticketCount}** ticket(s) para el sorteo.`,
    footer: { text: 'Invita a más amigos para ganar tickets adicionales' }
  }

  await interaction.reply({ embeds: [ticketsEmbed], ephemeral: true })
}

export default { data, execute }
