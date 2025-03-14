import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
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
    modal.addComponents(titlePollRow, durationPollInputRow, secretPollInputRow, optionsInputRow)

    // Mostrar el modal al usuario
    await interaction.showModal(modal)

    // Esperar a que el usuario envíe el modal
    try {
      const modalSubmit = await interaction.awaitModalSubmit({
        time: 300000, // 5 minutos
        filter: i => i.customId === 'votacion_modal' && i.user.id === interaction.user.id
      })

      // Obtener los valores del formulario
      const titlePollInput = modalSubmit.fields.getTextInputValue('title_poll_input')
      const durationPollInput = modalSubmit.fields.getTextInputValue('duration_poll_input')
      const secretPollInput = modalSubmit.fields.getTextInputValue('secret_poll_input')
      const optionsInput = modalSubmit.fields.getTextInputValue('poll_options_input')

      await modalSubmit.deferReply()

      try {
        // Envía la votación
        const poll = new DaiPoll(
          titlePollInput,
          modalSubmit.user,
          modalSubmit.channel,
          optionsInput === '' ? 'A favor, En contra, Abstención' : optionsInput, // Opciones por defecto
          secretPollInput,
          durationPollInput
        )

        // Crear botones para cada opción
        const createButtons = () => {
          return poll.options.map(option => {
            let style = ButtonStyle.Secondary // Por defecto, azul
            if (option === 'A favor') {
              style = ButtonStyle.Success // Verde
            } else if (option === 'En contra') {
              style = ButtonStyle.Danger // Rojo
            }
            return new ButtonBuilder()
              .setCustomId(`vote_${option}`)
              .setLabel(option)
              .setStyle(style)
              .setDisabled(!poll.status) // Deshabilitar si la votación ha terminado
          })
        }

        // Crear una fila de botones
        const buttonRow = new ActionRowBuilder().addComponents(createButtons())

        // Enviar el embed inicial con los botones
        const initialEmbed = await poll.embedPoll()
        await modalSubmit.editReply({ embeds: [initialEmbed], components: [buttonRow] })

        // Actualizar el embed cada segundo
        const interval = setInterval(async () => {
          if (!poll.status) {
            clearInterval(interval)

            // Deshabilitar los botones al finalizar
            const disabledButtons = createButtons().map(button => button.setDisabled(true))
            const disabledButtonRow = new ActionRowBuilder().addComponents(disabledButtons)

            // Enviar el embed final con los botones deshabilitados
            const finalEmbed = await poll.embedPoll()
            await modalSubmit.editReply({ embeds: [finalEmbed], components: [disabledButtonRow] })
            return
          }

          try {
            const updatedEmbed = await poll.embedPoll()
            await modalSubmit.editReply({ embeds: [updatedEmbed], components: [buttonRow] })
          } catch (error) {
            console.error('Error updating poll:', error)
            clearInterval(interval)
          }
        }, 1000)
      } catch (error) {
        console.error('Error creating poll:', error)
        await modalSubmit.editReply({
          content: '<:no:1288631410558767156> Hubo un error al crear la votación.',
          ephemeral: true
        })
      }
    } catch (error) {
      console.error('Modal interaction error:', error)
    }
  }
}
