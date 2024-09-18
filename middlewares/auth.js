const Connection= require('../models/events');

exports.isGuest = (req,res,next)=>{
    if(!req.session.user){
    return next();
    }
    else{
        req.flash('error','You are logged in already');
        return res.redirect('/users/profile');
    }
};

exports.isLoggedIn = (req,res,next)=>{
    if(req.session.user){
        return next();
        }
        else{
            req.flash('error','You need to log in first');
            return res.redirect('/users/login');
        }
};

exports.isAuthor = (req,res,next)=>{

    let id=req.params.id;
    Connection.findById(id)
    .then(conn=>{
        if(conn){
            if(conn.host==req.session.user){
                return next();
            }else{
                let err = new Error('Unauthorized access to the resource');
                err.status=401;
                return next(err);
            }
        }else{
            let err = new Error('Cannot find a story with id ' + id);
            err.status = 404;
            next(err);
        }

    })
    .catch(err=>next(err));
}


exports.isNotAuthor = (req,res,next)=>{

    let id=req.params.id;
    Connection.findById(id)
    .then(conn=>{
        if(conn){
            if(conn.host != req.session.user){
                return next();
            }else{
                let err = new Error('Unauthorized access to the resource');
                err.status=401;
                return next(err);
            }
        }else{
            let err = new Error('Cannot find a story with id ' + id);
            err.status = 404;
            next(err);
        }

    })
    .catch(err=>next(err));
}
