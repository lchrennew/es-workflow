import crypto from 'crypto'

export const digest = string => {
    const hash = crypto.createHash('sha1')
    hash.update(`blob ${Buffer.from(string).length}\0${string}`)
    return hash.digest('hex')
}

