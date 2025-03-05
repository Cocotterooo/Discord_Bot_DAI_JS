import { PresenceUpdateStatus } from 'discord.js'

export async function stateError (client) {
  try {
    await client.user.setPresence({ status: PresenceUpdateStatus.DoNotDisturb })
    console.log('🔴 Estado del bot actualizado a No molestar')
  } catch (presenceError) {
    console.error('❌ Error al actualizar el estado del bot:', presenceError.message)
  }
}

export async function stateReady (client) {
  await client.user.setPresence({ status: PresenceUpdateStatus.Online }).then(() => {
    console.log('🟢 Estado del bot actualizado a En línea')
  })
}
