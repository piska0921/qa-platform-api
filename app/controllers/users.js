const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/users')
const Question = require('../models/questions')
const Answer = require('../models/answers')
const { secret } = require('../config')

class usersController {
    async find(ctx) {
        const page = ctx.query.page ? Math.max(ctx.query.page * 1, 1) : 3
        const perPage = Math.max(ctx.query.per_page * 1, 1)
        const skippedPage = (page - 1) * perPage
        ctx.body = await User
            .find({ name: new RegExp(ctx.query.keyword) })
            .limit(perPage).skip(skippedPage)
    }
    async findById(ctx) {
        //choose fields of data
        const { fields = '' } = ctx.query
        //filter(f => f) : filter empty fields
        const selectedFields = fields.split(';').filter(field => field).map(field => ' +' + field).join('')
        const user = await User.findById(ctx.params.id).select(selectedFields)
            .populate('following locations industry employment.company employment.title education.school education.major')

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
            password: { type: 'string', required: false },
            avatar_id: { type: 'string', required: false },
            gender: { type: 'string', required: false },
            intro: { type: 'string', required: false },
            locations: { type: 'array', itemType: 'string', required: false },
            industry: { type: 'string', required: false },
            employment: { type: 'array', itemType: 'object', required: false },
            education: { type: 'array', itemType: 'string', required: false }
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

    async checkOwner(ctx, next) {
        if (ctx.params.id !== ctx.state.user._id) { ctx.throw(403, 'action forbidden') }
        await next()
    }

    async listFollowing(ctx) {
        const user = await User.findById(ctx.params.id).select('+following').populate('following')
        if (!user) {
            ctx.throw(404)
        }
        ctx.body = user.following
    }

    async listFollowers(ctx) {
        const followers = await User.find({ following: ctx.params.id })
        ctx.body = followers
    }

    async checkUserExistence(ctx, next) {
        const user = await User.findById(ctx.params.id)
        if (!user) { ctx.throw(404, 'User not found') }
        await next()
    }

    async follow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following')
        if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
            me.following.push(ctx.params.id)
            me.save()
        }

        ctx.status = 204
    }

    async unfollow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following')
        const index = me.following.map(id => id.toString()).indexOf(ctx.params.id)
        if (index > -1) {
            me.following.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }

    async listFollowingTopics(ctx) {
        const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics')
        if (!user) {
            ctx.throw(404, 'User not found')
        }
        ctx.body = user.followingTopics
    }

    async followTopic(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics')
        if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
            me.followingTopics.push(ctx.params.id)
            me.save()
        }

        ctx.status = 204
    }

    async unfollowTopic(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics')
        const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id)
        if (index > -1) {
            me.followingTopics.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }

    async listQuestions(ctx) {
        const questions = await Question.find({ questioner: ctx.params.id })
        ctx.body = questions
    }

    async listUpvotedAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+upvotedAnswers').populate('upvotedAnswers')
        if (!user) {
            ctx.throw(404, 'User not found')
        }
        ctx.body = user.upvotedAnswers
    }

    async upvoteAnswer(ctx, next) {
        const answerId = ctx.params.id
        const me = await User.findById(ctx.state.user._id).select('+upvotedAnswers')
        if (!me.upvotedAnswers.map(id => id.toString()).includes(answerId)) {
            me.upvotedAnswers.push(answerId)
            me.save()
            await Answer.findByIdAndUpdate(answerId, { $inc: { voteCount: 1 } })
        }
        ctx.status = 204
        await next()
    }

    async cancelUpvoteAnswer(ctx) {
        const answerId = ctx.params.id
        const me = await User.findById(ctx.state.user._id).select('+upvotedAnswers')
        const answerIdx = me.upvotedAnswers.map(id => id.toString()).indexOf(answerId)
        if (answerIdx > -1) {
            me.upvotedAnswers.splice(answerIdx, 1)
            me.save()
            await Answer.findByIdAndUpdate(answerId, { $inc: { voteCount: -1 } })
        }
        ctx.status = 204
    }

    async listDownvotedAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+downvotedAnswers').populate('downvotedAnswers')
        if (!user) {
            ctx.throw(404, 'User not found')
        }
        ctx.body = user.downvotedAnswers
    }

    async downvoteAnswer(ctx,next) {
        const answerId = ctx.params.id
        const me = await User.findById(ctx.state.user._id).select('+downvotedAnswers')
        if (!me.downvotedAnswers.map(id => id.toString()).includes(answerId)) {
            me.downvotedAnswers.push(answerId)
            me.save()
        }
        ctx.status = 204
        await next()
    }
    
    async cancelDownvoteAnswer(ctx) {
        const answerId = ctx.params.id
        const me = await User.findById(ctx.state.user._id).select('+downvotedAnswers')
        const answerIdx = me.downvotedAnswers.map(id => id.toString()).indexOf(answerId)
        if (answerIdx > -1) {
            me.downvotedAnswers.splice(answerIdx, 1)
            me.save()
        }
        ctx.status = 204
    }
}


module.exports = new usersController()
