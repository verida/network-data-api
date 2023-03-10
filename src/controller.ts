import { Request, Response } from 'express'
import { Network } from '@verida/client-ts'
import { buildVeridaUri, encodeUri } from '@verida/helpers'

export default class Controller {

    public static async getData(req: Request, res: Response) {
        const veridaUri = `verida://${req.params[0]}`
        console.log(veridaUri)
        console.log(encodeUri(veridaUri))

        try {
            const data = await Network.getRecord(veridaUri, false)
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

        return res.status(200).send(data)
    }

    public static async getUri(req: Request, res: Response) {
        const encodedVeridaUri = req.params[0]
        
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
}