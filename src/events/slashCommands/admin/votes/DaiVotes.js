import EmbedBuilder from 'discord.js'
import { discordConfig } from '../../../../../config'

export class daiVotes {
  constructor (title, author, channel, options, secret) {
    // Datos para guardar
    this.title = title
    this.author = author
    this.channel = channel
    this.options = options
    this.secret = this.#isSecret(secret)
    this.timeStamp = Date.now()
    this.totalVotes = {
      totalVotes: 0,
      options: []
    }
    this.voters = {
      optionsVoters: [],
      voters: []
    }
  }

  /**
   * Comprueba si la votación es secreta
   *
   * @param {string} secret - Espera recibit Y o N para saber si la votación es secreta.
   * @returns {boolean} - Devuelve true si la votación es secreta y false si no lo es.
   */
  async #isSecret (secret = this.secret) {
    return secret.toUpperCase() === 'Y' // Si es Y, es secreta y devuelve true, si no, devuelve false
  }

  async #getOptions (options = this.options) {
    const optionsArray = options.split(',')
    const optionsObject = {}
    optionsArray.forEach((option, index) => {
      optionsObject[index] = option
    })
    return optionsObject
  }

  /**
  * Crea el embed que contiene la votación.
  *
  * @param { number } timeRemaining - Tiempo restante para votar
  * @param { number } totalVotes - Número de votos totales
  * @param { number } totalRequiredVotes - Tiempo restante para votar
  * @param { object } options - Las opciones de la votación.
  * @param { boolean } secret - Si la votación es secreta.
  * @returns { EmbedBuilder }
  */
  async embedVote (
    timeRemaining,
    totalVotes,
    totalRequiredVotes,
    options,
    secret = this.secret
  ) {
    // Crear el embed
    const embed = new EmbedBuilder()
      .setTitle(this.title)
      .setDescription(`🗳️ Votación creada por ${this.author}`)
      .setColor(discordConfig.Color)
      .setTimestamp(this.timeStamp)
    // Añadir las opciones
    this.options.forEach((option, index) => {
      embed.addField(`Opción ${index + 1}`, option)
    })
    // Añadir si es secreta
    if (this.secret === 'Y') {
      embed.addField('Votación secreta', '🔒 Sí')
    } else {
      embed.addField('Votación secreta', '🔓 No')
    }
    // Añadir el total de votos
    embed.addField('Total de votos', this.totalVotes.totalVotes)
    // Añadir el autor
    embed.setFooter(`Votación creada por ${this.author}`)
    return embed
  }
}
