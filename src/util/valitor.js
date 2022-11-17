const mongoose = require('mongoose');

//isValidBody
const isValidBody = (data) => {
    if (Object.keys(data).length > 0)
        return true
    return false
};

//email
const isValidEmail = (email) => {
    const regex = /^([a-zA-Z0-9_.]+@[a-z]+\.[a-z]{2,3})?$/.test(email)
    return regex
};
   
//password
const isValidPass = (password) => {
    const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(password)
    return regex
};

//mongoDbId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

//name
const isValidName = (name) => {
    const nm = name.trim()
    const regex = /^[A-Za-z]{2,}$/.test(nm)
    return regex
}

//title
const isValidTitleEnum = (title) => ["Mr", "Mrs", "Miss"].indexOf(title) !== -1;

//text
const isValidText = (text) => {
    const regex = /^[A-Za-z0-9_ ]{2,}$/.test(text)
    return regex
};

module.exports = { isValidBody, isValidEmail, isValidObjectId, isValidPass, isValidName, isValidText, isValidTitleEnum }

