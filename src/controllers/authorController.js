const jwt = require('jsonwebtoken');
const authorModel = require('../models/authorModel.js');
const { isValidBody, isValidEmail, isValidPass, isValidName, isValidTitleEnum } = require('../util/valitor.js');

//createAuthor
const createAuthor = async (req, res) => {
    try {
        const reqBody = req.body;
        const { fname, lname, title, email, password } = reqBody;   

        if (!isValidBody(reqBody)) return res.status(400).send({ status: false, message: 'Please enter data.' });
        if (!fname) return res.status(400).send({ status: false, message: 'fname is required.' });
        if (!lname) return res.status(400).send({ status: false, message: 'lname is required.' })
        if (!title) return res.status(400).send({ status: false, message: 'title is required.' });
        if (!email) return res.status(400).send({ status: false, message: 'email is required.' });
        if (!password) return res.status(400).send({ status: false, message: 'password is required.' });

        if (!isValidName(fname)) return res.status(400).send({ status: false, message: 'Enter valid name first.' });
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: 'Enter valid last name.' })
        if (!isValidTitleEnum(title)) return res.status(400).send({ status: false, message: 'Please enter ("Mr" "Mrs","Miss") as a title.' });
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: 'email is not valid.' });
        if (!isValidPass(password)) return res.status(400).send({ status: false, message: 'Password should be 8-15 char & use 0-9,A-Z,a-z & special char this combination.' });

        const existUser = await authorModel.findOne({ email });
        if (existUser) return res.status(401).send({ status: false, message: 'This email already registered.' });
        
        const saveData = await authorModel.create(reqBody);
        return res.status(201).send({ status: true, data: saveData })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, error: err.message })
    }
};

// login
const login = async (req, res) => {
    try {
        const reqBody = req.body;
        const { email, password } = reqBody

        if (!isValidBody(reqBody)) return res.status(400).send({ status: false, message: 'Please enter data.' });
        if (!email) return res.status(400).send({ status: false, message: 'Please fill email' });
        if (!password) return res.status(400).send({ status: false, message: 'Please fill password' });
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: 'email is not valid.' });
        if (!isValidPass(password)) return res.status(400).send({ status: false, message: 'Password should be 8-15 char & use 0-9,A-Z,a-z & special char this combination.' });

        const existUser = await authorModel.findOne({ email, password });
        if (!existUser) return res.status(401).send({ status: false, message: 'Please provide correct data or register.' });

        const token = jwt.sign({ authorId: existUser._id, }, 'group1');
        return res.status(200).send({ status: true, token: token })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, error: err.message })
    }
}

module.exports = { createAuthor, login }
