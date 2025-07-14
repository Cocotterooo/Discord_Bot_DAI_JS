export class InstagramAPIClient {
  constructor(baseURL, accessToken) {
    this.baseURL = baseURL
    this.accessToken = accessToken
  }

  async request(endpoint, method = 'GET', params = {}) {
    try {
      const url = new URL(endpoint, this.baseURL)

      // Agregar parámetros a la URL
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key])
      })

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error en request de Instagram API:', error)
      throw error
    }
  }

  async getMediaList() {
    try {
      return await this.request('/me/media', 'GET', {
        fields: 'id,caption,media_type,media_url,permalink,timestamp'
      })
    } catch (error) {
      console.error('Error obteniendo lista de media:', error)
      return null
    }
  }
}

export default function createInstagramClient(client) {
  // Aquí puedes configurar el cliente de Instagram si es necesario
  return new InstagramAPIClient(
    process.env.INSTAGRAM_BASE_URL || 'https://graph.instagram.com',
    process.env.INSTAGRAM_ACCESS_TOKEN
  )
}
