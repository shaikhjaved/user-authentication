const connection = require('../config/databaseconnect')
const bcrypt = require("bcrypt");
const crypto = require('crypto');

function auth() {

    return {

        login(req, res) {

            const headers = req.headers
            const buffer = Buffer.from(headers.authorization, 'base64').toString().split("Basic ")[1].split(":")

            const object = { 'business_id': buffer[0], 'password': buffer[1] }

            // var token = crypto.randomBytes(64).toString('hex')
            // var expires_in = new Date(new Date().getTime() + 30 * 60000)
            // const response = {
            //     'status': 703,
            //     'message': 'user is suspended please contact to admin',
            //     'result': expires_in
            // }
            // res.json(response)

            // return false

            connection.query('SELECT user_id,business_id,password,is_active,user_type FROM users where business_id=?;', [object.business_id], function (err, result) {
                
                if (err) throw err;

                const resultObj = result[0]

                if (resultObj.is_active != 1) {
                    const response = {
                        'status': 703,
                        'message': 'user is suspended please contact to admin',
                        'result': []
                    }
                    res.json(response)
                }

                if (resultObj) {

                    const user_valid = bcrypt.compareSync(object.password, resultObj.password)

                    if (user_valid) {

                        const token = crypto.randomBytes(64).toString('hex')
                        const expires_in = new Date(new Date().getTime() + 30 * 60000)

                        connection.query('INSERT INTO tokens (user_id, token, expires_in) VALUES (?, ?, ?);', [resultObj.user_id, token, expires_in], function (token_err, token_result) {
                            if (token_err) throw token_err
                        })

                        resultObj.password = null
                        resultObj.token = token
                        resultObj.expires_in = expires_in

                        const response = {
                            'status': 200,
                            'message': 'success',
                            'result': resultObj
                        }
                        res.json(response)

                    } else {

                        const response = {
                            'status': 401,
                            'message': 'in-valid credentials',
                            'result': []
                        }
                        res.json(response)
                    }

                } else {
                    const response = {
                        'status': 705,
                        'message': 'in-valid credentials',
                        'result': []
                    }
                    res.json(response)
                }

            })

        }

    }

}

module.exports = auth