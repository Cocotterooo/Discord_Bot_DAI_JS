module.exports = client => {
  console.log(`Bot iniciado como: ${client.user.tag}`)
  if (client?.application?.commands) {
    try {
      client.application.commands.set(client.slashArray)
      console.log(`(/) [${client.slashCommands.size}] Comandos publicados.`.lightgreen)
    } catch (error) {
      console.log(`(/) ERROR al publicar los comandos: ${error}`.red)
    }
  }
}
