import { Request, Response } from 'express'
import { Network } from '@verida/client-ts'
import { BlockchainAnchor } from "@verida/types";
import { activeDIDCount, getDIDs } from '@verida/vda-did-resolver'
import * as redis from 'redis';

const rpcUrls: Record<string, string> = {}

function setRpcUrls() {
    if (process.env['polpos_RPC_URL']) {
        rpcUrls['polpos'] = process.env['polpos_RPC_URL']
    }
    if (process.env['polamoy_RPC_URL']) {
        rpcUrls['polamoy'] = process.env['polamoy_RPC_URL']
    }

    Network.setRpcUrls(rpcUrls)
}

export default class Controller {

    public static async getData(req: Request, res: Response) {
        const veridaUri = `verida://${req.params[0]}`

        const enabledRedisCache = process.env.ENABLED_REDIS_CACHE === 'true'
        let redisClient: redis.RedisClientType
        if (enabledRedisCache) {
            const ignoreCache = req.query.ignoreCache

            redisClient = redis.createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` });
            await redisClient.connect();

            if (!ignoreCache) {
                const cachedData = await redisClient.get(veridaUri)
                if (cachedData) {
                    console.log('Cache hit - ', veridaUri)
                    return Controller.buildAttributeResult(res, cachedData)
                }
            }
        }

        try {
            setRpcUrls()
            const data = await Network.getRecord(veridaUri, false)

            if (enabledRedisCache) {
                const cacheTimeout = process.env.CACHE_DATA_TIMEOUT_SECONDS ? parseInt(process.env.CACHE_DATA_TIMEOUT_SECONDS, 10) : 3600
                redisClient.setEx(veridaUri, cacheTimeout, JSON.stringify(data));
            }

            return Controller.buildAttributeResult(res, data)
        } catch (err: any) {
            return res.status(400).send({
                status: "fail",
                message: err.message
            })
        }
    }

    private static async buildAttributeResult(res: Response, data: any) {
        if (typeof data === 'string') {
            // Detect Base64 image
            const base64ImageMatch = data.match(/^data:(image\/[^/]*);base64,(.*)/)
            if (base64ImageMatch) {
                const contentType = base64ImageMatch[1]
                const imgData = base64ImageMatch[2]
                const img = Buffer.from(imgData, 'base64');

                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Content-Length': img.length
                });

                return res.end(img)
            }
        }

        // Default to JSON response
        res.setHeader('Content-Type', 'application/json')
        return res.status(200).send(data)
    }

    public static async getUri(req: Request, res: Response) {
        const reqParam = req.params[0]
        const params: any = reqParam.split('.')
        const encodedVeridaUri = params[0]

        try {
            const record = await Network.getRecord(encodedVeridaUri, true)
            return res.status(200).send(record)
        } catch (err: any) {
            if (err.message == 'Non-base58 character') {
                return res.status(400).send({
                    status: "fail",
                    message: `Invalid encoded Verida URI (Non-base58)`
                })
            }
        }
    }

    public static async getIPFS(req: Request, res: Response) {
        const ipfsHash = req.params[0]
        const redirectUrl = `https://gateway.moralisipfs.com/ipfs/${ipfsHash}`

        return res.redirect(redirectUrl)
    }

    public static async stats(req: Request, res: Response) {
        const blockchain = <BlockchainAnchor> req.params[0]
        const rpcUrl = rpcUrls[blockchain] ? rpcUrls[blockchain] : ''

        try {
            const count = await activeDIDCount(blockchain, rpcUrl)

            return res.status(200).send({
                activeDIDs: count
            })
        } catch (err: any) {
            console.log(err);
            return res.status(400).send({
                status: "fail",
                message: `Error: ${err.message}`
            })
        }
    }

    public static async dids(req: Request, res: Response) {
        const network = <BlockchainAnchor> req.params[0]
        const order = req.query.order ? parseInt(<string> req.query.order) : 1
        const limit = req.query.limit ? parseInt(<string> req.query.limit) : 20
        let offset = req.query.offset ? parseInt(<string> req.query.offset) : 0

        const rpcUrl = rpcUrls[network] ? rpcUrls[network] : ''

        // Reverse the order
        if (order === -1) {
            const activeDidCount = await activeDIDCount(network, rpcUrl)
            offset = activeDidCount - limit - offset
        }

        try {
            const result: string[] = await getDIDs(network, offset, limit, true, rpcUrl)
            // const dids = result.map((item) => `did:vda:${network}:${item}`)

            return res.status(200).send({
                dids: result
            })
        } catch(err: any) {
            return res.status(400).send({
                status: "fail",
                message: `Error: ${err.message}`
            })
        }
    }

    public static async home(req: Request, res: Response) {
        return res.status(200).send({
            status: "ok"
        })
    }
}