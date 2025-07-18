import { handleVoiceChannelButton } from './voiceChannelHandler.js'

export default {
  id: 'canal_voz_7',

  async execute(interaction, client) {
    await handleVoiceChannelButton(interaction, client, 7)
  }
}
