import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(new URL(import.meta.url));
const __dirname = path.dirname(__filename);

/**
 * Carga todos los eventos del bot desde las carpetas de eventos
 * @param {Client} client - El cliente de Discord
 */
export async function loadEvents(client) {
    const eventsPath = path.join(__dirname, '..', 'events');
    let eventsLoaded = 0;

    try {
        // Cargar eventos desde la carpeta principal events
        if (fs.existsSync(eventsPath)) {
            const eventFiles = fs.readdirSync(eventsPath);

            for (const file of eventFiles) {
                const filePath = path.join(eventsPath, file);
                const stat = fs.statSync(filePath);

                if (stat.isFile() && file.endsWith('.js')) {
                    // Cargar evento individual
                    try {
                        const eventModule = await import(`file://${filePath}`);
                        const event = eventModule.default;

                        if (event && event.name) {
                            if (event.once) {
                                client.once(event.name, (...args) => event.execute(...args));
                            } else {
                                client.on(event.name, (...args) => event.execute(...args));
                            }
                            console.log(`🎯 Evento cargado: ${event.name}`);
                            eventsLoaded++;
                        }
                    } catch (error) {
                        console.error(`❌ Error cargando evento ${file}:`, error);
                    }
                }
            }
        }

        // Cargar eventos desde la subcarpeta events/events
        const subEventsPath = path.join(eventsPath, 'events');
        if (fs.existsSync(subEventsPath)) {
            const subEventFiles = fs.readdirSync(subEventsPath);

            for (const file of subEventFiles) {
                if (file.endsWith('.js')) {
                    const filePath = path.join(subEventsPath, file);

                    try {
                        const eventModule = await import(`file://${filePath}`);
                        const event = eventModule.default;

                        if (event && event.name) {
                            if (event.once) {
                                client.once(event.name, (...args) => event.execute(...args));
                            } else {
                                client.on(event.name, (...args) => event.execute(...args));
                            }
                            console.log(`🎯 Evento cargado: ${event.name}`);
                            eventsLoaded++;
                        }
                    } catch (error) {
                        console.error(`❌ Error cargando evento ${file}:`, error);
                    }
                }
            }
        }

        console.log(`✅ Total de eventos cargados: ${eventsLoaded}`.green);
        return eventsLoaded;
    } catch (error) {
        console.error('❌ Error al cargar eventos:', error);
        return 0;
    }
}
