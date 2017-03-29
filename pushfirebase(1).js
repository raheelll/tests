var firebase =   require('firebase');

var express    = require("express");
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'devcba',
  database : 'cba'
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
var pushfirebase = function(company,site){
	 return  new Promise(function(resolve,reject){

				connection.query('SELECT * from v3_site where is_firebase =1', function(err, rows, fields) {
							if(rows.length>0){
								asyncLoop(rows, function (sites, next){
										var site_array =  {};
										site_array[sites.site_id]={name:sites.name};
										site_array[sites.site_id].address = sites.address;
										site_array[sites.site_id].allowCheckin = true;
										site_array[sites.site_id].allowOrderAhead =true;
										site_array[sites.site_id].beacons ="";
										site_array[sites.site_id].isOnline = true;
										site_array[sites.site_id].suburb = sites.state;
										//console.log('***'+sites.image);
										//site_array[sites.site_id].logossss =sites.image;
										if(sites.image!='')
										{
											if(sites.is_approved==2)
											{
												site_array[sites.site_id].logo = sites.image;
	
											}else{
													connection.query('SELECT * from v3_images where image_link = "'+sites.image+'" and status =1', function(err, rows, fields){
														if(rows.length>0)
														{
																site_array[sites.site_id].logo=sites.image;
														}else
														{
															site_array[sites.site_id].logo = '';
														}
													});
												}
										}
										else
										{
											site_array[sites.site_id].logo = '';
										}	
										if(sites.latitude!='' && sites.longitude!='' ){
											site_array[sites.site_id].latitude=parseFloat(sites.latitude);
											site_array[sites.site_id].longitude=parseFloat(sites.longitude);
											geocoder.reverseGeocode(sites.latitude,sites.longitude, function(err, res) {
												if(res)
												{
													site_array[sites.site_id].location=res.results[0].formatted_address;
												}
											});	
										}else{
											site_array[sites.site_id].latitude=0;
											site_array[sites.site_id].longitude=0;
											site_array[sites.site_id].location="";
											
										}
										var venue_imges = [];
										connection.query('SELECT * from v3_site_images join v3_images on v3_images.image_link = v3_site_images.images  where v3_site_images.site_id = "'+sites.site_id+'" and v3_site_images.is_firebase =1 and v3_images.status=1', function(err, rows, fields) {
													if(rows.length>0)
													{
														asyncLoop(rows, function (site_images, next1){
															venue_imges.push(site_images.images);
															next1();
														},function(error){
															console.log(error);
														});
													}
												});
	
												
										site_array[sites.site_id].venue_imges = venue_imges;
										setTimeout(function() {
											var refs = firebase.database().ref('/sites/');
											refs.child('/').update(site_array);
											next();
										}, 500);

								},function(error){
									console.log(error);
								});
							}
						});
				
				connection.query('SELECT * from v3_category join v3_rel_site_category on v3_category.category_id=v3_rel_site_category.category_id where v3_category.is_firebase =1 and v3_category.show_online=1', function(err, rows, fields) {
							if(rows.length>0){
								asyncLoop(rows, function (cate, next){
									var refss = firebase.database().ref('/menus/');
									refss.child('/'+cate.site_id+'/categories/').update(JSON.parse('{"' + cate.category_id + '": "' + cate.friendly_name + '"}'));
									next();
								},function(error){
									console.log(error);
								});
							}
						});
						
				connection.query('SELECT * from v3_option_set join v3_site on v3_option_set.company_id=v3_site.company_id  where v3_option_set.is_firebase =1 and v3_option_set.show_online=1', function(err, rows, fields) {
							if(rows.length>0){
								asyncLoop(rows, function (opt_set, next){
									var opt_array =  {};
									var option_set_id = opt_set.option_set_id;
									var site_id = opt_set.site_id;
									opt_array[opt_set.option_set_id]={name:opt_set.friendly_name};
									opt_array[opt_set.option_set_id].min_selection=opt_set.min_selection;
									opt_array[opt_set.option_set_id].max_selection=opt_set.max_selection;
									var options_arr = [];
									connection.query('SELECT * from v3_option where is_firebase =1 and show_online=1 and option_set_id="'+opt_set.option_set_id+'"', function(err, rows, fields) {
										if(rows.length>0){
											var optis_arra = {};
											asyncLoop(rows, function (opti, next1){
												optis_arra[opti.option_id]=  {name:opti.friendly_name};
												if(opti.is_modifier==1)
												{
													optis_arra[opti.option_id].is_modifier =  true;
												}
												else
												{
													optis_arra[opti.option_id].is_modifier=false;
												}
												optis_arra[opti.option_id].price = parseFloat(opti.price_en_tax,2);
												setTimeout(function() {
													opt_array[opt_set.option_set_id].options = optis_arra; 
													next1();
												},200);
											},function(error){console.log(error);});
											
										}
									});
									setTimeout(function() {
										var refsss = firebase.database().ref('/menus/');
										refsss.child('/'+opt_set.site_id+'/option_set/').update(opt_array);
										next();
									},500);
								});
							}
						});			
						
				connection.query('SELECT * from  v3_product join v3_rel_product_site on v3_product.product_id= v3_rel_product_site.product_id where v3_product.is_firebase=1 and v3_product.variant_parent_id=0 and v3_product.show_online=1 and v3_product.is_modifier=0', function(err, rows, fields) {
					        resolve(err+'***'+rows);
							if(rows.length>0){
								asyncLoop(rows, function (prod, next){
									var pro_array =  {};
									pro_array[prod.product_id]={name:prod.friendly_name};
									pro_array[prod.product_id].description=prod.description;
									
									  
									connection.query('SELECT * from v3_rel_product_variant join v3_product on v3_product.product_id=v3_rel_product_variant.variant_id where v3_rel_product_variant.product_id ="'+prod.product_id+'" and v3_product.is_firebase=1', function(err, rows, fields) {
										 console.log(err);
										if(rows.length>0)
										{
											pro_array[prod.product_id].variants = true;
											asyncLoop(rows, function (varian, next1){
												
												  if(varian.variant_attribute!='')
												  {
													  var attributes ={};
													  var variant_id = varian.product_id;
													  var variant_attribute = (varian.variant_attribute).split(',');
													  var variant_name = (varian.variant_name).split(',');
													  if(variant_attribute.length>0)
													  {
														  for(var tgl=0;tgl<variant_attribute.length;tgl++)
														  {
															  if(tgl==variant_attribute.length)
															  {
																 pro_array[prod.product_id].variant_id['attributes']=attributes;
															  }else{	
															    
															  	attributes[variant_attribute[tgl]] = variant_name[tgl];
															  }
														  }
													  }
													  
												  }
												  connection.query('SELECT unit_price from v3_rel_product_site where product_id ="'+varian.product_id+'" and site_id="'+prod.site_id+'"', function(err, rows, fields) {
													    if(rows.length>0)
														{
															attributes.price =parseFloat(rows[0].unit_price,2);
														}
														else
														{
															attributes.price =0;
														}
												      });
												
												//  pro_array[prod.product_id].option_sets =[];
												
												  connection.query('SELECT * from v3_rel_product_option_set where product_id="'+varian.product_id+'"', function(err, rows, fields) {
													  if(rows.length>0)
													  {
														  attributes.option_sets = [];
														  var count1 = 0;
														  rows.forEach(function(optiosss){
															//  pro_array[prod.product_id].option_sets[optiosss.option_set_id] = true;
														  	  attributes.option_sets[optiosss.option_set_id] = true;
															  count1++;
															  if(count1==rows.length)
															  {
																  setTimeout(function() {
																		var refsss = firebase.database().ref('/menus/');
																		refsss.child('/'+prod.site_id+'/variants/'+prod.product_id+'/'+varian.product_id+'/').update(attributes);
																		next1();
																	},1500);
															  }
														  });
													  }
													  else
													  {
														   setTimeout(function() {
																		var refsss = firebase.database().ref('/menus/');
																		refsss.child('/'+prod.site_id+'/variants/'+prod.product_id+'/'+varian.product_id+'/').update(attributes);
																		next1();
															},1000);
													  }
												  });
											},function(error){console.log(error);});
										}else
										{
											pro_array[prod.product_id].variants = false;
											pro_array[prod.product_id].option_sets =[];
									       connection.query('SELECT * from v3_rel_product_option_set join v3_product on v3_product.product_id= v3_rel_product_option_set.product_id where v3_product.product_id="'+prod.product_id+'"', function(err, rows, fields) {
												  if(rows.length>0)
												  {
													  rows.forEach(function(optiosss){
														  pro_array[prod.product_id].option_sets[optiosss.option_set_id] = true;
													  });
												  }
									  		});
										}
										
									});
									  
									if(prod.image!="")
									{
										if(prod.is_approved==2)
										{
											pro_array[prod.product_id].image=prod.image;
										}
										else
										{
										connection.query('SELECT * from v3_images join v3_product on v3_product.image=v3_images.image_link where v3_product.product_id="'+prod.product_id+'" and v3_images.status=1', function(err, rows, fields) {
											 console.log(err);
											if(rows.length>0){
												pro_array[prod.product_id].image = prod.image;
											}else
											{
												pro_array[prod.product_id].image = "";
											}
										});
									}
									}
									else
									{
										pro_array[prod.product_id].image="";
									}
									
									if(prod.top_seller==1)
									{
										pro_array[prod.product_id].top_seller = true;
									}
									else
									{
										pro_array[prod.product_id].top_seller = false;
									}
									
									if(prod.special_item==1)
									{
										pro_array[prod.product_id].special_item = true;
									}
									else
									{
										pro_array[prod.product_id].special_item = false;
									}
									
								  pro_array[prod.product_id].dietary_tags =[];
								  if(prod.dietary_tags!='')
								  {
									  var dietags  = [];
									  dietags = (prod.dietary_tags).split(',');
									  if(dietags.length>0)
									  {
										  for(var i=0;i<dietags.length;i++)
										  {
											  pro_array[prod.product_id].dietary_tags[dietags[i]] = true;
										  }
									  }
								  }
									
								  pro_array[prod.product_id].tags =[];
								  if(prod.tags!='')
								  {
									  var tags  = [];
									  tags = (prod.tags).split(',');
									  if(tags.length>0)
									  {
										  for(var i=0;i<tags.length;i++)
										  {
											  pro_array[prod.product_id].tags[tags[i]] = true;
										  }
									  }
								  }
								  
 								  pro_array[prod.product_id].categories =[];
								  
								  connection.query('SELECT * from v3_rel_product_category join v3_category on v3_category.category_id= v3_rel_product_category.category_id where v3_rel_product_category.product_id="'+prod.product_id+'" and v3_category.is_firebase=1', function(err, rows, fields) {
									   console.log(err);
									  if(rows.length>0)
									  {
										  rows.forEach(function(cateess){
											  pro_array[prod.product_id].categories[cateess.category_id] = cateess.friendly_name;
										  });
									  }
								  });									
									
									pro_array[prod.product_id].price = parseFloat(prod.unit_price,2);
									pro_array[prod.product_id].modifiers = {};
								  connection.query('SELECT * from v3_rel_product_modifier  where product_id="'+prod.product_id+'" and is_firebase=1', function(err, rows, fields) {
									   console.log(err);
									  if(rows.length>0)
									  {
										  rows.forEach(function(modifiersss){
											  pro_array[prod.product_id].modifiers[modifiersss.modifier_id] = {name:modifiersss.modifier_name};
											  pro_array[prod.product_id].modifiers[modifiersss.modifier_id].unit_price = parseFloat(modifiersss.unit_price,2);
											  pro_array[prod.product_id].modifiers[modifiersss.modifier_id].unit_price_ex_tax = parseFloat(modifiersss.unit_price_ex_tax,2)
										  });
									  }
								  });									
									
									setTimeout(function() {
										var refsss = firebase.database().ref('/menus/');
										refsss.child('/'+prod.site_id+'/products/').update(pro_array);
										next();
									},2500);
								});
							}
						});		
				

	//resolve('success');

	});
}

module.exports = {pushfirebase};
