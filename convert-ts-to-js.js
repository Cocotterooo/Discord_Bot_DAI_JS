import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para convertir archivos TypeScript a JavaScript
async function convertTsToJs(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');

    // Conversiones básicas de TypeScript a JavaScript
    const jsContent = content
      // Eliminar tipos de parámetros de función
      .replace(/\(\s*([^:)]+):\s*[^,)]+/g, '($1')
      .replace(/,\s*([^:)]+):\s*[^,)]+/g, ', $1')
      // Eliminar tipos de retorno de función
      .replace(/\):\s*[^{=>\n]+(\s*[{=>\n])/g, ')$1')
      // Eliminar declaraciones de tipos en variables
      .replace(/:\s*[^=\n;,)}\]]+(\s*[=\n;,)}\]])/g, '$1')
      // Eliminar interfaces y types (básico)
      .replace(/^export\s+interface\s+.*?^}/gms, '')
      .replace(/^interface\s+.*?^}/gms, '')
      .replace(/^export\s+type\s+.*?;/gm, '')
      .replace(/^type\s+.*?;/gm, '')
      // Eliminar imports de tipos
      .replace(/import\s+type\s+.*?;/g, '')
      // Eliminar modificadores de acceso en parámetros
      .replace(/\(\s*(private|public|protected)\s+/g, '(')
      .replace(/,\s*(private|public|protected)\s+/g, ', ')
      // Eliminar as types
      .replace(/\s+as\s+[^;,\n)}\]]+/g, '')
      // Eliminar generic types en declaraciones
      .replace(/<[^>]*>/g, '')
      // Limpiar líneas vacías extra
      .replace(/\n\s*\n\s*\n/g, '\n\n');

    // Escribir el archivo JavaScript
    const jsPath = filePath.replace('.ts', '.js');
    await fs.writeFile(jsPath, jsContent);
    console.log(`✅ Convertido: ${path.relative(__dirname, filePath)} -> ${path.relative(__dirname, jsPath)}`);

    // Eliminar el archivo TypeScript original
    await fs.unlink(filePath);
    console.log(`🗑️ Eliminado: ${path.relative(__dirname, filePath)}`);
  } catch (error) {
    console.error(`❌ Error convirtiendo ${filePath}:`, error.message);
  }
}

// Función para escanear directorios recursivamente
async function scanDirectory(dirPath) {
  try {
    const items = await fs.readdir(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = await fs.stat(itemPath);

      if (stats.isDirectory()) {
        await scanDirectory(itemPath);
      } else if (item.endsWith('.ts')) {
        await convertTsToJs(itemPath);
      }
    }
  } catch (error) {
    console.warn(`⚠️ Error escaneando directorio ${dirPath}:`, error.message);
  }
}

// Función principal
async function main() {
  console.log('🔄 Iniciando conversión de TypeScript a JavaScript...\n');

  const srcPath = path.join(__dirname, 'src');
  await scanDirectory(srcPath);

  console.log('\n✅ Conversión completada!');
  console.log('🔧 Recuerda instalar las dependencias actualizadas con: npm install');
}

main().catch(console.error);
