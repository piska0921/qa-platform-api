const Router = require('koa-router')
const jwt = require('koa-jwt')
const router = new Router({ prefix: '/topics' })
const { find, findById, create, update, listTopicFollowers, checkTopicExistence } = require('../controllers/topics')
const { secret } = require('../config')

const auth = jwt({ secret })

router.get('/', find)
router.post('/', auth, listTopicFollowers, create)
router.get('/:id', findById)
router.patch('/:id', auth, listTopicFollowers, update)
router.get('/:id/followers', checkTopicExistence, listTopicFollowers)

module.exports = router