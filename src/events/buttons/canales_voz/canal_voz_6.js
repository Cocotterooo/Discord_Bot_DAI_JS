import { handleVoiceChannelButton } from './voiceChannelHandler.js'

export default {
  id: 'canal_voz_6',

  async execute(interaction, client) {
    await handleVoiceChannelButton(interaction, client, 6)
  }
}
