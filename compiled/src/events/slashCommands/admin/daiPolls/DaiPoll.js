var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder } from 'discord.js';
import { discordConfig } from '../../../../../config.ts';
export class DaiPoll {
    constructor(title, author, channel, options, secret = 'n', duration) {
        this.title = title;
        this.timeStamp = Date.now();
        this.secret = secret.toUpperCase() === 'Y';
        this.channel = channel;
        this.author = author;
        this.duration = duration;
        this.end_time = this.timeStamp + duration * 1000;
        this.options = options.trim().split(',').map(o => o.trim());
        this.totalVotes = {
            totalVotes: 0,
            options: this.options.map((option) => ({
                name: option,
                votes: 0,
                users: [],
            })),
        };
        this.votersInfo = [];
        this.status = true;
        this.barLength = 13;
    }
    updateRemainingTime(endTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = Date.now();
            const remainingTimeMs = endTime - now;
            if (remainingTimeMs <= 0) {
                return null;
            }
            const minutes = Math.floor(remainingTimeMs / 1000 / 60);
            const seconds = Math.floor((remainingTimeMs / 1000) % 60);
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        });
    }
    embedPoll() {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultProgressBar = '⬛'.repeat(this.barLength);
            if (this.end_time !== undefined) {
                const remainingTime = yield this.updateRemainingTime(this.end_time);
                this.remainingTime = remainingTime !== null ? remainingTime : undefined;
            }
            if (this.remainingTime === undefined) {
                this.remainingTime = '00:00';
            }
            if (this.remainingTime === null) {
                this.status = false;
            }
            const embed = new EmbedBuilder()
                .setDescription(`## 🗳️ ${this.title}\n` +
                `> **Tipo:** ${this.secret ? '🔒 Secreta' : '🔓 Pública'}\n` +
                `> **Estado:** ${this.status
                    ? `<a:online:1288631919352877097> **Abierta** - **${this.remainingTime}**`
                    : '<a:offline:1288631912180744205> **Votación finalizada**'}\n`)
                .setColor(discordConfig.COLOR || 0x0099ff)
                .setFooter({
                text: 'Delegación de Alumnos de Industriales - UVigo',
                iconURL: 'https://cdn.discordapp.com/emojis/1288628804276977735.webp?size=96&quality=lossless',
            })
                .setImage('https://i.imgur.com/8GkOfv1.png');
            if (this.secret && this.status) {
                this.options.forEach((option) => {
                    embed.addFields({
                        name: `<:chat_ind:1288628721842130976> ${option}`,
                        value: '> **¿?** votos (**-%**)\n' + `> ${defaultProgressBar}`,
                        inline: false,
                    });
                });
            }
            else {
                this.totalVotes.options.forEach((option) => {
                    const percentage = this.totalVotes.totalVotes > 0
                        ? ((option.votes / this.totalVotes.totalVotes) * 100).toFixed(2)
                        : '0.00';
                    const lengthBarFilled = Math.round(this.barLength * (Number(percentage) / 100));
                    const bar = '🟦'.repeat(lengthBarFilled) + '⬛'.repeat(this.barLength - lengthBarFilled);
                    embed.addFields({
                        name: `<:chat_ind:1288628721842130976> ${option.name}`,
                        value: `> **${option.votes}** votos (**${percentage}%**)\n> ${bar}`,
                        inline: false,
                    });
                });
            }
            const listOfVoters = this.votersInfo.map((voter) => voter.userName);
            let votersValue;
            if (this.secret || !this.status) {
                votersValue = listOfVoters.length > 0
                    ? '```' + listOfVoters.join(', ') + '```'
                    : '```Nadie ha votado aún```';
            }
            else {
                votersValue = '```No ha terminado la votación```';
            }
            embed.addFields({
                name: `<:us:1288631396364976128> Votantes: ${this.totalVotes.totalVotes}`,
                value: votersValue,
                inline: true,
            });
            return embed;
        });
    }
    newVote(interaction, option) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!interaction.isCommand() && !interaction.isButton())
                return;
            const userId = (_a = interaction.user) === null || _a === void 0 ? void 0 : _a.id;
            const user = interaction.user;
            const member = interaction.member;
            const userName = (member === null || member === void 0 ? void 0 : member.nickname) || user.username;
            if (!userId || !user) {
                console.error('No se pudo obtener el usuario de la interacción.');
                return;
            }
            const hasVoted = this.votersInfo.some((voter) => voter.id === userId);
            if (hasVoted) {
                yield interaction.followUp({
                    content: '<:no:1288631410558767156> Ya has votado.',
                    ephemeral: true,
                });
                return;
            }
            if (!this.options.includes(option)) {
                yield interaction.followUp({
                    content: '<:no:1288631410558767156> Opción no válida.',
                    ephemeral: true,
                });
                return;
            }
            this.votersInfo.push({
                id: userId,
                user,
                userName,
                option,
            });
            this.totalVotes.options.forEach((opt) => {
                if (opt.name === option) {
                    opt.votes += 1;
                    opt.users.push(userName);
                }
            });
            this.totalVotes.totalVotes += 1;
            yield interaction.followUp({
                content: `<:si:1288631406452412428> Has votado: **${option}**`,
                ephemeral: true,
            });
        });
    }
    toJSON() {
        return JSON.stringify({
            title: this.title,
            timeStamp: this.timeStamp,
            secret: this.secret,
            channelId: this.channel.id, // No guardar objeto de canal entero
            author: this.author,
            duration: this.duration,
            end_time: this.end_time,
            options: this.options,
            totalVotes: this.totalVotes,
            votersInfo: this.votersInfo,
            status: this.status,
            barLength: this.barLength,
        }, null, 2);
    }
    detailedResultsEmbed() {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = new EmbedBuilder()
                .setTitle('Resultados detallados de la votación')
                .setColor(discordConfig.COLOR || 0x0099ff)
                .setImage('https://i.imgur.com/8GkOfv1.png');
            this.totalVotes.options.forEach((option) => {
                embed.addFields({
                    name: `<:chat_ind:1288628721842130976> ${option.name}`,
                    value: option.users.length > 0
                        ? '```' + option.users.join(', ') + '```'
                        : '```Ningún voto```',
                    inline: false,
                });
            });
            embed.setFooter({
                text: 'Delegación de Alumnos de Industriales - UVigo',
                iconURL: 'https://cdn.discordapp.com/emojis/1288628804276977735.webp?size=96&quality=lossless',
            });
            return embed;
        });
    }
    sendPrivateResults(client, userIds) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const userId of userIds) {
                try {
                    const user = yield client.users.fetch(userId);
                    if (user) {
                        yield user.send({
                            content: `## Resultados de la votación ➡️ **${this.title}**`,
                            embeds: [yield this.embedPoll()],
                        });
                        yield user.send({
                            embeds: [yield this.detailedResultsEmbed()],
                        });
                    }
                }
                catch (error) {
                    console.error(`Error al enviar resultados privados al usuario ${userId}:`, error);
                }
            }
        });
    }
}
