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
  allowedMentions: {
    parse: ['users', 'roles'],
    repliedUser: true
  },
  presence: {
    status: PresenceUpdateStatus.Idle,
    activities: [
      {
        name: discordConfig.activities.PREPARANDO_SAN_PEPE || 'DAI',
        type: ActivityType.Custom
      }
    ]
  }
})

client.commands = new Collection()
client.slashCommands = new Collection()
client.slashArray = []
client.on('ready', () => {
  console.log(`Iniciado como ${client.user.tag}!`)
})

client.login(DISCORD_BOT_TOKEN)
