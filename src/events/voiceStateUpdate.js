import { VoiceState } from 'discord.js';

export default {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    const user = newState.member?.user;
    if (!user) return; // Validación por si no hay usuario

    if (!oldState.channel && newState.channel) {
      console.log(`${user.tag} se unió al canal de voz ${newState.channel.name}`);
    } else if (oldState.channel && !newState.channel) {
      console.log(`${user.tag} salió del canal de voz ${oldState.channel.name}`);
    }
  }
}
