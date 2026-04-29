import { Controller } from "koa-es-template";
import * as storage from "../core/infrastructure/storage/index.js";
import { request } from "../core/infrastructure/queue/index.js";
import { cache } from "../core/infrastructure/cache/index.js";
import { redis, scanAnd } from "../utils/redis.js";
import * as YAML from "yaml";

export default class Index extends Controller {
    constructor(config, ...middlewares) {
        super(config, ...middlewares);
        this.get('/configs/info', this.getOne)
        this.get('/configs/exists', this.exists)
        this.get('/configs', this.find)
        this.post('/configs/multiple', this.getMultiple)
        this.put('/configs', this.save)
        this.delete('/configs/info', this.remove)
        this.post('/configs/submit', this.submit)
        this.get('/configs/paths', this.getPaths)
        this.post('/configs/paths', this.fillPaths)
        this.post('/configs/dump', this.dump)
        this.post('/configs/caches/flush', this.flushCache)
        this.post('/configs/caches/gc', this.gc)
        this.post('/configs/caches/migrate', this.migrate)
        this.post('/configs/caches/drop', this.drop)
        this.post('/configs/caches/count', this.count)
        this.get('/configs/caches/export', this.export)
        this.post('/configs/caches/import', this.import)

        this.eventBus.on('save', async (config, operator) => {
            this.logger.info('SAVING...')
            try {
                await storage.saveCache(config.kind, config.name, config.metadata, config.spec)
                await request([ 'save', config, operator ])
                this.logger.info('SAVED.')
            } catch (error) {
                this.logger.info('NOT SAVED.')
                this.logger.info(config, operator)
                this.logger.error(error)
            }
        })

        this.eventBus.on('delete', async (kind, name, operator) => {
            this.logger.info('DELETING...')
            try {
                await storage.removeCache(kind, name)
                await request([ 'removeOne', kind, name, operator ])
                this.logger.info('DELETED.')
            } catch (error) {
                this.logger.info('NOT DELETED.')
                this.logger.info(kind, name, operator)
                this.logger.error(error)
            }
        })

        this.eventBus.on('submit', async (changeSet, operator) => {
            const { deleted = [], saved = [] } = changeSet
            for (const { kind, name } of deleted) {
                await storage.removeCache(kind, name)
                await request([ 'removeOne', kind, name, operator ])
            }
            for (const config of saved) {
                await storage.saveCache(config.kind, config.name, config.metadata, config.spec)
                await request([ 'save', config, operator ])
            }
        })
    }

    async getOne(ctx) {
        const { kind, name, ref } = ctx.query
        ctx.body = await storage.getOne(kind, name, ref).catch(error => {
            this.logger.error(error)
            return null
        })
    }

    async getMultiple(ctx) {
        const { list, full } = ctx.request.body
        ctx.body = await storage.getMultiple({ list, full }).catch(error => {
            this.logger.error(error)
            return []
        })
    }

    async find(ctx) {
        const { kind, prefix = '', full = '1', cacheKey = '' } = ctx.query
        const loadFromStorage = () => storage.find(kind, prefix, ![ '0', 'false' ].includes(full))
            .catch(error => {
                this.logger.error(error)
                return []
            });
        let result
        if (cacheKey) {
            const cached = await redis.get(`{cac-output}:${ cacheKey }`)
            if (cached) result = JSON.parse(cached)
            else {
                result = await loadFromStorage();
                await redis.set(`{cac-output}:${ cacheKey }`, JSON.stringify(result), 'EX', 60 * 60 * 24)
            }
        } else {
            result = await loadFromStorage();
        }

        ctx.body = result
    }

    async exists(ctx) {
        const { kind, name, ref } = ctx.query
        const config = await storage.getOne(kind, name, ref).catch(error => {
            this.logger.error(error)
            return null
        })
        ctx.body = !!config
    }

    async save(ctx) {
        const { kind, name, metadata, spec } = ctx.request.body
        const { operator } = ctx.headers
        this.eventBus.emitAsync('save', { kind, name, metadata: metadata ?? {}, spec: spec ?? {} }, operator)
        ctx.body = { ok: true }
    }

    async remove(ctx) {
        const { kind, name } = ctx.query
        const { operator } = ctx.headers
        this.eventBus.emitAsync('delete', kind, name, operator)
        ctx.body = { ok: true }
    }

    async submit(ctx) {
        const changeSet = ctx.request.body
        const { operator } = ctx.headers
        this.eventBus.emitAsync('submit', changeSet, operator)
        ctx.body = { ok: true }
    }

    async getPaths(ctx) {
        ctx.body = await storage.getTreeFilePaths()
    }

    async fillPaths(ctx) {
        const paths = ctx.request.body
        await cache.fillPaths(paths)
        ctx.body = { ok: true }
    }

    async dump(ctx) {
        const paths = await storage.getTreeFilePaths()
        for (const path of paths) {
            const [ kind, ...segments ] = path.substring(0, path.length - 5).split('/')
            const config = await cache.getOne(kind, segments.join('/'), '', () => null);
            if (config)
                await this.eventBus.emitAsync('save', config, 'dumper')
            else
                this.logger.debug('Not Exists', path)
        }
        ctx.body = { ok: true, paths }
    }

    async flushCache(ctx) {
        const { cacheKey } = ctx.query
        await redis.unlink(`cac-output:${ cacheKey }`)
        ctx.body = { ok: true }
    }

    async gc(ctx) {
        const gcDelegate1 = async keys => {
            for (const key of keys) {
                const yaml = await redis.get(key)
                if (yaml) {
                    const { kind, name } = YAML.parse(yaml)
                    const linkKey = `cac_link:${ kind }:${ name }:HEAD`
                    const link = await redis.get(linkKey)
                    if (link !== key) await redis.unlink(key)
                } else {
                    this.logger.warn(`GC ERROR: #1 ${ key } is not exists!`)
                }
            }
        }
        await scanAnd('cac:*', gcDelegate1)

        const gcDelegate2 = async keys => {
            for (const key of keys) {
                const cacKey = await redis.get(key)
                if (!cacKey) this.logger.warn(`GC ERROR: #2 ${ key } is not exists!`)
                else {
                    const yaml = await redis.get(cacKey)
                    if (!yaml) this.logger.warn(`GC ERROR: #3 ${ cacKey } (link=${ key }) is not exists!`)
                }
            }
        }
        await scanAnd('cac_link:*', gcDelegate2)
        ctx.body = { ok: true }
    }

    async migrate(ctx) {
        const migrateDelegate = async keys => {
            for (const key of keys) {
                const linkFrom = await redis.get(key)
                const config = await redis.get(linkFrom)

                const linkTo = linkFrom.replace('{cac}:', 'cac:')
                await redis.set(linkTo, config)

                const newLinkKey = key.replace('{cac_link}:', 'cac_link:')
                await redis.set(newLinkKey, linkTo)
            }
        }
        await scanAnd('{cac_link}:*', migrateDelegate)
        ctx.body = { ok: true }
    }

    async drop(ctx) {
        const dropDelegate = async keys => {
            for (const key of keys) {
                await redis.unlink(key)
            }
        }
        const { pattern } = ctx.query
        if (pattern)
            await scanAnd(pattern, dropDelegate)
        ctx.body = { ok: true }
    }

    async count(ctx) {
        let result = 0
        const countDelegate = keys => result += keys.length
        const { pattern } = ctx.query
        if (pattern)
            await scanAnd(pattern, countDelegate)
        ctx.body = { ok: true, result }
    }

    async export(ctx) {
        const { exclusion = [] } = ctx.request.query
        const exclusions = [ exclusion ].flat()
        ctx.type = 'application/yaml'
        const paths = (await storage.getTreeFilePaths())
        const yamls = []
        for (const path of paths) {
            if (exclusions.some(exclusion => path.startsWith(exclusion))) continue
            const [ kind, ...segments ] = path.substring(0, path.length - 5).split('/')
            const config = await cache.getOne(kind, segments.join('/'), '', () => null);
            if (config)
                yamls.push(YAML.stringify(config))
            else
                this.logger.debug('Not Exists', path)
        }
        ctx.body = yamls.join(`\n---\n`)
        ctx.set('Content-Disposition', `attachment; filename=cac-${ Date.now() }.yaml`)
    }

    async import(ctx) {
        const configs = YAML.parseAllDocuments(ctx.request.body)
        for (const config of configs) {
            await storage.saveCache(config.kind, config.name, config.metadata, config.spec)
        }
    }
}
