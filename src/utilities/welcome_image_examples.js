import { generateWelcomeImage, saveWelcomeImage } from './welcome_image.js';
import path from 'path';

/**
 * Ejemplo de uso de la función generateWelcomeImage
 * Este archivo muestra cómo integrar la generación de imágenes de bienvenida
 * en tu bot de Discord
 */

// Ejemplo 1: Generar imagen de bienvenida y obtener buffer
async function ejemploGenerarImagen() {
    const nombreUsuario = 'Usuario123';
    const avatarUrl = 'https://cdn.discordapp.com/avatars/123456789/avatar_hash.png';
    const baseImagePath = path.join(process.cwd(), 'assets', 'tema_claro_recortado.png');

    try {
        const imageBuffer = await generateWelcomeImage(nombreUsuario, avatarUrl, baseImagePath);

        if (imageBuffer) {
            console.log('✅ Imagen de bienvenida generada correctamente');
            console.log(`📊 Tamaño del buffer: ${imageBuffer.length} bytes`);
            return imageBuffer;
        } else {
            console.error('❌ Error al generar la imagen de bienvenida');
            return null;
        }
    } catch (error) {
        console.error('❌ Error:', error);
        return null;
    }
}

// Ejemplo 2: Generar y guardar imagen de bienvenida en disco
async function ejemploGuardarImagen() {
    const nombreUsuario = 'TestUser';
    const avatarUrl = 'https://cdn.discordapp.com/avatars/123456789/avatar_hash.png';
    const baseImagePath = path.join(process.cwd(), 'assets', 'tema_claro_recortado.png');
    const outputPath = path.join(process.cwd(), 'test_welcome.png');

    try {
        const success = await saveWelcomeImage(nombreUsuario, avatarUrl, baseImagePath, outputPath);

        if (success) {
            console.log('✅ Imagen guardada correctamente en:', outputPath);
        } else {
            console.error('❌ Error al guardar la imagen');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Ejemplo 3: Uso en un evento de Discord (guildMemberAdd)

// Ejemplo 4: Comando slash para generar imagen de bienvenida manualmente
export const welcomeImageCommand = {
    data: {
        name: 'welcome-image',
        description: 'Genera una imagen de bienvenida personalizada',
        options: [
            {
                name: 'usuario',
                description: 'Usuario para generar la imagen',
                type: 6, // USER type
                required: false
            }
        ]
    },

    async execute(interaction) {
        try {
            // Diferir la respuesta porque la generación puede tomar tiempo
            await interaction.deferReply();

            // Obtener el usuario objetivo (o el que ejecuta el comando)
            const targetUser = interaction.options.getUser('usuario') || interaction.user;
            const member = interaction.guild.members.cache.get(targetUser.id);

            const nombreUsuario = member?.displayName || targetUser.username;
            const avatarUrl = targetUser.displayAvatarURL({
                format: 'png',
                size: 256
            });

            // Generar imagen
            const baseImagePath = path.join(process.cwd(), 'assets', 'tema_claro_recortado.png');
            const imageBuffer = await generateWelcomeImage(nombreUsuario, avatarUrl, baseImagePath);

            if (imageBuffer) {
                await interaction.editReply({
                    content: `🎨 ¡Imagen de bienvenida generada para **${nombreUsuario}**!`,
                    files: [{
                        attachment: imageBuffer,
                        name: 'welcome.png'
                    }]
                });
            } else {
                await interaction.editReply({
                    content: '❌ Error al generar la imagen de bienvenida.'
                });
            }
        } catch (error) {
            console.error('Error en welcome-image command:', error);

            const errorMessage = '❌ Ocurrió un error al generar la imagen de bienvenida.';

            if (interaction.deferred) {
                await interaction.editReply({ content: errorMessage });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
};

// Exportar funciones de ejemplo
export {
    ejemploGenerarImagen,
    ejemploGuardarImagen
};

// Si ejecutas este archivo directamente, ejecutará los ejemplos
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🚀 Ejecutando ejemplos de welcome_image...\n');

    console.log('📝 Ejemplo 1: Generar imagen en memoria...');
    await ejemploGenerarImagen();

    console.log('\n📝 Ejemplo 2: Generar y guardar imagen...');
    await ejemploGuardarImagen();

    console.log('\n✅ Ejemplos completados');
}
