const Router = require('koa-router')
const router = new Router({prefix: '/users'})
const {find, findById, create, update, deleteById} = require('../controllers/users')


router.get('/', find)

router.post('/', create)

router.get('/:id', findById)

router.put('/:id', update)

router.delete('/:id', deleteById)

module.exports = router