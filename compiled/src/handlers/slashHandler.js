var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export function loadSlash(client) {
    return __awaiter(this, void 0, void 0, function* () {
        const slashCommands = join(__dirname, '..', 'events', 'slashCommands');
        yield scanDirectoryForCommands(slashCommands, client);
    });
}
function scanDirectoryForCommands(directory, client) {
    return __awaiter(this, void 0, void 0, function* () {
        const items = yield readdir(directory);
        for (const item of items) {
            const itemPath = join(directory, item);
            const stats = yield stat(itemPath);
            if (stats.isDirectory()) {
                // Recursivamente escanear subcarpetas
                yield scanDirectoryForCommands(itemPath, client);
                continue;
            }
            // Solo procesar archivos .js o .mjs
            if (!item.endsWith('.ts')) {
                continue;
            }
            try {
                const commandPath = pathToFileURL(itemPath).href;
                const command = yield import(commandPath);
                if (!command.default || !command.default.data || !command.default.data.name) {
                    console.warn(`⚠️ El archivo ${item} no tiene una propiedad 'data.name'. Se omitirá.`);
                    continue;
                }
                client.slashCommands.set(command.default.data.name, command.default);
                console.log(`🔵 (/) Comando cargado: ${command.default.data.name}`);
            }
            catch (error) {
                console.error(`❌ Error al cargar el comando ${item}:`, error.message);
            }
        }
    });
}
