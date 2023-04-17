import express from 'express'
import Controller from './controller'

const router = express.Router()

// /<did>/<contextName>/<databaseName>/<recordId>/<attribute>/<...deepAttributes>
router.get(/(did\:.*)$/, Controller.getData)

// /<base58EncodedVeridaUri>
// @see @verida/helpers Utils.encodeUri()
router.get(/^\/(.*)?$/, Controller.getUri)

export default router