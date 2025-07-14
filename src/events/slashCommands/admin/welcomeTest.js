import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    TextDisplayBuilder,
    ContainerBuilder,
    MessageFlags,
    SectionBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    SeparatorBuilder,
    UserSelectMenuBuilder,
    MediaGalleryBuilder,
    AttachmentBuilder
} from 'discord.js';
import path from 'path';
import { generateWelcomeImage } from '../../../utilities/welcome_image.js';

export default {
    data: new SlashCommandBuilder()
        .setName('bienvenida-test')
        .setDescription('Mensaje de bienvenida de prueba'),

    async execute(interaction, client) {
        try {
            const user = interaction.user;
            const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 512 });

            const baseImagePath = path.join(process.cwd(), 'assets', 'tema_claro_recortado.png');
            const imageBuffer = await generateWelcomeImage(user.displayName || user.username, avatarUrl, baseImagePath);
            console.log('Imagen de bienvenida generada:', imageBuffer ? 'Éxito' : 'Fallo');

            if (!imageBuffer) {
                return interaction.reply('❌ Error al generar la imagen de bienvenida.');
            }

            const fileName = 'bienvenida.png';
            const attachment = new AttachmentBuilder(imageBuffer, {
                name: fileName,
                description: `Imagen de bienvenida personalizada con el avatar y el nombre de ${user.displayName || user.username}`
            });
            console.log('Adjunto creado:', attachment.name);

            const container = new ContainerBuilder();

            const welcomeImage = new MediaGalleryBuilder().addItems([
                {
                    media: {
                        url: `attachment://${fileName}` // Asegúrate de que coincida EXACTAMENTE con el nombre
                    }
                }
            ])

            const description = new TextDisplayBuilder().setContent(
                `### <:entrar:1288631392070012960> ${user} ¡Bienvenid@ a la **Comunidad Oficial** de la **EEI**! 🎉\n` +
                '> <:verificado:1288628715982553188> Si eres estudiante en la EEI verifica tu cuenta en <#1299775062215229460>, **pulsa el botón de debajo** `Verifícate`'
            );

            container.addMediaGalleryComponents(welcomeImage);
            container.addTextDisplayComponents(description);
            container.addSeparatorComponents(
                new SeparatorBuilder()
            )
            const buttonPersonalizar = new ButtonBuilder() // link al canal de personalización
                .setURL('https://discord.com/channels/1288206483091361885/customize-community')
                .setLabel('Personaliza tu Perfil')
                .setStyle('Link')
                .setEmoji('🎨')
            const buttonVerificar = new ButtonBuilder()
                .setURL('https://discord.com/channels/1288206483091361885/1299775062215229460')
                .setLabel('Verifícate')
                .setStyle('Link')
                .setEmoji('<:verificado:1288628715982553188>')

            container.addActionRowComponents(
                new ActionRowBuilder().addComponents(buttonPersonalizar, buttonVerificar)
            )
            await interaction.channel.send({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
                files: [attachment]
            })
        } catch (error) {
            console.error('Error en el comando de bienvenida:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply('❌ Ocurrió un error al generar la imagen de bienvenida.');
            }
        }
    }
};
