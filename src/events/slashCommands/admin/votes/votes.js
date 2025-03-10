import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('dai_votacion')
    .setDescription('Crea una votación de tiempo limitado.'),

  async execute (interaction, client) {
    // Crear el modal (formulario)
    const modal = new ModalBuilder()
      .setCustomId('votacion_modal')
      .setTitle('Nueva votación')
      .setDescription('Completa el siguiente formulario para crear una nueva votación.'
      )

    // Input para el título de la votación
    const titleVoteInput = new TextInputBuilder()
      .setCustomId('title_vote_input')
      .setLabel('🔠 Título de la votación')
      .setPlaceholder('Ingresa el título de la votación.')
      .setStyle(TextInputStyle.Short) // Input corto
      .setMaxLength(100)
      .setRequired(true)

    // Input para la duración de la votación
    const durationVoteInput = new TextInputBuilder()
      .setCustomId('duration_vote_input')
      .setLabel('⌛ Duración de la votación')
      .setMaxLength(5)
      .setPlaceholder('Ingresa la duración de la votación en segundos.')
      .setStyle(TextInputStyle.Short) // Input de párrafo (multilínea)
      .setRequired(true)

    // Input para las opciones de la votación
    const optionsInput = new TextInputBuilder()
      .setCustomId('vote_options_input')
      .setLabel('🗳️ Opciones')
      .setPlaceholder('𝗣𝗼𝗿 𝗱𝗲𝗳𝗲𝗰𝘁𝗼: A favor, En contra, Abstención')
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(200)
      .setRequired(false)

    // Input para intereses
    const secretVoteInput = new TextInputBuilder()
      .setCustomId('secret_vote_input')
      .setLabel('🔒 ¿Es una votación secreta?')
      .setPlaceholder('Y/N')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(1)
      .setRequired(true)

    // Crear filas para cada input
    const titleVoteRow = new ActionRowBuilder().addComponents(titleVoteInput)
    const durationVoteInputRow = new ActionRowBuilder().addComponents(durationVoteInput)
    const optionsInputRow = new ActionRowBuilder().addComponents(optionsInput)
    const secretVoteInputRow = new ActionRowBuilder().addComponents(secretVoteInput)

    // Añadir las filas al modal
    // Nota: Discord permite un máximo de 5 inputs por modal
    modal.addComponents(titleVoteRow, durationVoteInputRow, optionsInputRow, secretVoteInputRow)

    // Mostrar el modal al usuario
    await interaction.showModal(modal)

    client.on('interactionCreate', async (interaction) => {
      if (interaction.isModalSubmit()) {
        const titleVoteInput = interaction.fields.getTextInputValue('title_vote_input')
        const durationVoteInput = interaction.fields.getTextInputValue('duration_vote_input')
        const optionsInput = interaction.fields.getTextInputValue('vote_options_input')
        const secretVoteInput = interaction.fields.getTextInputValue('secret_vote_input')

        await interaction.reply({
          content: `Título: ${titleVoteInput}\nDuración: ${durationVoteInput}\nOpciones: ${optionsInput}\nVotación secreta: ${secretVoteInput}`,
          ephemeral: true
        })
      }
    })
  }
}
