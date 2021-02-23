const Topic = require('../models/topics')
const User = require('../models/users')

class TopicController {
    async find(ctx) {
        //avoid negative number 
        const page = ctx.query.page ? Math.max(ctx.query.page * 1, 1) : 3
        const perPage = Math.max(ctx.query.per_page * 1, 1)
        const skippedPage = (page - 1) * perPage
        ctx.body = await Topic
        .find({name : new RegExp(ctx.query.keyword)})
        .limit(perPage).skip(skippedPage)
    }

    async findById(ctx) {
        const { fields = '' } = ctx.query
        const selectedFields = fields.split(';').filter(field => field).map(field => ' +' + field).join('')
        const topic = await Topic.findById(ctx.params.id).select(selectedFields)
        ctx.body = topic
    }

    async create(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            avatar_id: { type: 'string', required: false },
            intro: { type: 'string', required: false },
        })
        const topic = await new Topic(ctx.request.body).save()
        ctx.body = topic
    }
    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: false },
            avatar_id: { type: 'string', required: false },
            intro: { type: 'string', required: false },
        })
        const topic = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body)
        ctx.body = topic
    }

    async checkTopicExistence(ctx, next){
        const topic = await Topic.findById(ctx.params.id)
        if (!topic) {ctx.throw(404, 'Topic not found')}
        await next()
    }

    async listTopicFollowers(ctx) {
        const followers = await User.find({followingTopics: ctx.params.id})
        ctx.body = followers
    }
}

module.exports = new TopicController()