const {body, validationResult} = require('express-validator');
const moment= require('moment');
exports.validateId = (req, res, next)=>{
    let id = req.params.id;
    //an objectId is a 24-bit Hex string
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid story id');
        err.status = 400;
        return next(err);
    } else {
        return next();
    }
};

exports.validateSignup = [
    body('firstName', 'First name cannot be empty').notEmpty().trim().escape(),
    body('lastName', 'Last name cannot be empty').notEmpty().trim().escape(),
    body('email', 'Email address must be valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password', 'Password must be at least 8 characters and at most 64 long').isLength({min: 8, max: 64})
]

exports.validateLogin = [
    body('email', 'Email address must be valid email address').notEmpty().isEmail().trim().escape().normalizeEmail(),
    body('password', 'Password must be at least 8 characters and at most 64 long').isLength({min: 8, max: 64})
]

exports.validateResult = (req, res, next)=>{
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        errors.array().forEach(error=>{
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    }
    return next();
}

function isAfterToday(dateString) {
    
    const inputDate = new Date(dateString);

    
    const today = new Date();

    
    return inputDate >= today;
}


exports.validateConnection = [
    body('category', 'category cannot be empty').notEmpty().trim().escape(),
    body('title', 'title cannot be empty').notEmpty().trim().escape(),
    body('location', 'location cannot be empty').notEmpty().trim().escape(),
    body('date', 'date cannot be empty | must be a valid date | must be after today').notEmpty().trim().escape()
    .custom((value)=>{
        const inputDate = new Date(value);
        //console.log(inputDate);
        if(moment(inputDate, moment.ISO_8601, true).isValid())
        return true;
    }).withMessage('Date must be in a valid format')
        
      .custom((value) => {
        return isAfterToday(value);
    }).withMessage('Date must be after today'),
    body('pic', 'pic cannot be empty').notEmpty().trim(),
    body('description', 'description cannot be empty').notEmpty().trim().escape(),
    body('start', 'start must be a valid time').matches(/^(\d{2}):(\d{2})$/),
    body('end', 'end must be a valid time')
      .matches(/^(\d{2}):(\d{2})$/)
      .custom((value, { req }) => {
        const startTime = req.body.start;
        const endTime = value;
        return startTime && endTime && startTime < endTime;
      })
      .withMessage('end time must come after start time'),  
]

exports.validateRSVP = [
    body('rsvp', 'rsvp cannot be empty. It should be either YES | NO | MAYBE').notEmpty().trim().escape().toLowerCase().isIn(['yes', 'no', 'maybe'])
]