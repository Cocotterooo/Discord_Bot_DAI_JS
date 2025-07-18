import { handleVoiceChannelButton } from './voiceChannelHandler.js'

export default {
  id: 'canal_voz_4',

  async execute(interaction, client) {
    await handleVoiceChannelButton(interaction, client, 4)
  }
}
