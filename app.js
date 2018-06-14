var express = require('express');
var app     = express();
var db      = require('./db');
var cors    = require("cors");

// app.use(cors());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'post');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

    app.get('/', function(req, res) {
        res.send('Home page');
    });
    var UserController = require('./user/UserController');
    app.use('/api/users', UserController);

    var AuthController = require('./auth/AuthController');
    app.use('/api/auth', AuthController);

    app.get('*', function(req, res) {
        res.redirect('/');
    });


module.exports = app;