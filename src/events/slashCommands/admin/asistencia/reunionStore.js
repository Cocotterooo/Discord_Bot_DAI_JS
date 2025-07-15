// Almacenamiento de la reunión activa (solo una a la vez)
let reunionActiva = null

export function getReunionActiva() {
  return reunionActiva
}

export function setReunionActiva(reunion) {
  reunionActiva = reunion
}

export function clearReunionActiva() {
  reunionActiva = null
}
