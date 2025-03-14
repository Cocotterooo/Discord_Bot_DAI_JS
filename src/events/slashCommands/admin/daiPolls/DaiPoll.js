import { EmbedBuilder } from 'discord.js'
import { discordConfig } from '../../../../../config.js'

export class DaiPoll {
  constructor (title, author, channel, options, secret = 'n', duration) {
    // Datos de la votación
    this.title = title
    this.timeStamp = Date.now()
    this.secret = secret.toUpperCase() === 'Y'
    this.channel = channel
    this.author = author
    this.duration = duration
    this.end_time = Date.now() + (duration * 1000) // Convertir segundos a milisegundos
    this.options = options.trim().split(', ') // Separar las opciones por coma y espacio
    this.totalVotes = {
      totalVotes: 0,
      options: this.options.map(option => ({
        name: option,
        votes: 0,
        users: []
      }))
    }

    this.votersInfo = []
    // Tiempo de la votación
    this.status = true
  }

  /**
   * Calcula el tiempo restante de la votación
   *
   * @param {*} endTime - Tiempo de finalización de la votación
   * @returns {Promise<string>} - Tiempo restante en formato MM:SS
   */
  async updateRemainingTime (endTime) {
    const now = Date.now()
    const remainingTimeMs = endTime - now
    if (remainingTimeMs <= 0) {
      return null
    }

    // Calcular minutos y segundos restantes
    const minutes = Math.floor(remainingTimeMs / 1000 / 60)
    const seconds = Math.floor((remainingTimeMs / 1000) % 60)

    // Asegurar que siempre tenga 2 dígitos
    const minStr = String(minutes).padStart(2, '0')
    const secStr = String(seconds).padStart(2, '0')

    return `${minStr}:${secStr}`
  }

  async embedPoll () {
    const defaultProgressBar = '⬛'.repeat(13) // Barra de progreso predeterminada

    // Verificar el tiempo restante
    this.remainingTime = await this.updateRemainingTime(this.end_time)

    // Verificar si la votación ha finalizado
    if (this.remainingTime === null) {
      this.status = false
    }

    // Crear el embed
    const embed = new EmbedBuilder()
      .setDescription(
        `## 🗳️ ${this.title}\n` +
        `> **Tipo:** ${(this.secret ? '🔒 Secreta' : '🔓 Pública')} \n` +
        `> **Estado:** ${this.status ? `<a:online:1288631919352877097> **Abierta** - **${this.remainingTime}**` : '<a:offline:1288631912180744205> **Votación finalizada**'}\n`
      )
      .setColor(discordConfig.Color || 0x0099FF) // Valor predeterminado si discordConfig.Color no está definido
      .setTimestamp(this.timeStamp)

    if (this.secret && !this.status) { // Si es secreta y no ha finalizado (no muestra los votos actualizados)
      // Añadir las opciones
      this.options.forEach((option, index) => {
        embed.addFields({
          name: `<:chat_ind:1288628721842130976> ${option}`,
          value: '> **¿?** votos (**-%**)\n' +
                 `> ${defaultProgressBar}`,
          inline: false
        })
      })
    } else {
      // Añadir las opciones
      this.options.forEach((option, index) => {
        embed.addFields({
          name: `<:chat_ind:1288628721842130976> ${option}`,
          value: `> **${this.totalVotes.options.votes}** votos (**${(this.totalVotes * this.totalVotes) / 100}**)\n` +
                 `> ${defaultProgressBar}`,
          inline: false
        })
      })
    }

    // Añadir el total de votos
    embed.addFields({
      name: `<:us:1288631396364976128> Votantes: ${this.totalVotes.totalVotes}`,
      value: `${this.votersInfo.length > 0 ? '```' + this.votersInfo.join(', ') + '```' : '```Nadie ha votado aún```'}`,
      inline: true
    })

    // Añadir el autor
    embed.setFooter({ text: `Votación creada por ${this.author}` })

    return embed
  }
}
