// src/events/guildMemberAdd.js
export const name = 'guildMemberAdd'

export async function execute (member, client) {
  try {
    const ticketService = client.services.ticketService

    // Canal donde se anunciarán las invitaciones
    const anuncioChannel = member.guild.channels.cache.find(
      channel => channel.name === 'invitaciones' || channel.name === 'sorteo'
    )

    if (!anuncioChannel) {
      console.log('No se encontró un canal adecuado para anuncios')
      return
    }

    // Obtener invitaciones actualizadas
    const newInvites = await member.guild.invites.fetch()

    // Encontrar la invitación que se usó
    const usedInvite = ticketService.getUsedInvite(member.guild, newInvites)

    if (usedInvite && usedInvite.inviter) {
      const inviterId = usedInvite.inviter.id

      // Agregar ticket al invitador
      const newTicketCount = ticketService.addTicket(inviterId, 'invitación')

      // Crear embed para el anuncio
      const inviteEmbed = {
        title: '¡Nuevo miembro invitado!',
        color: 0xffc900,
        description: `**${member.user.tag}** ha sido invitado al servidor por **${usedInvite.inviter.tag}**`,
        fields: [
          { name: '<:us:1288631396364976128> Invitador', value: `<@${inviterId}>`, inline: true },
          { name: '🎟️ Tickets actuales', value: `${newTicketCount}`, inline: true }
        ],
        timestamp: new Date(),
        footer: { text: '¡Invita a más amigos para ganar tickets adicionales!' }
      }

      // Enviar mensaje al canal de anuncios
      await anuncioChannel.send({ embeds: [inviteEmbed] })
    }
  } catch (error) {
    console.error('Error al procesar nueva invitación:', error)
  }
}

export default { name, execute }
