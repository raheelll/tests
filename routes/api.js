var express =      require('express');
var app = express();
var path =     require('path');

var apiRoutes = express.Router();
var mongoose = require('mongoose');
var jwt    =   require('jsonwebtoken');
//app.set('superSecret', config.secret); // secret variable
var news   =      require('.././news/news');
var verifyToken = require('../middleware/verify_token');
//const m_db =   require('.././config/mongo_connection');
// new connection for web base token

var config = require('../config');
mongoose.connect(config.database); // connect to database
// console.log(config.secret);
 app.set("superSecret",config.secret); // secret variable
//
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console


var Beer =     require('.././model/beer');
var User =     require('.././model/user');
var hbs = require('hbs');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

apiRoutes.get('/',verifyToken,function (req,res) {
    res.json({message : "welcome to rest api routes"});
})
// create new user
apiRoutes.post('/setup',function (req,res) {
    var name  = req.body.name;
    var password = req.body.password;
    //res.send(password);
    var new_user  =  new User({
        name: name,
        password: password,
        admin: true
    });
    new_user.save(function (err) {
        if(err) throw err;
        res.json({message:"User has been successfully created"});
    });
});
// list of all users
apiRoutes.get('/users',verifyToken,function (req,res) {
    User.find({},function (err,users) {
        if(err) throw err;
        res.json(users);
    })
});
// authenticate the user
apiRoutes.post('/authenticate',function (req,res) {
    username = req.body.name;
    User.findOne({name:username},function (err,user) {
        if(err) throw err;
        if(!user){
            res.json({message: "authentication is failed"});
        }else if( user.password != req.body.password){
            res.json({ success: false, message: 'Authentication failed.Wrong password'});
        }
        else{
            // user found and password is match ceate token
            var token = jwt.sign(user, app.get('superSecret'), {
                //expiresInMinutes: 1440 // expires in 24 hours
                expiresIn: 1440 // expires in 1 hour
            });
            User.findOne({token:token},function (err,token) {
                if(err) throw err;
                res.json(token);
            });
           /* exist_user = new User({token: token});
            exist_user.save(function (err) {
                if (err) throw err;
            });*/
            /*res.json({
                success: true,
                message: 'Enjoy your token!',
                token: token
            });*/
           // res.json({message:"successfull"});
        }
    });
    // res.send(username);
});
/*apiRoutes.use(function (req,res,next) {
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
//  route middleware to verify token
module.exports = apiRoutes;
