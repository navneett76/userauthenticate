// AuthController.js

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Now you’re ready to add the modules for using JSON Web Tokens and encrypting passwords. 
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');

var User = require('../user/User');

/* User token authentication if user is already logged in the server before login. */
var userauthenticate = function (req, res, next) {
  // console.log('LOGGED')
  var token = req.body.headers['x-access-token'];
  if (token) {
      jwt.verify(token, config.secret, function(err, decoded) {
      if (!err){
        // console.log(decoded);
        res.status(200).send(decoded);
      }else{
        next()    
      }
    });
  }else{
    next()
  }  
}

/* User login function with with the username and their password. */
router.post('/login', userauthenticate, function(req, res) {
  
  var userName  = req.body.userData[0].name; 
  var userEmail = req.body.userData[0].email; 
  var passwordchk = req.body.userData[0].password; 

  User.findOne({ name: userName }, function(err, user) {
    if (err) throw err;

    // console.log(user); return false;
    // test a matching password
    if(user){
      user.comparePassword(passwordchk, function(err, isMatch) {
          // console.log("sdfsdfsd"); 
          if (err) {
            res.status(200).send({ auth: false, error: err });  
            throw err; 
          }
          if(isMatch){
            var token = jwt.sign({ id: user._id }, config.secret, {
              expiresIn: 86400 // expires in 24 hours
            });

            res.status(200).send({ auth: true, token: token });  
          }else{
            res.status(200).send({ auth: false, error: "Wrong Password!!" });        
          }
          
      });  
    }else{
      res.status(200).send({ auth: false, error: "No user found!!" });  
    }
    
    
  });




});


/* Registering on the website using the controlled data */
router.post('/register', function(req, res) {
  var hashedPassword = bcrypt.hashSync(req.body.userData[0].password, 8);

  var userName  = req.body.userData[0].name; 
  var userEmail = req.body.userData[0].email; 
  User.create({
    name : userName,
    email : userEmail,
    password : hashedPassword
  },
  function (err, user) {
    if (err) return res.status(500).send("There was a problem registering the user.")

    // create a token
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    res.status(200).send({ auth: true, token: token });
  }); 
});

module.exports = router;