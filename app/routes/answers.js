const jwt = require('koa-jwt')
const Router = require('koa-router')
//question和answer形成嵌套关系
const router = new Router({prefix: '/questions/:questionId/answers'})
const { find, findById, create, update, deleteById, checkAnswerExistence, checkAnswerer } = require('../controllers/answers')
const { secret } = require('../config')

const auth = jwt({ secret })

router.get('/', find)
router.post('/', auth, create)
router.get('/:id', checkAnswerExistence, findById)
router.patch('/:id', auth, checkAnswerExistence, checkAnswerer, update)
router.delete('/:id', auth, checkAnswerExistence, checkAnswerer, deleteById)

module.exports = router