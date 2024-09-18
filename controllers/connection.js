const model = require("../models/events");
const rsvpModel = require("../models/rsvp");

exports.newConnection = (req, res) => {
  res.render("./show/newConnection");
};

exports.connection = (req, res, next) => {
  model
    .find()
    .then((connections) => {
      let categories = new Set();
      for (let i = 0; i < connections.length; i++) {
        categories.add(connections[i].category);
      }

      //sort categories
      categories = Array.from(categories).sort();

      return res.render("./show/connections", { connections, categories });
    })
    .catch((err) => {
      console.log(err);
      return next(err);
    });
};
exports.show = (req, res, next) => {
  const id = req.params.id;
  
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    let err = new Error("Invalid connection ID");
    err.status = 400;
    return next(err);
  }

  Promise.all([
    model.findById(id).populate('host', 'firstName lastName'),
    rsvpModel.find({ connection: id, rsvp:'yes' }),
  ])
    .then((results) => {
      const [connection, rsvps] = results;
      if (connection) {
        let isAuthor = req.session.user == connection.host._id;
        return res.render("./show/connection", { connection, isAuthor, rsvps });
      } else {
        let err = new Error("Cannot find connection with id " + id);
        err.status = 404;
        return next(err);
      }
    })
    .catch((err) => {
      console.log(err);
      return next(err);
    });
};
exports.edit = (req, res, next) => {
  let id = req.params.id;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    let err = new Error("Invalid connection ID");
    err.status = 400;
    return next(err);
  }

  model
    .findById(id)
    .then((connection) => {
      if (connection) {
        return res.render("./show/edit", { connection });
      } else {
        let err = new Error("Cannot find connection with id " + id);
        err.status = 404;
        return next(err);
      }
    })
    .catch((err) => {
      console.log(err);
      return next(err);
    });
};
exports.update = (req, res, next) => {
  let connection = req.body;
  let id = req.params.id;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    let err = new Error("Invalid connection ID");
    err.status = 400;
    return next(err);
  }

  model
    .findByIdAndUpdate(id, connection, {
      runValidators: true,
      useFindAndModify: false,
    })
    .then((connection) => {
      if (connection) {
        return res.redirect("/connections/" + id);
      } else {
        let err = new Error("Cannot find connection with id " + id);
        err.status = 404;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      console.log(err);
      return next(err);
    });
};
exports.create = (req, res, next) => {

  let newConnection = new model(req.body);
  newConnection.host = req.session.user;
  newConnection.save()
    .then((connection) => {
      console.log(connection);
      return res.redirect("/connections/connections");
    })
    .catch((err) => {
      console.log(err);
      if (err.name === "ValidationError") {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      return next(err);
    });
};
exports.remove = (req, res, next) => {
  let id = req.params.id;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    let err = new Error("Invalid connection ID");
    err.status = 400;
    return next(err);
  }

  Promise.all([
    model.findByIdAndDelete(id),
    rsvpModel.deleteMany({connection: id})
  ])
    .then((connection) => {
      if (connection) {
        return res.redirect("/connections/connections");
      } else {
        let err = new Error("Cannot find connection with id " + id);
        err.status = 404;
        return next(err);
      }
    })
    .catch((err) => {
      console.log(err);
      return next(err);
    });
};

exports.updateRsvp = (req, res, next) => {
  let id = req.params.id;
  rsvpModel.findOne({ connection: id, user: req.session.user })
    .then(rsvp => {
      if (rsvp) {
        //update
        rsvpModel.findByIdAndUpdate(rsvp._id, { rsvp: req.body.rsvp }, {
          runValidators: true,
          useFindAndModify: false,
        })
          .then(rsvp => {
            req.flash('success', 'RSVP updated successfully');
            return res.redirect('/users/profile');
          })
          .catch(err => {
            console.log(err);
            if (err.name === "ValidationError") {
              req.flash('error', err.message);
              return res.redirect('back');
            }
            return next(err);
          })
      } else {
        let newRsvp = new rsvpModel({
          connection: id,
          rsvp: req.body.rsvp,
          user: req.session.user
        });
        newRsvp.save()
          .then(rsvp => {
            req.flash('success', 'RSVP created successfully');
            return res.redirect('/users/profile');
          })
          .catch(err => {
            console.log(err);
            if (err.name === "ValidationError") {
              req.flash('error', err.message);
              return res.redirect('back');
            }
            return next(err);
          })
      }
    })

}