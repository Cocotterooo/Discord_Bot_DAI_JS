from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO

#* Función para cargar la imagen base
def cargar_imagen_base(base_image_path):
    try:
        return Image.open(base_image_path)
    except Exception as e:
        print(f"Error al cargar la imagen base: {e}")
        return None


#* Función para obtener y redimensionar el avatar del usuario
def obtener_avatar(avatar_url, size=(200, 200)):
    try:
        response = requests.get(avatar_url)
        avatar_image = Image.open(BytesIO(response.content)).resize(size)
        return avatar_image
    except Exception as e:
        print(f"Error al cargar el avatar: {e}")
        return None


#* Función para hacer el avatar circular con fondo transparente
def make_round_avatar(avatar_image, size=(200, 200)):
    avatar_mask = Image.new("L", size, 0)
    draw_mask = ImageDraw.Draw(avatar_mask)
    draw_mask.ellipse((0, 0, *size), fill=255)
    avatar_image = avatar_image.convert("RGBA")
    avatar_image.putalpha(avatar_mask)
    return avatar_image


#* Función para añadir un borde circular al avatar
def add_border_avatar(avatar_image, border_size=6, border_color=(255, 214, 91)):
    avatar_with_border = Image.new("RGBA", (avatar_image.width + border_size * 2, avatar_image.height + border_size * 2), (0, 0, 0, 0))
    draw = ImageDraw.Draw(avatar_with_border)
    draw.ellipse([0, 0, avatar_with_border.width, avatar_with_border.height], fill=border_color)
    avatar_with_border.paste(avatar_image, (border_size, border_size), avatar_image)
    return avatar_with_border


#* Función para cargar la fuente personalizada
def load_font(font_path, font_size):
    try:
        return ImageFont.truetype(font_path, font_size)
    except Exception as e:
        print(f"Error al cargar la fuente: {e}")
        return None


#* Función para escribir el texto de bienvenida
def write_welcome_text(draw, nombre_usuario, font, base_image_height, x_start=250):
    text_bienvenido = "¡Bienvenid@, "
    text_exclamacion = "!"
    
    # Calcular la posición vertical centrada para el texto
    text_height = font.getbbox(text_bienvenido)[1]
    y_centered = (base_image_height - text_height) // 2 - 30
    y_start = y_centered

    # Escribir los textos
    draw.text((x_start, y_start), text_bienvenido, (255, 214, 91), font=font)
    text_bienvenido_width = font.getbbox(text_bienvenido)[2]

    # Escribir el nombre del usuario
    x_new = x_start + text_bienvenido_width
    draw.text((x_new, y_start), nombre_usuario, (224, 168, 0), font=font)
    text_usuario_width = font.getbbox(nombre_usuario)[2]

    # Escribir el signo de exclamación
    x_new += text_usuario_width
    draw.text((x_new, y_start), text_exclamacion, (255, 214, 91), font=font)


#* Función principal para generar la imagen de bienvenida
def generate_welcome_image(nombre_usuario, avatar_url, base_image_path):
    # Cargar imagen base
    base_image = cargar_imagen_base(base_image_path)
    if base_image is None:
        return None

    # Obtener avatar y procesarlo
    avatar_image = obtener_avatar(avatar_url)
    if avatar_image is None:
        return None
    
    avatar_image = make_round_avatar(avatar_image)
    avatar_with_border = add_border_avatar(avatar_image)

    # Cargar fuente personalizada
    font = load_font("assets/fonts/Comfortaa-Bold.ttf", 60)
    if font is None:
        return None

    # Crear objeto de dibujo y escribir texto
    draw = ImageDraw.Draw(base_image)
    write_welcome_text(draw, nombre_usuario, font, base_image.size[1])

    # Pegar el avatar en la imagen base
    avatar_position_y = (base_image.size[1] - avatar_with_border.size[1]) // 2
    base_image.paste(avatar_with_border, (25, avatar_position_y), avatar_with_border)

    # Guardar la imagen final en un buffer y retornarla
    image_binary = BytesIO()
    try:
        base_image.save(image_binary, 'PNG')
        image_binary.seek(0)
    except Exception as e:
        print(f"Error al guardar la imagen: {e}")
        return None

    return image_binary
