import express from 'express'
import Controller from './controller'

const router = express.Router()


router.get(/(did\:[^\/]*)\/([^\/]*)\/([^\/]*)\/(.*)/, Controller.getData)


// router.get('/record/:id', Controller.getRow)
// router.get('/value/:id', Controller.getValue)
// router.get('/db/:databaseName', Controller.getDb)

export default router