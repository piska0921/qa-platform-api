const Router = require('koa-router')
const jsonwebtoken = require('jsonwebtoken')
const jwt = require('koa-jwt')
const router = new Router({ prefix: '/users' })
const {
    find, findById, create, update, deleteById, login, checkOwner,
    listFollowing, follow, unfollow, listFollowers, checkUserExistence,
    listFollowingTopics, followTopic, unfollowTopic, listQuestions,
    listUpvotedAnswers, upvoteAnswer, cancelUpvoteAnswer,
    listDownvotedAnswers, downvoteAnswer, cancelDownvoteAnswer
} = require('../controllers/users')
const { checkTopicExistence } = require('../controllers/topics')
const { checkAnswerExistence } = require('../controllers/answers')
const { secret } = require('../config')

const auth = jwt({ secret })

router.get('/', find)
router.post('/', create)
router.get('/:id', findById)
router.patch('/:id', auth, checkOwner, update)
router.delete('/:id', auth, checkOwner, deleteById)
router.post('/login', login)
router.get('/:id/following', listFollowing)
router.get('/:id/followers', listFollowers)
router.put('/following/:id', auth, checkUserExistence, follow)
router.delete('/following/:id', auth, checkUserExistence, unfollow)
router.get('/:id/followingTopics', listFollowingTopics)
router.put('/followingTopics/:id', auth, checkTopicExistence, followTopic)
router.delete('/followingTopics/:id', auth, checkTopicExistence, unfollowTopic)
router.get('/:id/questions', listQuestions)
router.get('/:id/upvotedAnswers', listUpvotedAnswers),
//upvote is exclusive to downvote!
router.put('/upvotedAnswers/:id', auth, checkAnswerExistence, upvoteAnswer, cancelDownvoteAnswer),
router.delete('/upvotedAnswers/:id', auth, checkAnswerExistence, cancelUpvoteAnswer),
router.get('/:id/downvotedAnswers', listDownvotedAnswers),
router.put('/upvotedAnswers/:id', auth, checkAnswerExistence, downvoteAnswer, cancelUpvoteAnswer)
router.delete('/downvotedAnswers/:id', auth, checkAnswerExistence, cancelDownvoteAnswer),


module.exports = router