import { Controller } from "koa-es-template";
import { mongo } from "../utils/mongo.js";

export default class RequestsController extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);

        this.get('/query', this.queryRequests)
    }

    queryRequests = async ctx => {
        try {
            const { target, status, page = 1, pageSize = 20 } = ctx.query

            const query = {}
            if (target) {
                query.target = target
            }
            if (status) {
                query.status = status
            }

            const skip = (parseInt(page) - 1) * parseInt(pageSize)
            const limit = parseInt(pageSize)

            const [requests, total] = await Promise.all([
                mongo.collection('requests')
                    .find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .toArray(),
                mongo.collection('requests').countDocuments(query)
            ])

            ctx.body = {
                success: true,
                data: {
                    requests,
                    pagination: {
                        page: parseInt(page),
                        pageSize: parseInt(pageSize),
                        total,
                        totalPages: Math.ceil(total / parseInt(pageSize))
                    }
                }
            }
        } catch (error) {
            console.error('Error querying requests:', error)
            ctx.status = 500
            ctx.body = {
                success: false,
                message: 'Failed to query requests',
                error: error.message
            }
        }
    }
}