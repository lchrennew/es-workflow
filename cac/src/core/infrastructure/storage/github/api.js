import * as github from './clients/index.js'
import { useParameters } from './clients/index.js'
import { json } from "es-fetch-api/middlewares/body.js";
import { DELETE, POST, PUT } from "es-fetch-api/middlewares/methods.js";
import { encodeBase64 } from "../../../../utils/encode.js";
import * as apiPath from "./api-path.js";
import { query } from "es-fetch-api/middlewares/query.js";
import { getLogger } from 'koa-es-template';

const logger = getLogger('GITHUB API')

/**
 * 获取文件
 * @param filepath
 * @param ref <string?>
 * @return {Promise<*>}
 */
export const getFile = async (filepath, ref = undefined) => {
    const data = await github.get(apiPath.contents, useParameters({ filepath }), query({ ref }));
    if (data instanceof Array && !data.length) throw { status: 404, message: 'file not found' }
    return data
}

/**
 * 更新文件
 * @param filepath
 * @param content
 * @param sha
 * @param operator
 * @return {Promise<*|undefined>}
 */
export const updateFile = ({ filepath, content, sha, operator }) =>
    github.modify(
        apiPath.contents,
        PUT,
        useParameters({ filepath }),
        json({ content, sha, message: `${ operator } updated ${ filepath }` }))

/**
 * 创建文件
 * @param filepath
 * @param content
 * @param operator
 * @return {Promise<*|undefined>}
 */
export const createFile = ({ filepath, content, operator }) =>
    github.modify(
        apiPath.contents,
        POST,
        useParameters({ filepath }),
        json({ content, message: `${ operator } created ${ filepath }` })
    )

/**
 * 保存文件（如果不存在创建，如果存在更新）
 * @param filepath
 * @param content
 * @param operator
 * @return {Promise<void>}
 */
export const saveFile = async (filepath, content, operator) => {
    logger.debug('save file:', filepath, operator)
    let file
    const base64 = encodeBase64(content)
    try {
        file = await getFile(filepath)
    } catch (getFileError) {
        logger.debug('save file check failed')

        if (getFileError.status !== 404) {
            throw getFileError
        } else {
            logger.debug('file not exists')
            try {
                logger.debug('creating')
                await updateFile({ filepath, content: base64, operator })
            } catch (createFileError) {
                logger.debug('create file error:', createFileError)
                throw createFileError
            }
        }
        return
    }
    return updateFile({ filepath, content: base64, sha: file?.sha, operator })
}

/**
 * 删除内容
 * @param filepath
 * @param sha
 * @param operator
 * @return {Promise<*|undefined>}
 */
export const deleteContent = (filepath, sha, operator) =>
    github.modify(
        apiPath.contents,
        DELETE,
        useParameters({ filepath }), json({ sha, message: `${ operator } deleted ${ filepath }` }));

/**
 * 获取二进制对象
 * @param sha
 * @return {Promise<*|undefined>}
 */
export const getBlob = async sha =>
    github.get(apiPath.blob, useParameters({ sha }))

/**
 * 获取仓库信息
 * @return {Promise<*|undefined>}
 */
export const getRepository = () =>
    github.get(apiPath.repository)


export const getBranch = branch =>
    github.get(apiPath.branch, useParameters({ branch }))


/**
 * 获取树
 * @param sha
 * @param recursive
 * @param pageIndex
 * @return {Promise<*|undefined>}
 */
export const getTree = (sha, recursive = 1, pageIndex = 1) =>
    github.get(apiPath.tree, useParameters({ sha }), query({ recursive, page: pageIndex }))
