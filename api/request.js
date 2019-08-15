const express = require('express')
const router = express.Router()

const Request = require('../models/request')

const httpUtils = require('../utils/httpUtils')

let requestNotFound = 'Request not found'

router.get('/', async (req, res) => {})

router.get('/:id', async (req, res) => {
    try {
        const request = await Request.findOne({ where: { requesterId: req.params.id } })
        if (!requester) {
            return httpUtils.notFound(res, requestNotFound)
        }
        return httpUtils.fetchDataSuccess(res, requester)
    } catch (error) {
        return httpUtils.internalError(res)
    }
})

router.post('/', async (req, res) => {
    try {
        
    } catch (error) {
        return httpUtils.internalError(res)
    }
})

router.delete('/id', async (req, res) => {
    try {
        const request = await Request.findOne({ where: { requesterId: req.params.id } })
        if (!requester) {
            return httpUtils.notFound(res, requestNotFound)
        }
        await request.destroy()
        return httpUtils.fetchDataSuccess(res, {msg: 'Request successfully deleted'})
    } catch (error) {
        return httpUtils.internalError(res)
    }
})

router.delete('/drop-table', async (req, res) => {
    try {
        await Request.drop()
        return httpUtils.fetchDataSuccess(res, {msg: 'Request table successfully deleted'})
    } catch (error) {
        return httpUtils.internalError(res)
    }
})

module.exports = router