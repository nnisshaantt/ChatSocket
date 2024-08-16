const mongoose = require("mongoose")
const { Schema } = mongoose;

//User schema
const userSchema = new Schema({
    name: String,
    email: String,
    password: String,
    phone: String
});


module.exports = mongoose.model("User", userSchema)