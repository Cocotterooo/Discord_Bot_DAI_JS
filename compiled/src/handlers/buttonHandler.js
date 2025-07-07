var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export function loadButtons(client) {
    return __awaiter(this, void 0, void 0, function* () {
        const buttonsPath = join(__dirname, '..', 'events', 'buttons');
        const folders = yield readdir(buttonsPath);
        client.buttons = client.buttons || new Map();
        for (const folder of folders) {
            const buttonFiles = yield readdir(join(buttonsPath, folder));
            for (const file of buttonFiles) {
                try {
                    const buttonPath = pathToFileURL(join(buttonsPath, folder, file)).href;
                    const buttonModule = yield import(buttonPath);
                    const button = buttonModule.default;
                    if (!button || !button.id) {
                        console.warn(`⚠️ El archivo ${file} no tiene una propiedad 'id'. Se omitirá.`);
                        continue;
                    }
                    client.buttons.set(button.id, button);
                    console.log(`🔘 Botón cargado: ${folder}/${button.id}`);
                }
                catch (error) {
                    console.error(`❌ Error al cargar el botón ${file}:`, error.message);
                }
            }
        }
        if (!client.buttonHandlerInitialized) {
            client.on('interactionCreate', (interaction) => __awaiter(this, void 0, void 0, function* () {
                if (!interaction.isButton())
                    return;
                const button = client.buttons.get(interaction.customId);
                if (!button)
                    return;
                try {
                    yield button.execute(interaction, client);
                }
                catch (error) {
                    console.error(`❌ Error al ejecutar el botón ${interaction.customId}:`, error.message);
                    if (interaction.replied || interaction.deferred) {
                        yield interaction.followUp({
                            content: 'Hubo un error al ejecutar este botón.',
                            ephemeral: true,
                        });
                    }
                    else {
                        yield interaction.reply({
                            content: 'Hubo un error al ejecutar este botón.',
                            ephemeral: true,
                        });
                    }
                }
            }));
            client.buttonHandlerInitialized = true;
            console.log('🔄 Handler de botones inicializado correctamente');
        }
    });
}
