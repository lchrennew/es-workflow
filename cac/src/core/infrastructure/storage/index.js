import { deleteContent, getBlob, getBranch, getFile, getRepository, getTree, saveFile } from "./github/api.js";
import { format, safeDump, safeLoad } from "../presentation/index.js";
import { owner, repo } from "./github/clients/index.js";
import { getLogger } from "koa-es-template";
import { decodeBase64 } from "../../../utils/encode.js";
import { cache } from "../cache/index.js";

const logger = getLogger('STORAGE')

const getFilePath = (kind, name) => getKindPath(kind, `${ name }.${ format }`)
const getKindPath = (kind, path) => `${ kind }/${ path }`

const getName = (kind, kindPath) => kindPath.substring(kind.length + 1, kindPath.length - format.length - 1)

const getLatestCommitSha = async () => {
    const defaultBranch = await getDefaultBranch()
    const { commit } = await getBranch(defaultBranch)
    return commit.id
}

/**
 * 读文件内容
 * @param filepath
 * @param ref 分支名、标签名、CommitID
 * @return {Promise<string>}
 */
export const readFile = async (filepath, ref = undefined) => {
    const sha = await getLatestCommitSha()
    return readFileContent(filepath, sha)
}

export const readBlob = async sha => {
    const { content } = await getBlob(sha)
    logger.info('read blob:', content)
    return decodeBase64(content)
}


/**
 * 删除文件
 * @param filepath
 * @param operator
 * @return {Promise<void>}
 */
const deleteFile = async (filepath, operator) => {
    let { sha } = await getFile(filepath)
    await deleteContent(filepath, sha, operator);
}

export const readFileContent = async (filepath, ref = undefined) => {
    const { content } = await getFile(filepath, ref)
    return decodeBase64(content)
}

/**
 * 获取根树
 * @param ref
 * @param pageIndex
 * @return {Promise<*|undefined>}
 */
export const getRootTree = (ref, pageIndex) => getTree(ref, 1, pageIndex)

/**
 * 获取仓库默认分支
 * @return {Promise<*>}
 */
export const getDefaultBranch = async () => {
    const { default_branch: defaultBranch } = await getRepository()
    return defaultBranch
}


export const getTreeFilePaths = async (dir = '') => {
    const fallback = async () => {
        const defaultBranch = await getDefaultBranch()
        let pageIndex = 1
        let hasMore = true
        const paths = []
        while (hasMore) {
            const { tree, truncated } = await getRootTree(defaultBranch, pageIndex)
            hasMore = truncated
            pageIndex++
            tree && paths.push(tree
                .filter(({ type, path }) => type === 'blob' && path.endsWith(`.${ format }`))
                .map(({ path }) => path))
        }
        return paths.flat()
    }

    return cache.getPaths(owner, repo, dir, fallback)
}

export const find = async (kind, prefix, full) => {
    const paths = await getTreeFilePaths(getKindPath(kind, prefix))
    return Promise.all(paths.map(
        async path => {
            const name = getName(kind, path)
            const { metadata, spec } = await getOne(kind, name)
            return { kind, name, metadata, ...(full ? { spec } : {}) }
        }
    ))
};

const fallback = async (kind, name, ref) => {
    let result
    if (ref || ref === 'HEAD') {
        result = await readBlob(ref)
    } else {
        result = await readFile(getFilePath(kind, name), ref)
    }
    return safeLoad(result)
};

export const getOne = async (kind, name, ref) => {
    const onNotExistsInPathsCache = async () => {
        const dir = getKindPath(kind, name)
        const paths = await getTreeFilePaths(dir)
        return paths.length
    }
    const existsInPaths = await cache.existsPath(owner, repo, getFilePath(kind, name), onNotExistsInPathsCache)
    if (!existsInPaths) return null
    return cache.getOne(kind, name, ref, fallback);
};

export const getMultiple = ({ list, full }) =>
    Promise.all(list.map(
        async ({ kind, name, ref }) => {
            const { metadata = {}, spec = {} } = (await getOne(kind, name, ref)) ?? { kind, name }
            return { kind, name, metadata, ...(full ? { spec } : {}) }
        }
    ))

export const saveCache = async (kind, name, metadata, spec) => {
    cache.setToCache({ kind, name, metadata, spec }, cache.getCacLinkKey(kind, name))
    cache.addPath(owner, repo, getFilePath(kind, name))
}

export const save = async ({ kind, name, metadata, spec }, operator) => {
    await saveCache(kind, name, metadata, spec)

    const content = safeDump({ kind, name, metadata, spec })
    await saveFile(getFilePath(kind, name), content, operator)
}

export const removeCache = async (kind, name) => cache.removePath(owner, repo, getFilePath(kind, name))

export const removeOne = (kind, name, operator) =>
    deleteFile(getFilePath(kind, name), operator);
