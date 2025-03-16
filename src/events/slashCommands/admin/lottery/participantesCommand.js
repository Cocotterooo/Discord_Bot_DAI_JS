// src/slashCommands/admin/participantesCommand.js
import { SlashCommandBuilder } from 'discord.js'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const data = new SlashCommandBuilder()
  .setName('participantes')
  .setDescription('Muestra todos los participantes del sorteo y sus tickets')
  .setDefaultMemberPermissions(0x0000000000000008) // ADMINISTRATOR permission

export async function execute (interaction, client) {
  const ticketService = client.services.ticketService
  const ticketsData = ticketService.getAllTickets()

  let totalTickets = 0
  let totalParticipants = 0

  // Crear un archivo PDF
  const doc = new PDFDocument()
  const pdfPath = path.join(__dirname, 'participantes.pdf')
  doc.pipe(fs.createWriteStream(pdfPath))

  // Añadir título al PDF
  doc.fontSize(20).text('Lista de Participantes del Sorteo', { align: 'center' })
  doc.moveDown()

  // Construir la lista de participantes en el PDF
  for (const [userId, data] of Object.entries(ticketsData)) {
    try {
      const user = await client.users.fetch(userId)
      doc.fontSize(12).text(`• ${user.username}#${user.discriminator} (ID: ${userId})`, { continued: true })
      doc.text(` - Tickets: ${data.tickets}`, { align: 'right' })
    } catch (error) {
      doc.fontSize(12).text(`• Usuario no encontrado (ID: ${userId})`, { continued: true })
      doc.text(` - Tickets: ${data.tickets}`, { align: 'right' })
    }
    totalTickets += data.tickets
    totalParticipants++
  }

  // Añadir resumen al PDF
  doc.moveDown()
  doc.fontSize(14).text('Resumen:', { underline: true })
  doc.fontSize(12).text(`Total de participantes: ${totalParticipants}`)
  doc.text(`Total de tickets: ${totalTickets}`)

  // Finalizar el PDF
  doc.end()

  // Crear el embed de resumen
  const summaryEmbed = {
    title: '🎟️ Participantes del Sorteo',
    color: 0xE74C3C,
    fields: [
      { name: 'Total de participantes', value: `${totalParticipants}`, inline: true },
      { name: 'Total de tickets', value: `${totalTickets}`, inline: true }
    ],
    timestamp: new Date()
  }

  // Enviar el embed de resumen
  await interaction.reply({ embeds: [summaryEmbed], files: [pdfPath] })

  // Eliminar el archivo PDF después de enviarlo
  fs.unlink(pdfPath, (err) => {
    if (err) console.error('Error al eliminar el archivo PDF:', err)
  })
}

export default { data, execute }
