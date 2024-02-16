const express = require('express');
const joi = require('joi');
const moment = require('moment');
const {connection } = require('./db');
const { logRequest, validateQueryParams } = require('./middleware');
const bcrypt = require('bcrypt')
const app = express();

app.use(express.json());


const schema = joi.object({
    username: joi.string(),
    password: joi.string(),
    email: joi.string()
})

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            res.status(400).json({ message: 'username, Email and Password are all required' })
        }

        const { error, value } = schema.validate(req.body);

        // console.log(error)

        if (error) {
            // Validation failed
            console.error('Validation error:', error.details[0].message);
            res.send({
                message: "invalid data"
            })
        }
        // Validation passed
        console.log('Validation successful:', value);

        const hashedPassword = await bcrypt.hash(password, 10)

        const query = `insert into users (username,email,password) values ( ?, ?, ?)`;
        const [result] = await connection
            .promise()
            .execute(query, [username, email, hashedPassword]);

        const currentDate = moment().format('YYYY-MM-DD');

        if (!result.affectedRows) {
            res.send({
                message: "data not inserted"
            })
        }

        res.status(201).json({ message: 'User registered successfully',date:currentDate, result: result })
    } catch (e) {
        console.log(e);
        res.status(500).send({ message: e.message });
    }
}

const login = async (req, res) => {
    try {
        // let { id } = req.params
        let { username,email, password } = req.body;

        // Validate the fields
        if (!username || !email && !password ) {
            res.status(400).json({ message: 'Bad Request' })
        } else if (!email || !username) {
            res.status(400).send({ message: "Email or Username is required" })
        } else if (!password) {
            res.status(400).send({ message: "Password is required" })
        }

        let whereArr = [];
        let whereData = [];

        if(username){
            whereArr.push('username=?');
            whereData.push(username);
        }

        if(email){
            whereArr.push('email =?');
            whereData.push(email);
        }

        if (whereArr.length < 2) {
           res.send({
            message : "email or username required"
           })
        }

        let whereString = `where ${whereArr}`;

        const query = `select email,password from users ${whereString}`;

        const [value] = await connection
            .promise()
            .execute(query, [...whereData])
        console.log(value)

        if (value.length === 0) {
            throw new Error('User not found')
        }

        const storedHashedPassword = value[0].password;

        const match = await bcrypt.compare(password, storedHashedPassword);
        console.log(password.length, storedHashedPassword.length)

        if (match) {
            const token = jwt.sign({ user_id: value[0].user_id }, secretKey, { expiresIn: '1h' });

            const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

            // Log the decoded token to the console
            console.log("Decoded Token:", decodedToken);

            const currentDate = moment().format('YYYY-MM-DD');

            res.status(200).json({
                message: "Successful login",
                user_id: value[0].user_id,
                date: currentDate,
                token: token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }

        // res.status(200).send({ message: "Successful login", result: value })
    } catch (e) {
        console.log(e);
        res.status(500).send({ message: e.message });
    }
}

app.post('/login', logRequest, login)
app.post('/register', logRequest, register);

app.listen(3001, () => { console.log('Server is running') })