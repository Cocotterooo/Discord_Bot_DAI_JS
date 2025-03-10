import { PresenceUpdateStatus } from 'discord.js'

/**
 * Cambia el estado del bot.
 *
 * @param {object} client - El primer número.
 * @param {string} type - 'error', 'warning' o 'success'.
 * @returns {None}
 */
export async function stateError (client, type = 'error') {
  if (type === 'error') {
    try {
      await client.user.setPresence({ status: PresenceUpdateStatus.DoNotDisturb })
      console.log('🔴 Estado del bot actualizado a No molestar')
    } catch (presenceError) {
      console.error('❌ Error al actualizar el estado del bot:', presenceError.message)
    }
  } else if (type === 'warning') {
    try {
      await client.user.setPresence({ status: PresenceUpdateStatus.Idle })
      console.log('🟡 Estado del bot actualizado a Ausente')
    } catch (presenceError) {
      console.error('❌ Error al actualizar el estado del bot:', presenceError.message)
    }
  } else if (type === 'success') {
    try {
      await client.user.setPresence({ status: PresenceUpdateStatus.Online })
      console.log('🟢 Estado del bot actualizado a En línea')
    } catch (presenceError) {
      console.error('❌ Error al actualizar el estado del bot:', presenceError.message)
    }
  } else {
    console.error('❌ Tipo de estado no válido.')
  }
}
