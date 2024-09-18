const express = require('express');
const controller = require('../controllers/user');
const {isGuest, isLoggedIn} = require('../middlewares/auth');
const { loginLimiter } = require('../models/rateLimiter');
const { validateSignup, validateResult, validateLogin } = require('../models/validators');

const router = express.Router();


router.get('/', controller.index);

// signup route
router.get('/new',isGuest, controller.new);

//create user
router.post('/',loginLimiter,validateSignup, validateResult, isGuest,controller.create);

// login
router.get('/login', isGuest,controller.login);

// authenticate login
router.post('/login',loginLimiter, validateLogin, validateResult, isGuest,controller.authenticate);

//profile
router.get('/profile', isLoggedIn,controller.profile);

//logout
router.get('/logout', isLoggedIn ,controller.logout);


module.exports = router;