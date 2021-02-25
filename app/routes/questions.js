const Router = require('koa-router')
const jwt = require('koa-jwt')
const router = new Router({ prefix: '/questions' })
const { find, findById, create, update, deleteById, checkQuestionExistence, checkQuestioner } = require('../controllers/questions')
const { secret } = require('../config')

const auth = jwt({ secret })

router.get('/', find)
router.post('/', auth, create)
router.get('/:id', checkQuestionExistence, findById)
router.patch('/:id', auth, checkQuestionExistence, checkQuestioner, update)
router.delete('/:id', auth, checkQuestionExistence, checkQuestioner, deleteById)

module.exports = router