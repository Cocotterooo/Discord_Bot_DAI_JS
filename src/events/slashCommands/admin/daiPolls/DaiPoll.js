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
    this.end_time = Date.now() + duration * 1000 // Convertir segundos a milisegundos
    this.options = options.trim().split(', ') // Separar las opciones por coma y espacio
    this.totalVotes = {
      totalVotes: 0,
      options: this.options.map((option) => ({
        name: option,
        votes: 0,
        users: []
      }))
    }

    this.votersInfo = [] // Información de los votantes
    this.status = true // Estado de la votación
    this.barLength = 13 // Longitud de la barra de progreso
  }

  /**
   * Calcula el tiempo restante de la votación
   * @param {number} endTime - Tiempo de finalización de la votación
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

  /**
   * Crea un embed con la información de la votación
   * @returns {Promise<EmbedBuilder>} - Embed con la información de la votación
   */
  async embedPoll () {
    const defaultProgressBar = '⬛'.repeat(this.barLength) // Barra de progreso predeterminada

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
          `> **Tipo:** ${this.secret ? '🔒 Secreta' : '🔓 Pública'} \n` +
          `> **Estado:** ${
            this.status
              ? `<a:online:1288631919352877097> **Abierta** - **${this.remainingTime}**`
              : '<a:offline:1288631912180744205> **Votación finalizada**'
          }\n`
      )
      .setColor(discordConfig.Color || 0x0099ff) // Valor predeterminado si discordConfig.Color no está definido
      .setFooter({
        text: 'Delegación de Alumnos de Industriales - UVigo',
        icon_url: 'https://cdn.discordapp.com/emojis/1288628804276977735.webp?size=96&quality=lossless'
      })
      .setImage('https://i.imgur.com/8GkOfv1.png')

    // Si es secreta y no ha finalizado (no muestra los votos actualizados)
    if (this.secret && this.status) {
      // Añadir las opciones
      this.options.forEach((option, index) => {
        embed.addFields({
          name: `<:chat_ind:1288628721842130976> ${option}`,
          value: '> **¿?** votos (**-%**)\n' + `> ${defaultProgressBar}`,
          inline: false
        })
      })
    } else {
      // Añadir las opciones
      this.totalVotes.options.forEach((option, index) => {
        const percentage =
          this.totalVotes.totalVotes > 0
            ? ((option.votes / this.totalVotes.totalVotes) * 100).toFixed(2)
            : 0 // Evitar división por cero
        const lenghtBarFilled = this.barLength * (percentage / 100)
        const bar =
          '🟦'.repeat(lenghtBarFilled) +
          '⬛'.repeat(this.barLength - lenghtBarFilled)
        embed.addFields({
          name: `<:chat_ind:1288628721842130976> ${option.name}`,
          value: `> **${option.votes}** votos (**${percentage}%**)\n` + `> ${bar}`,
          inline: false
        })
      })
    }

    // Añadir el total de votos
    const listOfVoters = this.votersInfo.map((voter) => voter.userName)
    let votersValue

    // Determinar el valor del campo "Votantes"
    if (this.secret) {
      // Si la votación es secreta, solo mostrar votantes si hay alguno
      votersValue =
        listOfVoters.length > 0
          ? '```' + listOfVoters.join(', ') + '```'
          : '```Nadie ha votado aún```'
    } else if (!this.status) {
      // Si la votación no es secreta y ha terminado, mostrar votantes
      votersValue =
        listOfVoters.length > 0
          ? '```' + listOfVoters.join(', ') + '```'
          : '```Nadie ha votado aún```'
    } else {
      // Si la votación no es secreta y está en curso, mostrar mensaje de "No ha terminado la votación"
      votersValue = '```No ha terminado la votación```'
    }

    // Añadir el campo al embed
    embed.addFields({
      name: `<:us:1288631396364976128> Votantes: ${this.totalVotes.totalVotes}`,
      value: votersValue,
      inline: true
    })

    // Añadir el autor
    embed.setFooter({
      text: 'Delegación de Alumnos de Industriales - UVigo',
      icon_url: 'https://cdn.discordapp.com/emojis/1288628804276977735.webp?size=96&quality=lossless'
    })
    return embed
  }

  /** MARK: newVote
   * Añade un nuevo voto a la votación
   * @param {*} interaction - Interacción del usuario
   * @param {*} option - Opción seleccionada por el usuario
   */
  async newVote (interaction, option) {
    const userId = interaction.user.id
    const user = interaction.user // Objeto completo del usuario
    const userName = interaction.member?.nickname || user.username // Nombre de usuario o apodo

    // Verificar si el usuario ya ha votado
    const hasVoted = this.votersInfo.some((voter) => voter.id === userId)
    if (hasVoted) {
      await interaction.followUp({
        content: '<:no:1288631410558767156> Ya has votado.',
        ephemeral: true
      })
      return
    }

    // Verificar si la opción es válida
    if (!this.options.includes(option)) {
      await interaction.followUp({
        content: '<:no:1288631410558767156> Opción no válida.',
        ephemeral: true
      })
      return
    }

    // Añadir el usuario a la lista de votantes
    this.votersInfo.push({
      id: userId,
      user, // Objeto completo del usuario
      userName, // Nombre de usuario o apodo
      option
    })

    // Recorrer las opciones y sumar el voto
    this.totalVotes.options.forEach((opt) => {
      if (opt.name === option) {
        opt.votes += 1 // Sumar 1 al voto de la opción seleccionada
        opt.users.push(userName) // Añadir el nombre del usuario a la lista de votantes de esta opción
      }
    })

    // Incrementar el total de votos
    this.totalVotes.totalVotes += 1

    await interaction.followUp({
      content: `<:si:1288631406452412428> Has votado: **${option}**`,
      ephemeral: true
    })
  }

  /** MARK: - toJSON
   * Convierte los datos de la votación en un JSON legible
   * @returns {string} - JSON formateado con la información de la votación
   */
  toJSON () {
    const data = {
      title: this.title,
      timeStamp: this.timeStamp,
      secret: this.secret,
      channel: this.channel,
      author: this.author,
      duration: this.duration,
      end_time: this.end_time,
      options: this.options,
      totalVotes: this.totalVotes,
      votersInfo: this.votersInfo, // Incluye user y userName
      status: this.status,
      barLength: this.barLength
    }

    // Convertir a JSON con indentación de 2 espacios
    return JSON.stringify(data, null, 2)
  }

  /** MARK: - detailedResultsEmbed
   * Crea un embed con los resultados detallados de la votación
   * @returns {EmbedBuilder} - Embed con los resultados detallados
   */
  async detailedResultsEmbed () {
    const embed = new EmbedBuilder()
      .setTitle('Resultados detallados de la votación')
      .setColor(discordConfig.Color || 0x0099ff)
      .setImage('https://i.imgur.com/8GkOfv1.png')

    // Añadir un campo por cada opción con los usuarios que votaron
    this.totalVotes.options.forEach((option) => {
      embed.addFields({
        name: `<:chat_ind:1288628721842130976> ${option.name}`,
        value: option.users.length > 0 ? '```' + option.users.join(', ') + '```' : '```' + 'Ningún voto' + '```',
        inline: false
      })
    })
    embed.setFooter({
      text: 'Delegación de Alumnos de Industriales - UVigo',
      icon_url: 'https://cdn.discordapp.com/emojis/1288628804276977735.webp?size=96&quality=lossless'
    })
    return embed
  }

  /**
   * Envía los resultados privados a los usuarios
   * @param {Client} client - Cliente de Discord
   * @param {string[]} userIds - IDs de los usuarios a los que enviar los resultados
   */
  async sendPrivateResults (client, userIds) {
    for (const userId of userIds) {
      try {
        const user = await client.users.fetch(userId)
        if (user) {
          // Enviar el embed original de la votación
          await user.send({
            content: `## Resultados de la votación ➡️ ${this.title}**`,
            embeds: [await this.embedPoll()]
          })

          // Enviar el embed con los resultados detallados
          await user.send({
            content: '',
            embeds: [await this.detailedResultsEmbed()]
          })
        }
      } catch (error) {
        console.error(`Error al enviar resultados privados al usuario ${userId}:`, error)
      }
    }
  }
}
