import { MessageFlags } from 'discord.js'
import { getReunionActiva, setReunionActiva, clearReunionActiva } from './reunionStore.js'
import { generarReporteReunion } from './reportUtils.js'

// MARK: 🟡🟡 Configurar listeners de voz
export function configurarListeners(client) {
  if (client.reunionListenersConfigured) return

  client.on('voiceStateUpdate', async (oldState, newState) => {
    await manejarCambioVoz(oldState, newState, client)
  })

  client.reunionListenersConfigured = true
}

async function manejarCambioVoz(oldState, newState, client) {
  const reunionActiva = getReunionActiva()
  if (!reunionActiva) return

  const userId = newState.member.id
  const oldChannelId = oldState.channelId
  const newChannelId = newState.channelId
  const reunionChannelId = reunionActiva.canal

  // MARK: 🟡 Usuario se unió al canal de la reunión
  if (!oldChannelId && newChannelId === reunionChannelId) {
    reunionActiva.participantes.set(userId, {
      joinTime: Date.now(),
      leaveTime: null,
      totalTime: reunionActiva.participantes.get(userId)?.totalTime || 0,
      displayName: newState.member.displayName,
      username: newState.member.user.username
    })
  }

  // MARK: 🟡 Usuario salió del canal de la reunión
  if (oldChannelId === reunionChannelId && !newChannelId) {
    const participante = reunionActiva.participantes.get(userId)
    if (participante && participante.joinTime) {
      const tiempoSesion = Date.now() - participante.joinTime
      participante.totalTime += tiempoSesion
      participante.leaveTime = Date.now()
      participante.joinTime = null
    }

    // Verificar si el canal está vacío
    const canal = client.channels.cache.get(reunionChannelId)
    if (canal && canal.members.size === 0) {
      // Canal vacío, finalizar reunión automáticamente
      await finalizarReunionAutomatica(reunionActiva, client)
    }
  }

  // MARK: 🟡 Usuario cambió de canal y salió del canal de la reunión
  if (oldChannelId === reunionChannelId && newChannelId && newChannelId !== reunionChannelId) {
    const participante = reunionActiva.participantes.get(userId)
    if (participante && participante.joinTime) {
      const tiempoSesion = Date.now() - participante.joinTime
      participante.totalTime += tiempoSesion
      participante.leaveTime = Date.now()
      participante.joinTime = null
    }

    // Verificar si el canal está vacío
    const canal = client.channels.cache.get(reunionChannelId)
    if (canal && canal.members.size === 0) {
      await finalizarReunionAutomatica(reunionActiva, client)
    }
  }

  // MARK: 🟡 Usuario cambió de canal y se unió al canal de la reunión
  if (oldChannelId && oldChannelId !== reunionChannelId && newChannelId === reunionChannelId) {
    reunionActiva.participantes.set(userId, {
      joinTime: Date.now(),
      leaveTime: null,
      totalTime: reunionActiva.participantes.get(userId)?.totalTime || 0,
      displayName: newState.member.displayName,
      username: newState.member.user.username
    })
  }
}

// MARK: 📩 Finalizar reunión automáticamente si el canal queda vacío
async function finalizarReunionAutomatica(reunion, client) {
  reunion.activa = false
  reunion.fechaFin = Date.now()

  // Finalizar tiempos de participantes activos
  reunion.participantes.forEach((participante, userId) => {
    if (participante.joinTime) {
      const tiempoSesion = Date.now() - participante.joinTime
      participante.totalTime += tiempoSesion
      participante.leaveTime = Date.now()
      participante.joinTime = null
    }
  })

  // Limpiar la reunión activa
  clearReunionActiva()

  // Enviar reporte automático al canal donde se inició
  const canal = client.channels.cache.get(reunion.canal)
  if (canal) {
    const container = await generarReporteReunion(reunion, canal.guild)
    await canal.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
      allowedMentions: { parse: [] }
    })
  }
}
