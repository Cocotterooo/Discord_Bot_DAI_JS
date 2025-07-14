import { createCanvas, loadImage, registerFont } from 'canvas';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// MARK: Cargar imagen base
/**
 * Función para cargar la imagen base
 * @param {string} baseImagePath - Ruta de la imagen base
 * @returns {Promise<Image|null>} - Imagen cargada o null si hay error
 */
async function cargarImagenBase(baseImagePath) {
    try {
        return await loadImage(baseImagePath);
    } catch (error) {
        console.error(`Error al cargar la imagen base: ${error}`);
        return null;
    }
}

// MARK: Obtener avatar del usuario
/**
 * Función para obtener y redimensionar el avatar del usuario
 * @param {string} avatarUrl - URL del avatar del usuario
 * @param {Array<number>} size - Tamaño del avatar [width, height]
 * @returns {Promise<Image|null>} - Avatar redimensionado o null si hay error
 */
async function obtenerAvatar(avatarUrl, size = [200, 200]) {
    try {
        const response = await fetch(avatarUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const avatarImage = await loadImage(buffer);

        // Crear canvas para redimensionar
        const canvas = createCanvas(size[0], size[1]);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(avatarImage, 0, 0, size[0], size[1]);

        return await loadImage(canvas.toBuffer());
    } catch (error) {
        console.error(`Error al cargar el avatar: ${error}`);
        return null;
    }
}

// MARK: Avatar circular con borde
/**
 * Función para hacer el avatar circular con borde
 * @param {Image} avatarImage - Imagen del avatar
 * @param {Array<number>} size - Tamaño del avatar [width, height]
 * @param {number} borderSize - Tamaño del borde
 * @param {string} borderColor - Color del borde
 * @returns {Canvas} - Canvas con el avatar circular
 */
function makeRoundAvatarWithBorder(avatarImage, size = [200, 200], borderSize = 6, borderColor = '#00ace2') {
    const totalSize = [size[0] + borderSize * 2, size[1] + borderSize * 2];
    const canvas = createCanvas(totalSize[0], totalSize[1]);
    const ctx = canvas.getContext('2d');

    // Crear círculo con borde
    ctx.beginPath();
    ctx.arc(totalSize[0] / 2, totalSize[1] / 2, totalSize[0] / 2, 0, Math.PI * 2);
    ctx.fillStyle = borderColor;
    ctx.fill();

    // Crear máscara circular para el avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(totalSize[0] / 2, totalSize[1] / 2, size[0] / 2, 0, Math.PI * 2);
    ctx.clip();

    // Dibujar el avatar dentro del círculo
    ctx.drawImage(avatarImage, borderSize, borderSize, size[0], size[1]);
    ctx.restore();

    return canvas;
}

// MARK: Fuente
/**
 * Función para cargar la fuente personalizada
 * @param {string} fontPath - Ruta de la fuente
 * @param {string} fontFamily - Nombre de la familia de fuentes
 */
function loadFont(fontPath, fontFamily) {
    try {
        if (fs.existsSync(fontPath)) {
            registerFont(fontPath, { family: fontFamily });
            return true;
        } else {
            console.warn(`Fuente no encontrada: ${fontPath}`);
            return false;
        }
    } catch (error) {
        console.error(`Error al cargar la fuente: ${error}`);
        return false;
    }
}

// MARK: Texto de bienvenida
/**
 * Función para escribir el texto de bienvenida
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {string} nombreUsuario - Nombre del usuario
 * @param {string} font - Especificación de la fuente
 * @param {number} baseImageHeight - Altura de la imagen base
 * @param {number} xStart - Posición X inicial
 */
function writeWelcomeText(ctx, nombreUsuario, font, baseImageHeight, xStart = 250) {
    const textBienvenido = '¡Bienvenid@, ';
    const textExclamacion = '!';

    // Configurar fuente
    ctx.font = font;

    // Calcular la posición vertical centrada para el texto
    const textMetrics = ctx.measureText(textBienvenido);
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    const yCentered = (baseImageHeight / 2) + (textMetrics.actualBoundingBoxAscent / 2);
    const yStart = yCentered;

    // Escribir "¡Bienvenid@, "
    ctx.fillStyle = '#00ace2'; // Color dorado
    ctx.fillText(textBienvenido, xStart, yStart);
    const textBienvenidoWidth = ctx.measureText(textBienvenido).width;

    // Escribir el nombre del usuario
    const xNew = xStart + textBienvenidoWidth;
    ctx.fillStyle = '#005670ff'; // Color dorado más oscuro
    ctx.fillText(nombreUsuario, xNew, yStart);
    const textUsuarioWidth = ctx.measureText(nombreUsuario).width;

    // Escribir el signo de exclamación
    const xFinal = xNew + textUsuarioWidth;
    ctx.fillStyle = '#00ace2'; // Color dorado
    ctx.fillText(textExclamacion, xFinal, yStart);
}

// MARK: Generar imagen de bienvenida
/**
 * Función principal para generar la imagen de bienvenida
 * @param {string} nombreUsuario - Nombre del usuario
 * @param {string} avatarUrl - URL del avatar del usuario
 * @param {string} baseImagePath - Ruta de la imagen base
 * @returns {Promise<Buffer|null>} - Buffer de la imagen generada o null si hay error
 */
export async function generateWelcomeImage(nombreUsuario, avatarUrl, baseImagePath) {
    try {
        // Cargar imagen base
        const baseImage = await cargarImagenBase(baseImagePath);
        if (!baseImage) {
            return null;
        }

        // Obtener avatar y procesarlo
        const avatarImage = await obtenerAvatar(avatarUrl);
        if (!avatarImage) {
            return null;
        }

        // Crear canvas principal con el tamaño de la imagen base
        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext('2d');

        // Dibujar la imagen base
        ctx.drawImage(baseImage, 0, 0);

        // Cargar fuente personalizada
        const fontPath = path.join(process.cwd(), 'assets', 'fonts', 'Comfortaa-Medium.ttf');
        const fontLoaded = loadFont(fontPath, 'Comfortaa');
        const font = fontLoaded ? '60px Comfortaa' : '60px Arial';

        // Escribir texto de bienvenida
        writeWelcomeText(ctx, nombreUsuario, font, baseImage.height);

        // Crear avatar circular con borde
        const avatarCanvas = makeRoundAvatarWithBorder(avatarImage);

        // Calcular posición del avatar (centrado verticalmente, a la izquierda)
        const avatarPositionY = (baseImage.height - avatarCanvas.height) / 2;

        // Dibujar el avatar en la imagen base
        ctx.drawImage(avatarCanvas, 25, avatarPositionY);

        // Retornar el buffer de la imagen final
        return canvas.toBuffer('image/png');
    } catch (error) {
        console.error(`Error al generar la imagen de bienvenida: ${error}`);
        return null;
    }
}

// MARK: Guardar imagen de bienvenida
/**
 * Función auxiliar para guardar la imagen en un archivo (útil para testing)
 * @param {string} nombreUsuario - Nombre del usuario
 * @param {string} avatarUrl - URL del avatar del usuario
 * @param {string} baseImagePath - Ruta de la imagen base
 * @param {string} outputPath - Ruta donde guardar la imagen generada
 * @returns {Promise<boolean>} - True si se guardó correctamente, false si hubo error
 */
export async function saveWelcomeImage(nombreUsuario, avatarUrl, baseImagePath, outputPath) {
    try {
        const imageBuffer = await generateWelcomeImage(nombreUsuario, avatarUrl, baseImagePath);
        if (!imageBuffer) {
            return false;
        }

        fs.writeFileSync(outputPath, imageBuffer);
        console.log(`Imagen de bienvenida guardada en: ${outputPath}`);
        return true;
    } catch (error) {
        console.error(`Error al guardar la imagen: ${error}`);
        return false;
    }
}

// MARK: Exportar funciones
// Exportar funciones individuales
export {
    cargarImagenBase,
    obtenerAvatar,
    makeRoundAvatarWithBorder,
    loadFont,
    writeWelcomeText
};
