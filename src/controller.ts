import { Request, Response } from 'express'
import { Network } from '@verida/client-ts'
import { buildVeridaUri } from '@verida/helpers'

export default class Controller {

    public static async getData(req: Request, res: Response) {
        const did = req.params[0]
        const contextName = req.params[1]
        const databaseName = req.params[2]

        let deepLinks = req.params[3].split('/')
        const recordId = deepLinks[0]
        deepLinks = deepLinks.splice(1)

        try {
            const uri = buildVeridaUri(did, contextName, databaseName, recordId)
            const record = await Network.getRecord(uri, false)
            if (deepLinks.length) {
                const data = Controller.getDeepLinkValue(record, deepLinks)
                return Controller.buildAttributeResult(res, data)
            }

            return res.status(200).send(record)
        } catch (err: any) {
            if (err.message == 'Non-base58 character') {
                return res.status(400).send({
                    status: "fail",
                    message: `Invalid encoded Verida URI (Non-base58)`
                })
            } else {
                return res.status(400).send({
                    status: "fail",
                    message: err.message
                })
            }
        }
    }

    private static getDeepLinkValue(data: any, deepLinks: string[]): any {
        const nextLink = deepLinks[0]
        if (typeof data[nextLink] === 'undefined') {
            throw new Error('Invalid attribute path')
        }

        if (deepLinks.length == 1) {
            return data[nextLink]
        }

        return Controller.getDeepLinkValue(data[nextLink], deepLinks.splice(1))
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

        return res.status(200).send(data)
    }

    /*public static async getRow(req: Request, res: Response) {
        const id = req.params.id
        if (!id) {
            return res.status(400).send({
                status: "fail",
                message: `Network record ID not specified`
            })
        }

        try {
            const record = await Network.getRecord(id, true)
            return res.status(200).send(record)
        } catch (err: any) {
            if (err.message == 'Non-base58 character') {
                return res.status(400).send({
                    status: "fail",
                    message: `Invalid encoded Verida URI (Non-base58)`
                })
            } else {
                return res.status(400).send({
                    status: "fail",
                    message: err.message
                })
            }
        }
    }

    public static async getDb(req: Request, res: Response) {
        return res.status(500).send({
            status: "fail",
            message: `Not implemented`
        })
    }

    public static async getValue(req: Request, res: Response) {
        return res.status(500).send({
            status: "fail",
            message: `Not implemented`
        })
    }*/
}