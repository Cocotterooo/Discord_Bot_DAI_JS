import { handleVoiceChannelButton } from './voiceChannelHandler.js'

export default {
  id: 'canal_voz_8',

  async execute(interaction, client) {
    await handleVoiceChannelButton(interaction, client, 8)
  }
}
