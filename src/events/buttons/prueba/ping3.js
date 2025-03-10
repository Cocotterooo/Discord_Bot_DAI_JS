export default {
  id: 'miBoton',
  async execute (interaction, client) {
    // Tu código para manejar la interacción
    await interaction.reply({
      content: '¡Has presionado mi botón!',
      // Versión corregida:
      allowedMentions: {
        parse: ['users', 'roles', 'everyone'] // Sin el valor 'here'
      }
    })
  }
}
