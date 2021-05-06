const connection = require('../config/databaseconnect')
const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require('uuid')
const crypto = require('crypto'), format = require('biguint-format')

function register() {

    return (req, res) => {

        const headers = req.headers
        const body = req.body
        const buffer = Buffer.from(body.form_data, 'base64').toString().split("Form Data ")[1].split(":")

        const object =
        {
            "first_name": buffer[0],
            'middle_name': buffer[1],
            'last_name': buffer[2],
            'email': buffer[3],
            'date_of_birth': buffer[4],
            'gender': buffer[5],
            'phone': buffer[6],
            'password': buffer[7],
            'browser': buffer[8],
            'ip_address': buffer[9],
            'lat': buffer[10],
            'lon': buffer[11]
        }

        connection.query('SELECT user_id,business_id,is_active,user_type FROM users where email=? and phone=?;', [object.email, object.phone], function (err, result) {

            if (err) throw err

            const resultObj = result[0]

            if (!resultObj) {

                const saltRounds = 10;
                bcrypt.genSalt(saltRounds, function (err, salt) {
                    bcrypt.hash(object.password, salt, function (err, hash) {
                        object.user_id = uuidv4()
                        object.business_id = format(crypto.randomBytes(5), 'dec').slice(0, 6)
                        object.user_type = 0
                        object.is_active = 0
                        connection.query('INSERT INTO users (user_id, business_id, first_name, last_name, email, date_of_birth, phone, password, is_active, user_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [object.user_id, object.business_id, object.first_name, object.last_name, object.email, object.date_of_birth, object.phone, hash, object.is_active, object.user_type], function (r_err, r_result) {
                            if (r_err) {
                                const response = {
                                    'status': 200,
                                    'message': 'error',
                                    'result': r_err
                                }
                                res.json(response)
                            } else {
                                const response = {
                                    'status': 200,
                                    'message': 'success',
                                    'result': resultObj
                                }
                                res.json(response)
                            }
                        })

                    });
                });

            } else {
                const response = {
                    'status': 100,
                    'message': 'already registered',
                    'result': []
                }
                res.json(response)
            }

        })

    }

}

module.exports = register