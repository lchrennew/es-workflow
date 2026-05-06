export const depath = (name, path) => {
    if (!name) return ''
    name = bare(name)
    path = bare(path)
    if (name.startsWith(`${path}/`)) return name?.substring(path.length + 1)
    return name
}
export const enpath = (name, path) => `${path}/${name}`
export const entopic = name => name.replaceAll('/', ':')
export const bare = path => path.replace(/^\/|\/$/g, '')