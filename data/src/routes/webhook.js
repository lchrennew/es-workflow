import { Controller } from "koa-es-template";
import { mongo } from "../utils/mongo.js";

export default class WebhookController extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);

        this.post('/request-sent', this.handleRequestSent)
        this.post('/request-void', this.handleRequestVoid)
        this.post('/response-received', this.handleResponseReceived)
    }

    handleRequestSent = async ctx => {
        const event = ctx.request.body

        console.log('Received request.sent event:', {
            eventType: event.eventType,
            runId: event.runId,
            taskId: event.taskId,
            requestId: event.requestId
        })

        try {
            const { runId, taskId, requestId, timestamp, run, task, request } = event

            await mongo.collection('requests').insertOne({
                _id: requestId,
                ...request,
                runId,
                taskId,
                taskName: task?.name || task?.stateName || '',
                status: 'sent',
                responses: [],
                sentAt: new Date(timestamp * 1000),
                createdAt: new Date()
            })

            ctx.body = {
                success: true,
                message: 'request.sent event processed successfully',
                data: {
                    runId,
                    taskId,
                    requestId,
                    timestamp
                }
            }
        } catch (error) {
            console.error('Error processing request.sent event:', error)
            ctx.status = 500
            ctx.body = {
                success: false,
                message: 'Failed to process request.sent event',
                error: error.message
            }
        }
    }

    handleRequestVoid = async ctx => {
        const event = ctx.request.body

        console.log('Received request.void event:', {
            eventType: event.eventType,
            runId: event.runId,
            taskId: event.taskId,
            requestId: event.requestId,
            action: event.action,
            reason: event.reason
        })

        try {
            const { runId, taskId, requestId, action, reason, timestamp, run, task, request } = event

            await mongo.collection('requests').updateOne(
                { _id: requestId },
                {
                    $set: {
                        status: 'voided',
                        action,
                        reason,
                        voidedAt: new Date(timestamp * 1000),
                        updatedAt: new Date()
                    }
                }
            )

            ctx.body = {
                success: true,
                message: 'request.void event processed successfully',
                data: {
                    runId,
                    taskId,
                    requestId,
                    action,
                    reason,
                    timestamp
                }
            }
        } catch (error) {
            console.error('Error processing request.void event:', error)
            ctx.status = 500
            ctx.body = {
                success: false,
                message: 'Failed to process request.void event',
                error: error.message
            }
        }
    }

    handleResponseReceived = async ctx => {
        const event = ctx.request.body

        console.log('Received response.received event:', {
            eventType: event.eventType,
            runId: event.runId,
            taskId: event.taskId,
            requestId: event.requestId,
            responseKind: event.response?.kind
        })

        try {
            const { runId, taskId, requestId, timestamp, run, task, request, response } = event

            const updateData = {
                $push: {
                    responses: {
                        ...response,
                        receivedAt: new Date(timestamp * 1000)
                    }
                },
                $set: {
                    updatedAt: new Date()
                }
            }

            if (response?.kind === 'decision') {
                updateData.$set.status = 'responded'
                updateData.$set.respondedAt = new Date(timestamp * 1000)
            }

            await mongo.collection('requests').updateOne(
                { _id: requestId },
                updateData
            )

            ctx.body = {
                success: true,
                message: 'response.received event processed successfully',
                data: {
                    runId,
                    taskId,
                    requestId,
                    responseKind: response?.kind,
                    timestamp
                }
            }
        } catch (error) {
            console.error('Error processing response.received event:', error)
            ctx.status = 500
            ctx.body = {
                success: false,
                message: 'Failed to process response.received event',
                error: error.message
            }
        }
    }
}
