var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
export default {
    data: new SlashCommandBuilder()
        .setName('ping3')
        .setDescription('Ping pong con botón interactivo.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // 🔹 Solo admins pueden verlo y usarlo
        .setDMPermission(false), // 🔹 No disponible en mensajes directos
    execute(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar si la interacción es utilizable (importante para TypeScript)
            if (!interaction.isRepliable()) {
                console.error('La interacción no se puede responder.');
                return;
            }
            // Crear el embed
            const embed = new EmbedBuilder()
                .setTitle('Pong!')
                .setDescription(`🏓 Latencia API: ${client.ws.ping}ms`) // Usar Latencia API es más claro
                .setColor('#e00000')
                .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }); // Añadir un pie de página es buena práctica
            // Crear el botón
            const customButtonId = 'miBoton'; // Guardar el ID en una variable para evitar errores tipográficos
            const row = new ActionRowBuilder().addComponents(// Especificar el tipo genérico para ActionRowBuilder
            new ButtonBuilder()
                .setCustomId(customButtonId) // Usar la variable
                .setLabel('Haz clic aquí (secreto)')
                .setStyle(ButtonStyle.Primary));
            // Enviar el mensaje con el embed y el botón
            // Usamos deferReply + followUp o reply directamente. Reply es más simple aquí.
            const message = yield interaction.reply({
                embeds: [embed],
                components: [row],
                fetchReply: true // Necesario para obtener el objeto Message y adjuntar el collector
            });
            // Crear un filtro para el collector
            // Solo acepta interacciones de botón, con el ID correcto y del usuario original
            const filter = (i) => {
                return i.isButton() && i.customId === customButtonId && i.user.id === interaction.user.id;
            };
            // Crear el collector directamente sobre el mensaje enviado
            // Tiempo límite de 15 segundos (15000 ms)
            const collector = message.createMessageComponentCollector({ filter, time: 15000 });
            collector.on('collect', (buttonInteraction) => __awaiter(this, void 0, void 0, function* () {
                // Responder al clic del botón de forma efímera
                yield buttonInteraction.reply({
                    content: '¡Pong Secreto! 😉',
                    ephemeral: true // 🔹 Solo el usuario que hizo clic verá este mensaje
                    // No es necesario 'flags: MessageFlags.Ephemeral'
                });
                // Opcionalmente, puedes detener el collector después del primer clic válido si solo quieres una respuesta
                // collector.stop();
            }));
            collector.on('end', collected => {
                // Opcional: Desactivar el botón cuando el collector termina para que no se pueda hacer clic más
                const disabledRow = new ActionRowBuilder().addComponents(ButtonBuilder.from(row.components[0]).setDisabled(true) // Crear un nuevo botón basado en el anterior, pero deshabilitado
                );
                // Intentar editar el mensaje original para deshabilitar el botón
                // Usar interaction.editReply porque message.edit puede fallar si el bot no tiene permisos suficientes o el mensaje fue borrado
                interaction.editReply({ components: [disabledRow] }).catch(error => {
                    console.warn('No se pudo editar el mensaje para deshabilitar el botón:', error.message);
                    // No hacer nada si falla, el botón simplemente seguirá ahí pero no funcionará
                });
                if (collected.size === 0) {
                    console.log(`Collector para el botón '${customButtonId}' finalizado por tiempo límite.`);
                }
                else {
                    console.log(`Collector para el botón '${customButtonId}' finalizado tras recoger ${collected.size} interacciones.`);
                }
            });
        });
    }
};
