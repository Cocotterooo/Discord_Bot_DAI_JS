import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Client, ButtonInteraction } from 'discord.js';

const __filename = fileURLToPath(new URL(import.meta.url));
const __dirname = dirname(__filename);

// Tipamos la estructura que cada botón debe tener
interface Button {
  id: string;
  execute: (interaction: ButtonInteraction, client: Client) => Promise<void>;
}

// Extendemos el Client para incluir botones y un flag de inicialización
interface ExtendedClient extends Client {
  buttons: Map<string, Button>;
  buttonHandlerInitialized?: boolean;
}

export async function loadButtons(client: ExtendedClient): Promise<void> {
  const buttonsPath = join(__dirname, '..', 'events', 'buttons');
  const folders = await readdir(buttonsPath);

  client.buttons = client.buttons || new Map<string, Button>();

  for (const folder of folders) {
    const buttonFiles = await readdir(join(buttonsPath, folder));

    for (const file of buttonFiles) {
      try {
        const buttonPath = pathToFileURL(join(buttonsPath, folder, file)).href;
        const buttonModule = await import(buttonPath);
        const button: Button = buttonModule.default;

        if (!button || !button.id) {
          console.warn(`⚠️ El archivo ${file} no tiene una propiedad 'id'. Se omitirá.`);
          continue;
        }

        client.buttons.set(button.id, button);
        console.log(`🔘 Botón cargado: ${folder}/${button.id}`);
      } catch (error: any) {
        console.error(`❌ Error al cargar el botón ${file}:`, error.message);
      }
    }
  }

  if (!client.buttonHandlerInitialized) {
    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton()) return;

      const button = client.buttons.get(interaction.customId);
      if (!button) return;

      try {
        await button.execute(interaction, client);
      } catch (error: any) {
        console.error(`❌ Error al ejecutar el botón ${interaction.customId}:`, error.message);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: 'Hubo un error al ejecutar este botón.',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: 'Hubo un error al ejecutar este botón.',
            ephemeral: true,
          });
        }
      }
    });

    client.buttonHandlerInitialized = true;
    console.log('🔄 Handler de botones inicializado correctamente');
  }
}
