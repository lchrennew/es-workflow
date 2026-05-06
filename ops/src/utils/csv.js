export const encode = value => (value ?? '').replaceAll('"', '""').replaceAll(/^.*[",].*$/g, s => `"${s}"`)
const BOM = '\uFEFF'
export const download = (rows, filename) => {
    const blob = new Blob([ BOM + rows.join('\n') ], { type: 'text/csv;charset=utf-8' })

    const link  = document.createElement('a')

    link.href = URL.createObjectURL(blob);
    link.download = filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}
