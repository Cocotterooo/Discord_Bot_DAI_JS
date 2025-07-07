import { readdir, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Client, ButtonInteraction } from 'discord.js';
import { constants } from 'fs';

// Variables para el manejo de rutas
const __filename = fileURLToPath(new URL(import.meta.url));
const __dirname = dirname(__filename);

/**
 * Estructura que debe tener cada botón
 */
interface Button {
  id: string;
  execute: (interaction: ButtonInteraction, client: Client) => Promise<void>;
}

/**
 * Extensión del Client para incluir la gestión de botones
 */
interface ExtendedClient extends Client {
  buttons: Map<string, Button>;
  buttonHandlerInitialized?: boolean;
}

/**
 * Carga todos los botones desde el directorio de eventos
 * @param client Cliente extendido de Discord
 */
export async function loadButtons(client: ExtendedClient): Promise<void> {
  const buttonsPath = join(__dirname, '..', 'events', 'buttons');
  
  try {
    // Verificar si el directorio existe
    await access(buttonsPath, constants.F_OK);
    
    const folders = await readdir(buttonsPath);
    client.buttons = client.buttons || new Map<string, Button>();

    console.log(`🔘 Cargando botones desde: ${buttonsPath}`);

    for (const folder of folders) {
      const folderPath = join(buttonsPath, folder);
      
      try {
        const buttonFiles = await readdir(folderPath);
        
        for (const file of buttonFiles) {
          await loadButtonFile(folderPath, file, client);
        }
      } catch (error) {
        console.warn(`⚠️ Error leyendo directorio de botones '${folder}':`, error);
      }
    }

    console.log(`✅ Cargados ${client.buttons.size} botones`);
    
    // Inicializar el handler de eventos si no está ya inicializado
    if (!client.buttonHandlerInitialized) {
      initializeButtonHandler(client);
    }
  } catch (error) {
    console.warn('⚠️ Directorio de botones no encontrado, saltando carga de botones');
  }
}

/**
 * Carga un archivo de botón específico
 * @param folderPath Ruta del directorio
 * @param file Nombre del archivo
 * @param client Cliente extendido
 */
async function loadButtonFile(folderPath: string, file: string, client: ExtendedClient): Promise<void> {
  if (!file.endsWith('.js')) return;

  try {
    const filePath = join(folderPath, file);
    const fileURL = pathToFileURL(filePath).href;
    
    // Importar el módulo del botón
    const buttonModule = await import(fileURL);
    const button = buttonModule.default || buttonModule;

    // Validar estructura del botón
    if (!button || !button.id || typeof button.execute !== 'function') {
      console.warn(`⚠️ Botón inválido en ${file}: falta 'id' o 'execute'`);
      return;
    }

    // Registrar el botón
    client.buttons.set(button.id, button);
    console.log(`� Botón cargado: ${button.id}`);
  } catch (error) {
    console.error(`❌ Error cargando botón ${file}:`, error);
  }
}

/**
 * Inicializa el handler de eventos para botones
 * @param client Cliente extendido
 */
function initializeButtonHandler(client: ExtendedClient): void {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const button = client.buttons.get(interaction.customId);
    if (!button) return;

    try {
      await button.execute(interaction, client);
    } catch (error) {
      console.error(`❌ Error ejecutando botón ${interaction.customId}:`, error);
      
      const errorMessage = 'Hubo un error al ejecutar este botón.';
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  });

  client.buttonHandlerInitialized = true;
  console.log('🔄 Handler de botones inicializado correctamente');
}
