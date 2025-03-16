// src/slashCommands/admin/addTicketToAllCommand.js
import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('agregar_ticket_a_todos')
  .setDescription('Agrega tickets a todos los usuarios del servidor (solo para administradores)')
  .setDefaultMemberPermissions(0x0000000000000008) // ADMINISTRATOR permission
  .addIntegerOption(option =>
    option
      .setName('cantidad')
      .setDescription('Cantidad de tickets a agregar a cada usuario')
      .setRequired(true)
      .setMinValue(1) // Asegura que el valor sea al menos 1
  )

export async function execute (interaction, client) {
  const ticketService = client.services.ticketService
  const cantidad = interaction.options.getInteger('cantidad')

  // Verificar permisos (ya está cubierto por setDefaultMemberPermissions, pero por si acaso)
  if (!interaction.member.permissions.has('ADMINISTRATOR')) {
    await interaction.reply({
      content: 'No tienes permisos para ejecutar este comando.',
      ephemeral: true
    })
    return
  }

  // Obtener todos los miembros del servidor
  const guild = interaction.guild
  await guild.members.fetch()
  const members = guild.members.cache

  // Contador de usuarios afectados
  let totalUsers = 0

  // Añadir la cantidad de tickets especificada a cada usuario
  members.forEach(member => {
    if (!member.user.bot) { // Ignorar bots
      for (let i = 0; i < cantidad; i++) {
        ticketService.addTicket(member.id)
      }
      totalUsers++
    }
  })

  // Crear un embed para mostrar el resultado
  const ticketEmbed = {
    title: '🎫 Tickets Agregados a Todos',
    color: 0x2ECC71,
    description: `Se han agregado **${cantidad}** ticket(s) a **${totalUsers}** usuarios del servidor.`,
    fields: [
      { name: 'Tickets por usuario', value: `${cantidad}`, inline: true }
    ],
    timestamp: new Date()
  }

  await interaction.reply({ embeds: [ticketEmbed] })
}

export default { data, execute }
