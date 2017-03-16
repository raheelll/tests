var express =  require('express');
var path = require('path');
var router =   express.Router();
var apiRoutes = express.Router();

var mongoose = require('mongoose');
var jwt    = require('jsonwebtoken');
var news   =   require('.././news/news');
//const m_db =   require('.././config/mongo_connection');
var Beer =     require('.././model/beer');
var User =     require('.././model/user');
var hbs = require('hbs');
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/*mongoose.connect('mongodb://localhost:27017/cba');*/
/*router.get('/', function(req, res) {
  res.json({ message: 'You are running dangerously low on beer!' });
});*/
// Create a new route with the prefix /beers
var beersRoute =      router.route('/beers');
var beerRoute =       router.route('/beers/:beer_id');
var createBeerRoute = router.route('/beer/create');
createBeerRoute.get(function (req,res) {

    res.render('index',{title:"HBS template"});
});
beersRoute.post(function(req, res) {
	var beer =       new Beer();
	beer.name =      req.body.name;
	beer.type =      req.body.type;
	beer.quantity =  req.body.quantity;
    beer.save(function (err) {
        if(err)
            res.send(err);
            res.json({message: 'Beer added to the locker Database!', data: beer });
    });
    console.log(beer);
});
// get all beers
beersRoute.get(function (req,res) {
    // use the bear model to find all bear
    Beer.find(function (err,beers) {
        if(err)
            res.send(err);
        if(beers){
            res.json(beers);
        }else{
            res.json({message: 'Beer not find at specific id!'});
        }
    });
});
// get single beer
beerRoute.get(function (req,res) {
    Beer.findById(req.params.beer_id,function (err,beer) {
        if(err)
            res.json({message: 'Beer not find at specific id!'});
        res.send(beer);
    })
});
// add use
var userRoute = router.route('/user/add');
/*userRoute.post(function(req,res){
    var user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.address = req.body.address;
    user.save(function (err) {
        if(err)
            res.send(err);
        res.json({message: 'User has beed addes successfuly'});
    })
});*/
beerRoute.put(function (req,res) {
    //console.log(req.body.quantity);
    Beer.findById(req.params.beer_id,function (err,beer) {
        if(err)
            res.json(err);
        // upadate beer at specific id
        beer.quantity = req.body.quantity;
        beer.save(function (err,beer) {
            if (err)
                res.send(err);
            res.json(beer);
        })
    })
});
beerRoute.delete(function (req,res) {
    Bear.findByIdAndRemove(req.params.beer_id,function (err) {
        if(err)
            res.send(err);
        res.json({"message":"The Beer has been deleted!"})
    })
});
router.get('/listing',function(req,res){ 
  var db =     mongoose.connection;
  var Schema = mongoose.Schema;
  var kittySchema = mongoose.Schema({
    name: String
  });
  res.render('index',{title:"title website "});
});

///////// routes for authentication /////////////
router.get('/',function (req,res) {
    res.send("server is running and");
});
// create new user
router.get('/setup',function (req,res) {
    var new_user  =  new User({
        name: "imran",
        password: "password",
        admin: true
    });
    new_user.save(function (err) {
        if(err) throw err;
        res.json({message:"User has been successfully created"});
    });
});
router.get('/users',function (req,res) {
    User.find({},function (err,users) {
        if(err) throw err;
        res.json(users);
    })
})
module.exports = router;
