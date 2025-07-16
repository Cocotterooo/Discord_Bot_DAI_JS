import { readdir, access } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { constants } from 'fs'
import { MessageFlags } from 'discord.js';

// Variables para el manejo de rutas
const __filename = fileURLToPath(new URL(import.meta.url))
const __dirname = dirname(__filename)

/**
 * Carga todos los botones desde el directorio de eventos
 * @param client Cliente de Discord
 */
export async function loadButtons(client) {
  const buttonsPath = join(__dirname, '..', 'events', 'buttons')

  try {
    // Verificar si el directorio existe
    await access(buttonsPath, constants.F_OK)

    const folders = await readdir(buttonsPath)
    client.buttons = client.buttons || new Map()

    console.log(`Cargando botones desde: ${buttonsPath}`)

    for (const folder of folders) {
      const folderPath = join(buttonsPath, folder)

      try {
        const buttonFiles = await readdir(folderPath)

        for (const file of buttonFiles) {
          await loadButtonFile(folderPath, file, client)
        }
      } catch (error) {
        console.warn(`Error leyendo directorio de botones '${folder}':`, error)
      }
    }

    console.log(`Cargados ${client.buttons.size} botones`)

    // Inicializar el handler de eventos si no está ya inicializado
    if (!client.buttonHandlerInitialized) {
      initializeButtonHandler(client)
    }
  } catch (error) {
    console.warn('Directorio de botones no encontrado, saltando carga de botones')
  }
}

/**
 * Carga un archivo de botón específico
 * @param folderPath Ruta del directorio
 * @param file Nombre del archivo
 * @param client Cliente extendido
 */
async function loadButtonFile(folderPath, file, client) {
  if (!file.endsWith('.js')) return

  try {
    const filePath = join(folderPath, file)
    const fileURL = pathToFileURL(filePath).href

    // Importar el módulo del botón
    const buttonModule = await import(fileURL)
    const button = buttonModule.default || buttonModule

    // Validar estructura del botón
    if (!button || !button.id || typeof button.execute !== 'function') {
      console.warn(`Boton invalido en ${file}: falta 'id' o 'execute'`)
      return
    }

    // Registrar el botón
    client.buttons.set(button.id, button)
    console.log(`Boton cargado: ${button.id}`)
  } catch (error) {
    console.error(`Error cargando boton ${file}:`, error)
  }
}

/**
 * Inicializa el handler de eventos para botones
 * @param client Cliente extendido
 */
function initializeButtonHandler(client) {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return

    // Primero buscar coincidencia exacta
    let button = client.buttons.get(interaction.customId)

    // Si no hay coincidencia exacta, buscar por prefijo para IDs dinámicos
    if (!button) {
      for (const [buttonId, buttonHandler] of client.buttons) {
        if (interaction.customId.startsWith(buttonId + '_')) {
          button = buttonHandler
          break
        }
      }
    }

    if (!button) return

    try {
      await button.execute(interaction, client)
    } catch (error) {
      console.error(`Error ejecutando boton ${interaction.customId}:`, error)

      const errorMessage = 'Hubo un error al ejecutar este boton.'

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral })
      } else {
        await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral })
      }
    }
  })

  client.buttonHandlerInitialized = true
  console.log('Handler de botones inicializado correctamente')
}
