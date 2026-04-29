import PathCache from "./path-cache.js";
import { mongo } from "../../../../utils/mongo.js";

const collectionName = 'cac-paths'

export default class MongoPathCache extends PathCache {

    #getPathIndex = path =>
        [ '', ...path.split(/[/.]/).map((p, i, ps) => ps.slice(0, i + 1).join('/')) ];

    checkExistence = async pathsKey => {
        const cursor = mongo.collection(collectionName)
            .find(
                { keys: pathsKey },
                { projection: { keys: 0 }, limit: 1 });
        const result = await cursor.hasNext();
        await cursor.close()
        return result
    };

    scanPaths = async (key, match) => {
        const cursor = mongo.collection(collectionName)
            .find(
                { paths: match.replace(/[/.]$/, ''), keys: key },
                { projection: { paths: 0, key: 0 } });
        const result = (await cursor.toArray())
            .map(({ _id }) => _id);
        await cursor.close();
        return result;
    };

    onFallback = (pathsKey, paths) =>
        mongo.collection(collectionName)
            .insertMany(
                paths.map(path => ({
                    _id: path,
                    keys: [ pathsKey ],
                    paths: [ ...this.#getPathIndex(path) ],
                })),
                { writeConcern: { w: 0, journal: false } });

    addPath = (owner, repo, path) =>
        mongo.collection(collectionName)
            .updateOne(
                { _id: path },
                {
                    $addToSet: { keys: this.getKey(owner, repo) },
                    $setOnInsert: { paths: [ ...this.#getPathIndex(path) ] }
                },
                { upsert: true, writeConcern: { w: 0, journal: false } });

    removePath = async (owner, repo, path) =>
        mongo.collection(collectionName)
            .deleteOne({ _id: path }, { writeConcern: { w: 0, journal: false } });

    existsPath = async (owner, repo, path) => {
        const cursor = mongo.collection(collectionName)
            .find(
                {
                    _id: path,
                    keys: this.getKey(owner, repo)
                }, {
                    limit: 1
                });
        const result = await cursor.hasNext()
        await cursor.close()
        return result;
    };
}

export const mongoPathCache = new MongoPathCache()