import {
    Events,
    TextDisplayBuilder,
    ContainerBuilder,
    MessageFlags,
    ButtonBuilder,
    ActionRowBuilder,
    SeparatorBuilder,
    MediaGalleryBuilder,
    AttachmentBuilder
} from 'discord.js';
import path from 'path';
import { generateWelcomeImage } from '../../utilities/welcome_image.js';

export default {
    name: Events.GuildMemberAdd,
    once: false,

    async execute(member) {
        try {
            const user = member.user;
            const guild = member.guild;
            const welcomeChannelId = '1288283913181200446';

            // Obtener el canal de bienvenida
            const welcomeChannel = guild.channels.cache.get(welcomeChannelId);
            if (!welcomeChannel) {
                console.error(`Canal de bienvenida no encontrado: ${welcomeChannelId}`);
                return;
            }

            const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 512 });

            const baseImagePath = path.join(process.cwd(), 'assets', 'tema_claro_recortado.png');
            const imageBuffer = await generateWelcomeImage(user.displayName || user.username, avatarUrl, baseImagePath);
            console.log(`Imagen de bienvenida generada para ${user.username}:`, imageBuffer ? 'Éxito' : 'Fallo');

            if (!imageBuffer) {
                console.error(`Error al generar la imagen de bienvenida para ${user.username}`);
                return;
            }

            const fileName = 'bienvenida.png';
            const attachment = new AttachmentBuilder(imageBuffer, {
                name: fileName,
                description: `Imagen de bienvenida personalizada con el avatar y el nombre de ${user.displayName || user.username}`
            });

            const container = new ContainerBuilder();

            const welcomeImage = new MediaGalleryBuilder().addItems([
                {
                    media: {
                        url: `attachment://${fileName}`
                    }
                }
            ]);

            const description = new TextDisplayBuilder().setContent(
                `### <:entrar:1288631392070012960> ${user} ¡Bienvenid@ a la **Comunidad Oficial** de la **EEI**! 🎉\n` +
                '> <:verificado:1288628715982553188> Si eres estudiante en la EEI verifica tu cuenta en <#1299775062215229460>, **pulsa el botón de debajo** `Verifícate`'
            );

            container.addMediaGalleryComponents(welcomeImage);
            container.addTextDisplayComponents(description);
            container.addSeparatorComponents(
                new SeparatorBuilder()
            );

            const buttonPersonalizar = new ButtonBuilder()
                .setURL('https://discord.com/channels/1288206483091361885/customize-community')
                .setLabel('Personaliza tu Perfil')
                .setStyle('Link')
                .setEmoji('🎨');

            const buttonVerificar = new ButtonBuilder()
                .setURL('https://discord.com/channels/1288206483091361885/1299775062215229460')
                .setLabel('Verifícate')
                .setStyle('Link')
                .setEmoji('<:verificado:1288628715982553188>');

            container.addActionRowComponents(
                new ActionRowBuilder().addComponents(buttonPersonalizar, buttonVerificar)
            );

            await welcomeChannel.send({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
                files: [attachment]
            });

            console.log(`Mensaje de bienvenida enviado para ${user.username} en el canal ${welcomeChannel.name}`);
        } catch (error) {
            console.error('Error en el evento de nuevo miembro:', error);
        }
    }
};
