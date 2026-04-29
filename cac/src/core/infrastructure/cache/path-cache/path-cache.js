export default class PathCache {

    /**
     *
     * @param owner
     * @param repo
     * @param path
     * @returns {Promise<void>}
     */
    async addPath(owner, repo, path) {
    }

    /**
     *
     * @param owner
     * @param repo
     * @param path
     * @returns {Promise<void>}
     */
    async removePath(owner, repo, path) {
    }

    /**
     *
     * @param owner
     * @param repo
     * @param path
     * @returns {Promise<void>}
     */
    async existsPath(owner, repo, path) {
    }

    /**
     *
     * @param key
     * @param match
     * @returns {Promise<String[]>}
     */
    async scanPaths(key, match) {
        return []
    }

    /**
     *
     * @param pathsKey
     * @returns {Promise<Boolean>}
     */
    async checkExistence(pathsKey) {
        return false
    }

    /**
     *
     * @param pathsKey
     * @param paths
     * @returns {Promise<void>}
     */
    async onFallback(pathsKey, paths) {
    }

    /**
     *
     * @param owner
     * @param repo
     * @returns {string}
     */
    getKey(owner, repo) {
        return `{cac_paths}:${owner}:${repo}`;
    }

    /**
     *
     * @param owner
     * @param repo
     * @param dir
     * @param fallback
     * @returns {Promise<String[]|*>}
     */
    async getPaths(owner, repo, dir, fallback) {
        const pathsKey = this.getKey(owner, repo)
        const exists = await this.checkExistence(pathsKey)
        if (!exists) {
            const paths = await fallback()
            await this.onFallback(pathsKey, paths);
            return paths.filter(path => path.startsWith(dir))
        }
        return this.scanPaths(pathsKey, dir)
    }

    async fillPaths(owner, repo, paths) {
        for (const path of paths) {
            await this.addPath(owner, repo, path)
        }
    }
}