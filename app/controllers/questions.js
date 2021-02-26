const Question = require('../models/questions')

class QuestionController {

    async find(ctx) {
        const page = ctx.query.page ? Math.max(ctx.query.page * 1, 1) : 10
        const perPage = Math.max(ctx.query.per_page * 1, 1)
        const skippedPage = (page - 1) * perPage
        const keyword = new RegExp(ctx.query.q)
        const questions = await Question.find({ $or: [{ title: keyword }, { description: keyword }] }).limit(perPage).skip(skippedPage)
        ctx.body = questions
    }

    async findById(ctx) {
        const { fields = '' } = ctx.query
        const selectedFields = fields.split(';').filter(field => field).map(field => ' +' + field).join('')
        const question = await Question.findById(ctx.params.id).select(selectedFields).populate('questioner topics')
        ctx.body = question
    }

    async checkQuestionExistence(ctx, next) {
        const question = await Question.findById(ctx.params.id)
        if (!question) { ctx.throw(404, 'Question not found')}
        ctx.state.question = question
        await next()
    }
    async create(ctx) {
        ctx.verifyParams({
            title: {type: 'string', required: true},
            description: {type: 'string', required: false},
            topics: {type:'array', itemType: 'string', required: false}
        })
        const question = await new Question({...ctx.request.body, questioner: ctx.state.user._id}).save()
        ctx.body = question
    }

    async checkQuestioner(ctx, next){
        if (ctx.state.question.questioner.toString() !== ctx.state.user._id) {ctx.throw(403, 'No authorization')}
        await next()
    }
    async update(ctx){
        ctx.verifyParams({
            title: {type: 'string', required: false},
            description: {type: 'string', required: false},
            topics: {type:'array', itemType: 'string', required: false}
        })
        await ctx.state.question.update(ctx.request.body)
        ctx.body = ctx.state.question
    }

    async deleteById(ctx){
        await ctx.state.question.delete()
        ctx.status = 204
    }

}

module.exports = new QuestionController()