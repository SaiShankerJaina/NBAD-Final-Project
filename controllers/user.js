const User = require('../models/user');
const connectionsModel = require('../models/events');
const rsvpModel = require('../models/rsvp');

exports.index = (req, res, next) => {
    res.redirect('/users/new');
}

exports.new = (req, res) => {
    res.render('./user/new');
}

exports.create = (req, res, next) => {
    const user = new User(req.body);
    user.save()
        .then(() => {
            res.redirect('/users/login');
        })
        .catch(err => {

            if (err.code === 11000) {
                err.status = 400;
                req.flash('error', 'email address already exists');
                res.redirect('/users/new');
            }

            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            next(err);
        })
}

exports.login = (req, res) => {
    res.render('./user/login');
}

exports.authenticate = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email })
        .then(user => {
            if (user) {
                user.comparePassword(password)
                    .then(result => {
                        if (result) {
                            req.session.user = user._id;
                            req.session.username = user.firstName;
                            req.flash('success', 'You have successfully logged in');
                            res.redirect('/users/profile');
                        }
                        else {
                            // console.log('password not correct');
                            req.flash('error', 'wrong password');
                            res.redirect('/users/login');
                        }
                    })
            }
            else {
                // console.log('email address not found');
                req.flash('error', 'wrong email address');
                res.redirect('/users/login');
            }
        })
        .catch(err => {
            next(err);
        })

}

exports.profile = (req, res) => {
    let id = req.session.user;
    Promise.all([
        User.findById(id),
        connectionsModel.find({host: id}),
        rsvpModel.find({user: id}).populate('connection','title category')
    ])
    .then(results => {
           const [user, connections, rsvps] = results;
           console.log(rsvps);
           res.render('./user/profile', {user, connections, rsvps});
        })
        .catch(err => {
            next(err);
        })

}

exports.logout = (req, res)=>{
    req.session.destroy(err=>{
        if(err){
            return next(err);
        }
        else{
            res.redirect('/');
        }
    })
}