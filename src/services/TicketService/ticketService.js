// src/services/TicketService/ticketService.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class TicketService {
  constructor (client) {
    this.client = client
    this.ticketsFilePath = path.join(__dirname, '../../data/tickets.json')
    this.ticketsData = {}
    this.inviteCache = new Map()

    // Asegurarse de que el directorio data existe
    const dataDir = path.join(__dirname, '../../data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    this.loadTickets()
  }

  // Cargar datos de tickets si existen
  loadTickets () {
    try {
      if (fs.existsSync(this.ticketsFilePath)) {
        const data = fs.readFileSync(this.ticketsFilePath, 'utf8')
        this.ticketsData = JSON.parse(data)
        console.log('Datos de tickets cargados correctamente')
      } else {
        console.log('No se encontró archivo de tickets, se iniciará uno nuevo')
        this.saveTickets()
      }
    } catch (error) {
      console.error('Error al cargar los datos de tickets:', error)
      this.ticketsData = {}
      this.saveTickets()
    }
  }

  // Guardar datos de tickets
  saveTickets () {
    try {
      fs.writeFileSync(this.ticketsFilePath, JSON.stringify(this.ticketsData, null, 2))
    } catch (error) {
      console.error('Error al guardar los datos de tickets:', error)
    }
  }

  // Agregar un ticket a un usuario
  addTicket (userId, reason = 'participación') {
    if (!this.ticketsData[userId]) {
      this.ticketsData[userId] = {
        tickets: 0,
        invites: []
      }
    }

    this.ticketsData[userId].tickets += 1
    if (reason === 'invitación') {
      this.ticketsData[userId].invites.push(new Date().toISOString())
    }

    this.saveTickets()
    return this.ticketsData[userId].tickets
  }

  // Obtener tickets de un usuario
  getTickets (userId) {
    if (!this.ticketsData[userId]) return 0
    return this.ticketsData[userId].tickets
  }

  // Obtener todos los datos de tickets
  getAllTickets () {
    return this.ticketsData
  }

  // Cachear invitaciones de un servidor
  async cacheGuildInvites (guild) {
    try {
      const guildInvites = await guild.invites.fetch()
      this.inviteCache.set(guild.id, new Map(guildInvites.map(invite => [invite.code, invite.uses])))
    } catch (err) {
      console.error(`No se pudieron cargar las invitaciones para ${guild.name}:`, err)
    }
  }

  // Obtener invitación usada
  getUsedInvite (guild, newInvites) {
    const oldInvites = this.inviteCache.get(guild.id) || new Map()

    // Encontrar la invitación que se usó
    const usedInvite = newInvites.find(invite => {
      const oldUses = oldInvites.get(invite.code) || 0
      return invite.uses > oldUses
    })

    // Actualizar cache de invitaciones
    this.inviteCache.set(guild.id, new Map(newInvites.map(invite => [invite.code, invite.uses])))

    return usedInvite
  }
}

export default (client) => new TicketService(client)
