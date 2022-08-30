const mongoose = require('mongoose');

const passcateSchema = new mongoose.Schema({
    passwordcategoryname: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const passcate = mongoose.model('passwordcategory', passcateSchema);

module.exports = passcate;