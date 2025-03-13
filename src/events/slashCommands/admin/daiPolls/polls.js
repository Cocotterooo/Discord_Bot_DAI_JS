import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js'
import { DaiPoll } from './DaiPoll.js'

export default {
  data: new SlashCommandBuilder()
    .setName('dai_votacion')
    .setDescription('Crea una votación de tiempo limitado.'),

  async execute (interaction, client) {
    // Crear el modal (formulario)
    const modal = new ModalBuilder()
      .setCustomId('votacion_modal')
      .setTitle('Nueva votación')

    // Input para el título de la votación
    const titlePollInput = new TextInputBuilder()
      .setCustomId('title_poll_input')
      .setLabel('🔠 Título de la votación')
      .setPlaceholder('Ingresa el título de la votación.')
      .setStyle(TextInputStyle.Short) // Input corto
      .setMaxLength(100)
      .setRequired(true)

    // Input para la duración de la votación
    const durationPollInput = new TextInputBuilder()
      .setCustomId('duration_poll_input')
      .setLabel('⌛ Duración de la votación')
      .setMaxLength(5)
      .setPlaceholder('Ingresa la duración de la votación en segundos.')
      .setStyle(TextInputStyle.Short) // Input de párrafo (multilínea)
      .setRequired(true)

    // Input para intereses
    const secretPollInput = new TextInputBuilder()
      .setCustomId('secret_poll_input')
      .setLabel('🔒 ¿Es una votación secreta?')
      .setPlaceholder('Y/N')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(1)
      .setRequired(true)

    // Input para las opciones de la votación
    const optionsInput = new TextInputBuilder()
      .setCustomId('poll_options_input')
      .setLabel('🗳️ Opciones')
      .setPlaceholder('𝗣𝗼𝗿 𝗱𝗲𝗳𝗲𝗰𝘁𝗼: A favor, En contra, Abstención')
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(200)
      .setRequired(false)

    // Crear filas para cada input
    const titlePollRow = new ActionRowBuilder().addComponents(titlePollInput)
    const durationPollInputRow = new ActionRowBuilder().addComponents(durationPollInput)
    const secretPollInputRow = new ActionRowBuilder().addComponents(secretPollInput)
    const optionsInputRow = new ActionRowBuilder().addComponents(optionsInput)

    // Añadir las filas al modal
    // Nota: Discord permite un máximo de 5 inputs por modal
    modal.addComponents(titlePollRow, durationPollInputRow, secretPollInputRow, optionsInputRow)

    // Mostrar el modal al usuario
    await interaction.showModal(modal)

    client.on('interactionCreate', async (interaction) => { // Manejo del modal
      if (interaction.isModalSubmit()) {
        const titlePollInput = interaction.fields.getTextInputValue('title_poll_input')
        const durationPollInput = interaction.fields.getTextInputValue('duration_poll_input')
        const secretPollInput = interaction.fields.getTextInputValue('secret_poll_input')
        const optionsInput = interaction.fields.getTextInputValue('poll_options_input')

        await interaction.deferReply()
        try { // Envía la votación
          const poll = new DaiPoll(
            titlePollInput,
            interaction.user,
            interaction.channel,
            optionsInput === '' ? 'A favor, En contra, Abstención' : optionsInput, // Opciones por defecto
            secretPollInput,
            durationPollInput
          )
          await interaction.editReply({
            embeds: [await poll.embedPoll()], // Va entre corchetes porque es un nuevo embed q no había en el mensaje original
            ephemeral: true
          })
        } catch (error) {
          console.error(error)
          await interaction.editReply({
            content: '<:no:1288631410558767156> Hubo un error al crear la votación.',
            ephemeral: true
          })
        }
      }
    })
  }
}
