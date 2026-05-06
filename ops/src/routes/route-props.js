export const props = route => ({ ...route.meta?.props ?? {}, ...route.query, ...route.params })
export const propsx = x => route => ({ ...x, ...route.meta?.props ?? {}, ...route.query, ...route.params })
export const propsn = (...names) => route => {
    const propsData = { ...route.meta?.props ?? {}, ...route.query, ...route.params };
    for (const name in propsData) {
        if (!names.includes(name)) delete propsData[name]
    }
    return propsData
}
