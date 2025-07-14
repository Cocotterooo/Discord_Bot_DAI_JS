// 📌 Cargar módulos principales
import {
  Client,
  GatewayIntentBits,
  PresenceUpdateStatus,
  Partials,
  Collection,
  ActivityType
} from 'discord.js'
import { discordConfig, instagramConfig } from './config.js'
import 'colors' // Permite colorear la consola (depende de la librería 'colors')

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// 📌 Importar el cliente de Instagram
import { InstagramAPIClient } from './src/services/InstagramAPIClient/instagram.js'

// 📌 Importar funciones de manejo de errores
import { stateError } from './src/utilities/stateError.js'

// 📌 Importar handlers para Slash Commands, eventos y botones
import { loadSlash } from './src/handlers/slashHandler.js'
// import { loadEvents } from './src/events/handlers/eventHandler.js'
import { loadButtons } from './src/handlers/buttonHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 📌 Cargar las variables de entorno
process.loadEnvFile()
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN

// 📌 Crear el cliente de Discord con las configuraciones necesarias
const client = new Client({
  intents: Object.values(GatewayIntentBits), // Permite escuchar eventos de Discord (mensajes, interacciones, etc.)
  partials: [ // Permite que el bot acceda a datos parciales (usuarios, mensajes, reacciones)
    Partials.User,
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction
  ],
  presence: { // Configuración de presencia del bot
    status: PresenceUpdateStatus.Idle, // Aparece como "inactivo"
    activities: [
      {
        name: discordConfig.activities.PREPARANDO_SAN_PEPE || 'DAI', // Actividad mostrada
        type: ActivityType.Custom // Tipo de actividad (puede ser "Jugando a...", "Viendo...", etc.)
      }
    ]
  },
  allowedMentions: { // Permitir menciones en mensajes
    parse: ['users', 'roles', 'everyone'],
    repliedUser: true
  }
})

// 📌 Configurar el cliente de Instagram con la API Key del .env
const INSTAGRAM_API_KEY = process.env.INSTAGRAM_API_KEY
instagramConfig.ACCESS_TOKEN = INSTAGRAM_API_KEY
export const INSTAGRAM_CLIENT = new InstagramAPIClient(instagramConfig.BASE_URL, INSTAGRAM_API_KEY, client)

// 📌 Manejo de interacciones (Slash Commands y Botones)
client.on('interactionCreate', async (interaction) => {
  // 📍 Manejar Slash Commands
  if (interaction.isChatInputCommand()) { // Cambiado de isCommand() a isChatInputCommand()
    const COMMAND = client.slashCommands.get(interaction.commandName)
    if (!COMMAND) return // Si el comando no existe, salir

    // 📌 Extraer argumentos del comando (si los necesitas)
    const ARGS = []
    for (const OPTION of interaction.options.data) {
      if (OPTION.type === 1) { // Subcomandos
        if (OPTION.name) ARGS.push(OPTION.name)
        OPTION.options?.forEach((subOption) => {
          if (subOption.value) ARGS.push(subOption.value)
        })
      } else if (OPTION.value) {
        ARGS.push(OPTION.value)
      }
    }
    try { // 📌 Ejecutar el comando
      await COMMAND.execute(interaction, client, ARGS)
    } catch (error) { // Manejar errores
      console.error(error)
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '<:no:1288631410558767156> Hubo un error al ejecutar el comando',
          flags: 
        })
      } else {
        await interaction.reply({
          content: '<:no:1288631410558767156> Hubo un error al ejecutar el comando',
          flags: MessageFlags.Ephemeral,
          allowed_mentions: { parse: ['users', 'roles', 'everyone'] } // No incluyas 'here'
        })
      }
    }
  }
})

// 📌 Configuración del cliente
client.color = discordConfig.color
client.commands = new Collection() // Colección para comandos de texto
client.slashCommands = new Collection() // Colección para Slash Commands
client.services = {};

// 📌 Iniciar el bot de forma asíncrona
(async () => {
  try {
    await client.login(DISCORD_BOT_TOKEN) // Conectar a Discord
    console.log(`✅ Iniciado como ${client.user.tag}!`.green)
  } catch (error) {
    console.error(`❌ Error al iniciar el bot: ${error}`.red)
    process.exit(1) // Cerrar el proceso si hay un error crítico
  }
})()

// MARK:📌 Cargar servicios
async function loadServices () {
  const servicesPath = path.join(__dirname, 'src', 'services')

  try {
  // Verifica si el directorio de servicios existe
    if (fs.existsSync(servicesPath)) {
      const servicesFolders = fs.readdirSync(servicesPath)

      for (const folder of servicesFolders) {
        const folderPath = path.join(servicesPath, folder)

        if (fs.statSync(folderPath).isDirectory()) {
          const servicePath = path.join(folderPath, `${folder.toLowerCase()}.js`)

          if (fs.existsSync(servicePath)) {
            const serviceModule = await import(`file://${servicePath}`)
            const service = serviceModule.default(client)

            // Registrar el servicio con su nombre normalizado
            const serviceName = folder.charAt(0).toLowerCase() + folder.slice(1)
            client.services[serviceName] = service
            console.log(`Servicio cargado: ${serviceName}`)
          }
        }
      }
    }
  } catch (error) {
    console.error('Error al cargar servicios:', error)
  }
}

// MARK: On ready
// 📌 Evento 'ready': Se ejecuta cuando el bot está listo
client.on('ready', async () => {
  // Cargar Slash Commands
  await loadSlash(client)
    .then(() => {
      console.log('✅ Comandos cargados correctamente'.green)
      console.log(`📜 (/) Verificación comandos cargados: ${client.slashCommands.size}`.blue)
      client.slashCommands.forEach((cmd) => console.log(`🔹 /${cmd.data.name}`))
    })
    .catch((error) => {
      console.error(`❌ Error al cargar los comandos: ${error}`.red)
      stateError(client) // Registrar error
    })

  // 📌 Registrar comandos globalmente en Discord
  try {
    console.log('🔄 Registrando comandos en Discord...'.blue)
    await client.application.commands.set(client.slashCommands.map(cmd => cmd.data))
    console.log(`✅ Se han registrado ${client.slashCommands.size} comandos globalmente.`.green)
  } catch (error) {
    console.error('❌ Error al registrar los comandos:'.red, error)
    stateError(client)
  }

  // 📍 Manejar Botones
  try {
    console.log('🔄 Registrando botones'.cyan)
    await loadButtons(client)
    console.log(`✅ Se han cargado ${client.buttons.size} botones`.green)
  } catch (error) {
    console.error('❌ Error al iniciar handlerButtons'.red, error)
    stateError(client)
  }

  // 📌 Cargar servicio
  await loadServices()
    .then(() => console.log('✅ Servicios cargados correctamente'.green))
    .catch((error) => {
      console.error(`❌ Error al cargar los servicios: ${error}`.red)
      stateError(client)
    })

  // 📌 Cargar eventos
  /* await loadEvents(client)(
    .then(() => console.log('✅ Eventos cargados correctamente'.green))
    .catch((error) => {
      console.error(`❌ Error al cargar los eventos: ${error}`.red)
      stateError(client)
    }) */
})
