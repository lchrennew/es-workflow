const pattern = /\$(?:(?<expand>\.{3})|(?<type>\((?:Number|Boolean)\))|(?<encode>@))?(?<name>[^$]+)\$/g
const objectPattern = /^\$\.{3}[^$]+\$$/i
const numberPattern = /^\$\(Number\)[^$]+\$$/
const booleanPattern = /^\$\(Boolean\)[^$]+\$$/

export const exec = (string, variables) => {

    const replaced = string.replaceAll(pattern,
        (_, expand, type, encode, name) => {
            if (expand) return JSON.stringify(variables[name] ?? null)
            if (encode) return encodeURIComponent(variables[name] ?? '')
            return variables[name] ?? ''
        })

    if (objectPattern.test(string)) return JSON.parse(replaced)
    if (numberPattern.test(string)) return Number(replaced)
    if (booleanPattern.test(string)) return !['', '0', 'false', 'null', 'undefined', 'NaN'].includes(replaced)
    return replaced

}

export const hashString = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed,
        h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }

    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
