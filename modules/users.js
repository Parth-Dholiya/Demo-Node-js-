const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://dholiya:parthr@cluster0.hqlahdl.mongodb.net/pmsdata');
console.log("DB Connected.......!");

const userSchema = new mongoose.Schema({
    uname:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now
    }
});

const user = mongoose.model('user',userSchema);

module.exports = user;