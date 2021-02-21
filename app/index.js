const Koa = require('koa')
const app = new Koa()
const bodyparser = require('koa-bodyparser')
const routing = require('./routes/index')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
const { connectionAddress } = require('./config')

mongoose.connect(connectionAddress, { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log('connected'))

app.use(error({
    postFormat: (error, { stack, ...rest }) =>
        process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}))

app.use(bodyparser())
app.use(parameter(app))
routing(app)
app.listen(3000, () => {
    console.log('server is running on port 3000')
})

