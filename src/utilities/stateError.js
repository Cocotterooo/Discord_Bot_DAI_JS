import { PresenceUpdateStatus } from 'discord.js';

/**
 * Cambia el estado del bot.
 *
 * @param {object} client - El cliente de Discord.
 * @param {string} type - 'error', 'warning' o 'success'.
 * @returns {None}
 */
export async function stateError(client, type = 'error') {
  try {
    if (type === 'error') {
      await client.user?.setPresence({ status: PresenceUpdateStatus.DoNotDisturb });
      console.log('🔴 Estado del bot actualizado a No molestar');
    } else if (type === 'warning') {
      await client.user?.setPresence({ status: PresenceUpdateStatus.Idle });
      console.log('🟡 Estado del bot actualizado a Ausente');
    } else if (type === 'success') {
      await client.user?.setPresence({ status: PresenceUpdateStatus.Online });
      console.log('🟢 Estado del bot actualizado a En línea');
    } else {
      console.error('❌ Tipo de estado no válido.');
    }
  } catch (presenceError) {
    console.error('❌ Error al actualizar el estado del bot:', presenceError.message);
  }
}
