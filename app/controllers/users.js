const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/users')
const { secret } = require('../config')

class usersController {
    async find(ctx) {
        ctx.body = await User.find()
    }
    async findById(ctx) {
        const user = await User.findById(ctx.params.id)
        if (!user) {
            ctx.throw(404, 'No such user')
        }
        ctx.body = user
    }
    async create(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: { type: 'string', required: true }
        })
        //check uniqueness of name
        const { name } = ctx.request.body
        const existUser = await User.findOne({ name })
        if (existUser) { ctx.throw(409, 'the name has been registered') }

        const user = await new User(ctx.request.body).save()
        ctx.body = user
    }
    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: false },
            password: { type: 'string', required: false }
        })
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
        if (!user) {
            ctx.throw(404, 'No such user')
        }
        ctx.body = user
    }
    async deleteById(ctx) {
        const user = await User.findByIdAndRemove(ctx.params.id)
        if (!user) { ctx.throw(404, 'No such user') }
        ctx.status = 204
    }

    async login(ctx) {
        console.log(secret)
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: { type: 'string', required: true }
        })
        const user = await User.findOne(ctx.request.body)
        if (!user) { ctx.throw(401, 'username or password is incorrect') }
        const { _id, name } = user
        const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: '1d' })
        ctx.body = { token }
    }

    async checkOwner(ctx, next){
        if (ctx.params.id !== ctx.state.user._id) { ctx.throw(403, 'action forbidden')}
        await next()
    }
}

module.exports = new usersController()