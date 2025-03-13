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
    this.remainingTime = duration
  }

  async embedPoll () {
    const defaultProgressBar = '⬛'.repeat(13) // Barra de progreso predeterminada

    // Crear el embed
    const embed = new EmbedBuilder()
      .setDescription(
        `## 🗳️ ${this.title}\n` +
        `> **Tipo:** ${(this.secret ? '🔒 Secreta' : '🔓 Pública')} \n` +
        `> **Estado:** ${this.status ? `<a:online:1288631919352877097> **Abierta** - **${this.remainingTime}**` : '<a:offline:1288631912180744205> **Votación finalizada**'}\n` +
        `> **Total de votos:** ${this.totalVotes.totalVotes}`
      )
      .setColor(discordConfig.Color || 0x0099FF) // Valor predeterminado si discordConfig.Color no está definido
      .setTimestamp(this.timeStamp)

    if (this.secret) {
      // Añadir las opciones
      this.options.forEach((option, index) => {
        embed.addFields({
          name: `<:chat_ind:1288628721842130976> ${option}`,
          value: `> **¿?** votos (**-%**) ${index}\n` +
                 `> ${defaultProgressBar}`
        })
      })
    }

    // Añadir el total de votos
    embed.addFields({
      name: 'Total de votos',
      value: this.totalVotes.totalVotes.toString()
    })

    // Añadir el autor
    embed.setFooter({ text: `Votación creada por ${this.author}` })

    return embed
  }
}
