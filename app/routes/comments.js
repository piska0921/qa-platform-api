const jwt = require('koa-jwt')
const Router = require('koa-router')
//question和answer形成嵌套关系
const router = new Router({prefix: '/questions/:questionId/answers/:answerId/comments'})
const { find, findById, create, update, deleteById, checkCommentExistence, checkCommentator } = require('../controllers/comments')
const { secret } = require('../config')

const auth = jwt({ secret })

router.get('/', find)
router.post('/', auth, create)
router.get('/:id', checkCommentExistence, findById)
router.patch('/:id', auth, checkCommentExistence, checkCommentator, update)
router.delete('/:id', auth, checkCommentExistence, checkCommentator, deleteById)

module.exports = router