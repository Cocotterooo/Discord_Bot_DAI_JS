// src/slashCommands/admin/sortearCommand.js
import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('sortear')
  .setDescription('Realiza el sorteo y selecciona un ganador')
  .setDefaultMemberPermissions(0x0000000000000008) // ADMINISTRATOR permission

export async function execute (interaction, client) {
  const ticketService = client.services.ticketService
  const ticketsData = ticketService.getAllTickets()

  // Crear lista ponderada por cantidad de tickets
  const participants = []

  for (const [userId, data] of Object.entries(ticketsData)) {
    for (let i = 0; i < data.tickets; i++) {
      participants.push(userId)
    }
  }

  if (participants.length === 0) {
    await interaction.reply('No hay participantes en el sorteo.')
    return
  }

  // Seleccionar un ganador al azar
  const winnerIndex = Math.floor(Math.random() * participants.length)
  const winnerId = participants[winnerIndex]

  try {
    const winner = await client.users.fetch(winnerId)

    const winnerEmbed = {
      title: '🎉 ¡Resultado del Sorteo! 🎉',
      color: 0xFFD700,
      description: `¡Felicidades a **${winner.tag}** por ganar el sorteo!`,
      fields: [
        { name: 'Ganador', value: `<@${winnerId}>`, inline: true },
        { name: 'Tickets utilizados', value: `${ticketsData[winnerId].tickets}`, inline: true },
        { name: 'Total de participaciones', value: `${participants.length}`, inline: true }
      ],
      timestamp: new Date()
    }

    await interaction.reply({ embeds: [winnerEmbed] })
  } catch (error) {
    console.error('Error al anunciar al ganador:', error)
    await interaction.reply(`¡El usuario con ID ${winnerId} ha ganado el sorteo!`)
  }
}

export default { data, execute }
