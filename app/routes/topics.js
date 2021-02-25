const Router = require('koa-router')
const jwt = require('koa-jwt')
const router = new Router({ prefix: '/topics' })
const { find, findById, create, update, listTopicFollowers, checkTopicExistence, listQuestionsUnderTopic } = require('../controllers/topics')
const { secret } = require('../config')

const auth = jwt({ secret })

router.get('/', find)
router.post('/', auth, create)
router.get('/:id', checkTopicExistence,findById)
router.patch('/:id', auth, checkTopicExistence, update)
router.get('/:id/followers', checkTopicExistence, listTopicFollowers)
router.get('/:id/questions', checkTopicExistence, listQuestionsUnderTopic)

module.exports = router

