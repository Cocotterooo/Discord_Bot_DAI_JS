export class InstagramAPIClient {
  constructor (baseURL, accessToken) {
    this.baseURL = baseURL
    this.accessToken = accessToken
  }

  async #request (endpoint, method = 'GET', params = {}) {
    try {
      // Convertir los parámetros a una cadena de consulta (query string)
      const queryParams = new URLSearchParams({ ...params, access_token: this.accessToken }).toString()
      const url = `${this.baseURL}${endpoint}?${queryParams}`

      // Realizar la petición HTTP
      const response = await fetch(url, { method })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error?.message || 'Error en la API de Instagram')

      return data
    } catch (error) {
      console.error(`❌ Error en la petición a ${endpoint}:`, error.message)
      return null
    }
  }

  async getUserProfile () {
    return await this.#request('/me', 'GET', { fields: 'id,username,account_type' })
  }

  async getUserMedia () {
    return await this.#request('/me/media', 'GET', { fields: 'id,caption,media_type,media_url,timestamp' })
  }
}
