const Comment = require('../models/comments')

class CommentController {
    async find(ctx) {
        //avoid negative number 
        const page = ctx.query.page ? Math.max(ctx.query.page * 1, 1) : 10
        const perPage = Math.max(ctx.query.per_page * 1, 1)
        const skippedPage = (page - 1) * perPage
        ctx.body = await Comment
            .find({ 
                content: new RegExp(ctx.query.keyword), 
                questionId: ctx.params.questionId, 
                answerId: ctx.params.answerId})
            .limit(perPage).skip(skippedPage)
            .populate('commentator')
    }

    async findById(ctx) {
        const { fields = '' } = ctx.query
        const selectedFields = fields.split(';').filter(field => field).map(field => ' +' + field).join('')
        const comment = await Comment.findById(ctx.params.id).select(selectedFields).populate('commentator')
        ctx.body = comment
    }

    async create(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true }
        })
        const comment = await new Comment({
            ...ctx.request.body, 
            commentator: ctx.state.user._id, 
            questionId: ctx.params.questionId,
            answerId: ctx.params.answerId
        }).save()
        ctx.body = comment
    }

    async update(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: false }
        })
        await ctx.state.comment.update(ctx.request.body)
        ctx.body = ctx.state.comment
    }

    async deleteById(ctx){
        await ctx.state.comment.delete()
        ctx.status = 204
    }

    async checkCommentExistence(ctx, next){
        const comment = await Comment.findById(ctx.params.id)
        if (!comment) {ctx.throw(404, 'Comment not found')}
        //check whether the question id is correct (not needed for upvote and downvote)
        if(ctx.params.questionId && comment.questionId !== ctx.params.questionId){
            ctx.throw(404, 'Comment you look for is not found for this question')
        }
        if(ctx.params.answerId && comment.answerId !== ctx.params.answerId){
            ctx.throw(404, 'Comment you look for is not found for this answer')
        }
        ctx.state.comment = comment
        await next()
    }

    async checkCommentator(ctx, next){
        if (ctx.state.comment.commentator.toString() !== ctx.state.user._id){
            ctx.throw(403, 'No authorization to edit this comment')
        } 
        await next()
    }
}

module.exports = new CommentController()