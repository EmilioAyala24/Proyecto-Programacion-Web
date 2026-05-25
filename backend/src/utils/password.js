import crypto from 'crypto'

const ITERACIONES = 100000
const LONGITUD = 64
const DIGEST = 'sha512'

export function generarPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, ITERACIONES, LONGITUD, DIGEST).toString('hex')

  return `${salt}:${hash}`
}

export function verificarPassword(password, passwordHash) {
  if (!password || !passwordHash || !passwordHash.includes(':')) {
    return false
  }

  const [salt, hashGuardado] = passwordHash.split(':')
  const hashCalculado = crypto.pbkdf2Sync(password, salt, ITERACIONES, LONGITUD, DIGEST).toString('hex')
  const bufferGuardado = Buffer.from(hashGuardado, 'hex')
  const bufferCalculado = Buffer.from(hashCalculado, 'hex')

  if (bufferGuardado.length !== bufferCalculado.length) {
    return false
  }

  return crypto.timingSafeEqual(bufferGuardado, bufferCalculado)
}
