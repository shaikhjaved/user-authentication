
const auth = require('../includes/auth')
const register = require('../includes/register')

function initRoutes(app) {
    app.post('/login', auth().login)
    app.post('/register', register())
}

module.exports = initRoutes