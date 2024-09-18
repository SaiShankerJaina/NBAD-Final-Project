
const express=require('express');

const connectionController=require('../controllers/connection');
const { isLoggedIn, isAuthor, isNotAuthor } = require('../middlewares/auth');
const { validateConnection, validateResult, validateRSVP } = require('../models/validators');
const router= express.Router();

// new connection
router.get('/newConnection', isLoggedIn, connectionController.newConnection);

// connections
router.get('/connections',connectionController.connection);

// show connection
router.get('/:id', connectionController.show);

// edit connection
router.get('/:id/edit',isLoggedIn, isAuthor,connectionController.edit);

// update connection
router.put('/:id', isLoggedIn, isAuthor, validateConnection, validateResult,connectionController.update);

// create new connection
router.post('/', isLoggedIn , validateConnection, validateResult,connectionController.create);

// delete connection
router.delete('/:id',isLoggedIn, isAuthor,connectionController.remove);

// update rsvp
router.post('/:id/rsvp', isLoggedIn, isNotAuthor, validateRSVP, validateResult,connectionController.updateRsvp);

module.exports=router;