const Answer = require('../models/answers')

class AnswerController {
    async find(ctx) {
        //avoid negative number 
        const page = ctx.query.page ? Math.max(ctx.query.page * 1, 1) : 10
        const perPage = Math.max(ctx.query.per_page * 1, 1)
        const skippedPage = (page - 1) * perPage
        ctx.body = await Answer
            .find({ content: new RegExp(ctx.query.keyword), questionId: ctx.params.questionId })
            .limit(perPage).skip(skippedPage)
    }

    async findById(ctx) {
        const { fields = '' } = ctx.query
        const selectedFields = fields.split(';').filter(field => field).map(field => ' +' + field).join('')
        const answer = await Answer.findById(ctx.params.id).select(selectedFields).populate('answerer')
        ctx.body = answer
    }

    async create(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true }
        })
        const answer = await new Answer({
            ...ctx.request.body, 
            answerer: ctx.state.user._id, 
            questionId: ctx.params.questionId}).save()
        ctx.body = answer
    }

    async update(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: false }
        })
        await ctx.state.answer.update(ctx.request.body)
        ctx.body = ctx.state.answer
    }

    async deleteById(ctx){
        await ctx.state.answer.delete()
        ctx.status = 204
    }

    async checkAnswerExistence(ctx, next){
        const answer = await Answer.findById(ctx.params.id)
        if (!answer) {ctx.throw(404, 'Answer not found')}
        //check whether the question id is correct
        if(answer.questionId !== ctx.params.questionId){
            ctx.throw(404, 'The answer not found for this question')
        }
        ctx.state.answer = answer
        await next()
    }

    async checkAnswerer(ctx, next){
        if (ctx.state.answer.answerer.toString() !== ctx.state.user._id){
            ctx.throw(403, 'No authorization to edit this answer')
        } 
        await next()
    }
}

module.exports = new AnswerController()