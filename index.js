// Cargar .env
// Cargar módulos
import {
  Client,
  GatewayIntentBits,
  PresenceUpdateStatus,
  Partials,
  Collection,
  ActivityType
} from 'discord.js'
import { discordConfig } from './config.js'
import 'colors'
import { loadSlash } from './src/handlers/slashHandler.js'

process.loadEnvFile()
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN

// Crear cliente de Discord
const client = new Client({
  // Options go directly here
  intents: Object.values(GatewayIntentBits),
  partials: [
    Partials.User,
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction
  ],
  presence: {
    status: PresenceUpdateStatus.Idle,
    activities: [
      {
        name: discordConfig.activities.PREPARANDO_SAN_PEPE || 'DAI',
        type: ActivityType.Custom
      }
    ]
  },
  allowedMentions: { // Permite mencionar a todos
    parse: ['users', 'roles', 'everyone', 'here'],
    repliedUser: true
  }
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return
  const COMMAND = client.slashCommands.get(interaction.commandName)

  if (!COMMAND) return
  const ARGS = []
  for (const OPTION of interaction.options.data) {
    if (OPTION.type === 1) {
      if (OPTION.name) ARGS.push(OPTION.name)
      OPTION.options.forEach((subOption) => {
        if (ARGS.value) ARGS.push(subOption.value)
      })
    } else if (OPTION.value) ARGS.push(OPTION.value)
  }
  try {
    await COMMAND.execute(client, interaction, ARGS)
  } catch (error) {
    console.error(error)
    await interaction.reply({ content: 'Hubo un error al ejecutar el comando', ephemeral: true })
  }
})
client.color = discordConfig.color
client.commands = new Collection() // Almacena los comandos de manera eficiente
client.slashCommands = new Collection();

(async () => {
  try {
    await client.login(DISCORD_BOT_TOKEN)
    console.log(`✅ Iniciado como ${client.user.tag}!`.green)
  } catch (error) {
    console.error(`❌ Error al iniciar el bot: ${error}`.red)
    process.exit(1) // Cerrar el proceso si falla el login
  }
})()

client.on('ready', async () => {
  await loadSlash(client)
    .then(() => {
      console.log('✅ Comandos cargados correctamente'.green)
      console.log(`📜 (/) Verificación comandos cargados: ${client.slashCommands.size}`.blue)
      client.slashCommands.forEach((cmd) => console.log(`🔹 /${cmd.data.name}`))
    })
    .catch((error) => {
      console.error(`❌ Error al cargar los comandos: ${error}`.red)
      client.user.setPresence({ status: PresenceUpdateStatus.DoNotDisturb })
    })
  try {
    console.log('🔄 Registrando comandos en Discord...'.blue)

    // Registrar comandos globalmente
    await client.application.commands.set(client.slashCommands.map(cmd => cmd.data))

    console.log(`✅ Se han registrado ${client.slashCommands.size} comandos globalmente.`.green)
  } catch (error) {
    console.error('❌ Error al registrar los comandos:'.red, error)
  }
})
