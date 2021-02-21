class HomeController {
    index(ctx) {
        ctx.body = 'homepage'
    }
}

module.exports = new HomeController()