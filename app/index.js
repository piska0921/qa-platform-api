const Koa = require('koa')
const app = new Koa()
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const routing = require('./routes/index')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
const { connectionAddress } = require('./config')
const path = require('path')

mongoose.connect(connectionAddress, { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log('connected'))

app.use(koaStatic(path.join(__dirname, 'public')))

app.use(error({
    postFormat: (error, { stack, ...rest }) =>
        process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}))

app.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, '/public/uploads')
    }
}))
 
app.use(parameter(app))
routing(app)
app.listen(3000, () => {
    console.log('server is running on port 3000')
})

