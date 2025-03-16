// src/events/inviteCreate.js
export const name = 'inviteCreate'

export function execute (invite, client) {
  const ticketService = client.services.ticketService
  const guildInvites = ticketService.inviteCache.get(invite.guild.id) || new Map()
  guildInvites.set(invite.code, invite.uses)
  ticketService.inviteCache.set(invite.guild.id, guildInvites)
}

export default { name, execute }
