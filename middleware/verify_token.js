/*
apiRoutes.use(function (req,res,next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});
app.use('/api', apiRoutes);*/
var express =      require('express');
var app = express();
var config = require('../config');
app.set("superSecret",config.secret);
var jwt = require('jsonwebtoken');
module.exports = function(req,res,next) {
    var token_t =  req.body.token || req.query.token || req.headers['x-access-token'];
    var token =  req.headers['x-access-token'];
    //console.log("my token "+ token);
    if (token) {
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if (err) { //failed verification.
                return res.json({"error": err});
            }
            req.decoded = decoded;
            next(); //no error, proceed
            //console.log("continue routes");
        });
    } else {
        // forbidden without token
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
}