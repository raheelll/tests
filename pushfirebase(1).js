var firebase =   require('firebase');
var express    = require("express");
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'plutus_cba'
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");    
} else {
    console.log("Error connecting database ... nn");    
}
});
var isset = require("isset");
var request = require('request');
var base64 = require('base-64');
var set = require('set');
var urlencode = require('urlencode');
var asyncLoop = require('node-async-loop');
var geocoder = require('geocoder');
require('.././config/firebase_config');
var promotionfirebase = function(company,site){
	 return  new Promise(function(resolve,reject){
			connection.query('SELECT * from v1_promotions where is_firebase =1', function(err, rows, fields) {
				    if(rows.length>0){
				     // notes
				     // upsell contains trigger and apply both
				     // discount contain only apply 
				     // prodcuts active contains product_ids
				     // category active contain product_category_ids				     
					   	var row  = rows;
					   	var expectedOutput = {
							    "v1": {							      
							       }
							
							
							
							
---------------------------------
var row = [{
  id: 20,
  promotion_id: 5,
  site_id: 22514,
  company_id: 20155,
  name: 'first upsell promo',
  type: 'discount',
  image: '',
  triggers: '',
  apply: '{"order_total":true,"percent":10}',
  created_at: '2017-03-29T05: 53: 42.000Z',
  updated_at: '2017-03-29T05: 53: 42.000Z',
  is_firebase: 1,
  is_approved: 0
},{
  id: 82,
  promotion_id: 12,
  site_id: 22541,
  company_id: 20155,
  name: '1 category percentage Upsell - buy any products in Hot Drinks Category get 20% discount on a cake',
  type: 'upsell',
  image: '',
  triggers: '[{"product_category_ids":[95106,95107],"quantity":5}]',
  apply: '{"product_ids":[1863876,1863891,1863871],"percent":0}',
  created_at: '2017-03-30T00:59:11.000Z',
  updated_at: '2017-03-30T00:59:11.000Z',
  is_firebase: 1,
  is_approved: 0
}];
  
var expectedOutput = {
  "promotions": {
    "v1": {
      
    }
  }
};

//row = JSON.parse(row);
//console.log(row);

for(var i = 0;i<row.length;i++){
  var triggers = {};
  if(row[i].triggers.trim().length > 0){
   triggers = JSON.parse(row[i].triggers);
   
   if(triggers[0].hasOwnProperty('product_category_ids')){
     
      triggers = {
         category_id;{},
         // category_id: (Array.isArray(triggers[0].product_category_ids)) ? triggers[0].product_category_ids[0] : triggers[0].product_category_ids,
          quantity: triggers[0].quantity
       };
     //
      for(var j = 0;j<triggers[0].product_category_ids.length;j++){
         triggers.categrory_id[triggers[0].product_category_ids][j] = true;
        }
     //
     console.log(triggers);
    }else if(triggers[0].hasOwnProperty('product_ids')){
       triggers = {
          product_id: (Array.isArray(triggers[0].product_ids)) ? triggers[0].product_ids[0] : triggers[0].product_ids,
          quantity: triggers[0].quantity
       };
      
    }
    
     
  }
  
  var applys = JSON.parse(row[i].apply);
  if(applys.hasOwnProperty('product_category_ids')){
    var applysOutput = {
      categrory_id: {},
      percent: applys.percent
    };
    for(var k = 0;k<applys.product_category_ids.length;k++){
      applysOutput.categrory_id[applys.product_category_ids[k]] = true;
    }
    
    applys = applysOutput;
  }else if(applys.hasOwnProperty('product_ids')){
    var applysOutput = {
      product_id: {},
      percent: applys.percent
    };
    
    for(var k = 0;k<applys.product_ids.length;k++){
      applysOutput.product_id[applys.product_ids[k]] = true;
    }
    
    applys = applysOutput;
  }
  
  if(row[i].type !== 'discount'){
    expectedOutput.promotions.v1[row[i].site_id] = {
       [row[i].promotion_id]: {
            "type" : row[i].type,
             "name" : row[i].name,
             "image" : row[i].image,
             "trigger" : triggers,
            "apply" : applys
         }
    };
  }else{
    expectedOutput.promotions.v1[row[i].site_id] = {
       [row[i].promotion_id]: {
            "type" : row[i].type,
             "name" : row[i].name,
             "image" : row[i].image,
             "apply" : applys
         }
    };
  }
}

//console.log(expectedOutput);							
							
							
							 
							};
					  	  for(var i = 0;i<rows.length;i++){
						  var triggers = {};
						  if(row[i].triggers.trim().length > 0){
						   triggers = JSON.parse(row[i].triggers);
						   if(triggers[0].hasOwnProperty('product_category_ids')){
						      triggers = {
						          category_ids: (Array.isArray(triggers[0].product_category_ids) && triggers[0].product_category_ids.length>0) ? triggers[0].product_category_ids : "",
						          quantity: triggers[0].quantity
						       };
						       //console.log(triggers);
						    }else if(triggers[0].hasOwnProperty('product_ids')){
						       triggers = {
						          product_ids: (Array.isArray(triggers[0].product_ids) && triggers[0].product_ids.length) ? triggers[0].product_ids : "",
						          quantity: triggers[0].quantity
						       };
						    }
						  }
					      //
						  var applys = JSON.parse(row[i].apply);
						  if(applys.hasOwnProperty('product_category_ids')){
						    var applysOutput = {
						      categrory_ids: {},
						      percent: applys.percent
						    };
						    //console.log(applys.product_category_ids.length);
						    for(var k = 0;k<applys.product_category_ids.length;k++){
						      applysOutput.categrory_ids[applys.product_category_ids[k]] = true;
						    }
						    
						    applys = applysOutput;
						  }else if(applys.hasOwnProperty('product_ids')){
						    var applysOutput = {
						      product_ids: {},
						      percent: applys.percent
						    };
						    //console.log(applys.product_ids.length);
						    for(var k = 0;k<applys.product_ids.length;k++){
						      applysOutput.product_ids[applys.product_ids[k]] = true;
						    }
						    
						    applys = applysOutput;
						  }
						  
						  if(row[i].type !== 'discount'){
						    expectedOutput.v1[row[i].site_id] = {
						       [row[i].promotion_id]: {
						            "type" : row[i].type,
						             "name" : row[i].name,
						             "image" : row[i].image,
						             "trigger" : triggers,
						            "apply" : applys
						         }
						    };
						  }else{
						    expectedOutput.v1[row[i].site_id] = {
						       [row[i].promotion_id]: {
						            "type" : row[i].type,
						             "name" : row[i].name,
						             "image" : row[i].image,
						             "apply" : applys
						         }
						    };
						  }
						}
						resolve(expectedOutput);
						 	var refs = firebase.database().ref('/promotions/');
								 	refs.child('/').update(expectedOutput);
						console.log(expectedOutput);
							}						 	   
				
					});		 
	//resolve('success');
	});
}

module.exports = {promotionfirebase};
  for(var j = 0;j<triggerss[0].product_category_ids.length;j++){
         //console.info(triggerss[0].product_category_ids[j]);
    
         triggers.category_id[triggerss[0].product_category_ids[j]]=true;
    }

///
https://jsfiddle.net/5cx0258g/6/
