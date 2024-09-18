const mongoose = require('mongoose');
const schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new schema({
    firstName: {
        type: String,
        required: [true, 'cannot be empty']
    },
    lastName: {
        type: String,
        required: [true, 'cannot be empty']
    },
    email: {
        type: String,
        required: [true, 'cannot be empty'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'cannot be empty']
    }
})

userSchema.pre('save', function(next){
    const user = this;
    if(!user.isModified('password')) return next();
    bcrypt.hash(user.password, 10)
    .then(hash=>{
        user.password = hash
        next()
    })
    .catch(err=>{
        next(err)
    })
})

// compare password method
userSchema.methods.comparePassword = function(loginPassword) {
    return bcrypt.compare(loginPassword, this.password)
}

module.exports = mongoose.model('User', userSchema)