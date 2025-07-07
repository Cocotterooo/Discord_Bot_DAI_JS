import {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  ChatInputCommandInteraction, // Importar el tipo correcto para el comando slash
  Client,
  MessageComponentInteraction // O usar este tipo más general para el filtro
} from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('ping3')
    .setDescription('Ping pong con botón interactivo.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // 🔹 Solo admins pueden verlo y usarlo
    .setDMPermission(false), // 🔹 No disponible en mensajes directos

  async execute (client: Client, interaction: ChatInputCommandInteraction) { // <--- Cambiado a ChatInputCommandInteraction
    // Verificar si la interacción es utilizable (importante para TypeScript)
    if (!interaction.isRepliable()) {
      console.error('La interacción no se puede responder.')
      return
    }

    // Crear el embed
    const embed = new EmbedBuilder()
      .setTitle('Pong!')
      .setDescription(`🏓 Latencia API: ${client.ws.ping}ms`) // Usar Latencia API es más claro
      .setColor('#e00000')
      .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }) // Añadir un pie de página es buena práctica

    // Crear el botón
    const customButtonId = 'miBoton' // Guardar el ID en una variable para evitar errores tipográficos
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents( // Especificar el tipo genérico para ActionRowBuilder
      new ButtonBuilder()
        .setCustomId(customButtonId) // Usar la variable
        .setLabel('Haz clic aquí (secreto)')
        .setStyle(ButtonStyle.Primary)
    )

    // Enviar el mensaje con el embed y el botón
    // Usamos deferReply + followUp o reply directamente. Reply es más simple aquí.
    const message = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true // Necesario para obtener el objeto Message y adjuntar el collector
    })

    // Crear un filtro para el collector
    // Solo acepta interacciones de botón, con el ID correcto y del usuario original
    const filter = (i: MessageComponentInteraction) => { // Usar un tipo más general o ButtonInteraction
      return i.isButton() && i.customId === customButtonId && i.user.id === interaction.user.id
    }

    // Crear el collector directamente sobre el mensaje enviado
    // Tiempo límite de 15 segundos (15000 ms)
    const collector = message.createMessageComponentCollector({ filter, time: 15000 })

    collector.on('collect', async (buttonInteraction: ButtonInteraction) => { // <--- 'buttonInteraction' es la interacción del clic
      // Responder al clic del botón de forma efímera
      await buttonInteraction.reply({ // <--- Usar la interacción del botón (buttonInteraction) y reply
        content: '¡Pong Secreto! 😉',
        ephemeral: true // 🔹 Solo el usuario que hizo clic verá este mensaje
        // No es necesario 'flags: MessageFlags.Ephemeral'
      })
      // Opcionalmente, puedes detener el collector después del primer clic válido si solo quieres una respuesta
      // collector.stop();
    })

    collector.on('end', collected => {
      // Opcional: Desactivar el botón cuando el collector termina para que no se pueda hacer clic más
      const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        ButtonBuilder.from(row.components[0]).setDisabled(true) // Crear un nuevo botón basado en el anterior, pero deshabilitado
      )
      // Intentar editar el mensaje original para deshabilitar el botón
      // Usar interaction.editReply porque message.edit puede fallar si el bot no tiene permisos suficientes o el mensaje fue borrado
      interaction.editReply({ components: [disabledRow] }).catch(error => {
        console.warn('No se pudo editar el mensaje para deshabilitar el botón:', error.message)
        // No hacer nada si falla, el botón simplemente seguirá ahí pero no funcionará
      })

      if (collected.size === 0) {
        console.log(`Collector para el botón '${customButtonId}' finalizado por tiempo límite.`)
      } else {
        console.log(`Collector para el botón '${customButtonId}' finalizado tras recoger ${collected.size} interacciones.`)
      }
    })
  }
}
