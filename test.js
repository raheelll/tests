connection.query('SELECT * from v1_promotions where is_firebase =1 AND v1_promotions.batch_id = "' + batch_id + '"', function (err, rows, fields) {
            if (rows.length > 0) {
                logger.info("[pushfirebase]  Sending [" + rows.length + "] Promotion to firebase");
                var row = rows;
                var expectedOutput = {
                    "v1": {}
                };
                // mysql data
                var promo_category =   JSON.parse(db_category);
                var product_json =     JSON.parse(promo_product);
                // var product_keys =     Object.keys(product_json[0]);
                var variant_json =     JSON.parse(promo_var);
                // var variants_array =   variant_json[0]['variants'];
                // var variant_keys =   Object.keys(variants_array);
                if(promo_category.length > 0){
                    var category_keys = Object.keys(promo_category[0]);
                    logger.info("Promo category "+ promo_category);
                    logger.info("Promo length "+ promo_category.length);
                }else{
                    variant_keys = 0;
                    logger.info("Less than 0  category ");
                }

                //
                for (var i = 0; i < rows.length; i++) {
                    var triggers = {};
                    // check triggers

                    if (row[i].triggers.trim().length > 0) {
                        triggers_array = JSON.parse(row[i].triggers);
                        if (triggers_array[0].hasOwnProperty('product_category_ids')) {
                            logger.info("[pushfirebase]  Sending product_category_ids of triggers to firebase" + row[i]);
                            if (triggers_array[0].product_category_ids.length == 1) {
                                if (isset(triggers_array[0].quantity)) {
                                    var triggersOutPut = {
                                        categories: {},
                                        quantity: triggers_array[0].quantity,
                                    };
                                    //triggersOutPut.categories[triggers_array[0].product_category_ids[0]] = true;
                                    //
                                    var trigger_category = triggers_array[0].product_category_ids[0];
                                    if (in_array(trigger_category, category_keys)) {
                                        var cat_key = trigger_category;
                                        var category_name = promo_category[0][trigger_category];
                                        triggersOutPut.categories[cat_key] = {
                                            "name": category_name
                                        }
                                    } else {

                                    }
                                    //
                                    triggers = triggersOutPut;
                                } else {

                                    var triggersOutPut = {
                                        categories: {},
                                        amount: triggers_array[0].amount,  // quantity :    "",       // amount not support

                                    };
                                    //triggersOutPut.category_ids[triggers_array[0].product_category_ids[0]] = true;
                                    //
                                    var trigger_category = triggers_array[0].product_category_ids[0];
                                    if (in_array(trigger_category, category_keys)) {
                                        var cat_key = trigger_category;
                                        var category_name = promo_category[0][trigger_category];
                                        triggersOutPut.categories[cat_key] = {
                                            "name": category_name
                                        }
                                    } else {

                                    }
                                    //
                                    triggers = triggersOutPut;
                                    logger.info(triggers);
                                }
                            } else {

                                if (isset(triggers_array[0].quantity)) {
                                    var triggersOutPut = {
                                        categories: {},
                                        quantity: triggers_array[0].quantity,
                                    };
                                    for (var t = 0; t < triggers_array[0].product_category_ids.length; t++) {
                                        //triggersOutPut.categories[triggers_array[0].product_category_ids[t]] = true;
                                        var trigger_category = triggers_array[0].product_category_ids[t];
                                        if (in_array(trigger_category, category_keys)) {
                                            var cat_key = trigger_category;
                                            var category_name = promo_category[0][trigger_category];
                                            triggersOutPut.categories[cat_key] = {
                                                "name": category_name
                                            }
                                        } else {

                                        }


                                    }
                                    triggers = triggersOutPut;
                                } else {
                                    logger.info(triggers_array[0].product_category_ids);
                                    var triggersOutPut = {
                                        categories: {},
                                        amount: triggers_array[0].amount,  // quantity : "",         // not support

                                    };
                                    for (var t = 0; t < triggers_array[0].product_category_ids.length; t++) {
                                        // triggersOutPut.category_ids[triggers_array[0].product_category_ids[t]] = true;
                                        //
                                        var trigger_category = triggers_array[0].product_category_ids[t];
                                        if (in_array(trigger_category, category_keys)) {
                                            var cat_key = trigger_category;
                                            var category_name = promo_category[0][trigger_category];
                                            triggersOutPut.categories[cat_key] = {
                                                "name": category_name
                                            }
                                        }
                                        //

                                    }
                                    triggers = triggersOutPut;
                                }
                            } // end else
                        } else if (triggers_array[0].hasOwnProperty('product_ids')) {
                            logger.info("[pushfirebase]  Sending product_ids of triggers to firebase");
                            // check one value in prods
                            if (triggers_array[0].product_ids.length == 1) {
                                if (isset(triggers_array[0].quantity)) {
                                    var triggersOutPut = {
                                        products: {},
                                        quantity: triggers_array[0].quantity
                                    };
                                    //var trigger_product_id = triggers_array[0].product_ids[0];
                                    //triggersOutPut.product_ids[triggers_array[0].product_ids[0]]= true;
                                    logger.info("&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
                                    var trigger_product_id = triggers_array[0].product_ids[0];

                                    if (product_json.length > 0 && product_json[0].hasOwnProperty(trigger_product_id)) {

                                        var product_id = trigger_product_id;
                                        var product_name = product_json[0][trigger_product_id];
                                        triggersOutPut.products[product_id] = {
                                            "name": product_name,

                                        }
                                    } else if (variant_json.length > 0 && variant_json[0].hasOwnProperty('variants') && variant_json[0]['variants'].hasOwnProperty(trigger_product_id)) {
                                        var variant_id = trigger_product_id;
                                        var variant_name = variant_json[0]['variants'][trigger_product_id];
                                        var product_id = variant_json[0]['product'][trigger_product_id];
                                        var product_name = product_json[0][variant_json[0]['product'][trigger_product_id]];
                                        triggersOutPut.products[variant_id] = {
                                            "name": variant_name,
                                            "parent_product_id": product_id,
                                            "parent_product_name": product_name,
                                        }
                                    }
                                    logger.info(triggersOutPut)
                                    triggers = triggersOutPut;
                                } else {

                                    var triggersOutPut = {
                                        products: {},
                                        amount: triggers_array[0].amount  // quantity: " " // not support
                                    };
                                    var trigger_product_id = triggers_array[0].product_ids[0];

                                    if (product_json.length > 0  &&  product_json[0].hasOwnProperty(trigger_product_id)) {
                                        var product_id = trigger_product_id;
                                        var product_name = product_json[0][trigger_product_id];
                                        triggersOutPut.products[product_id] = {
                                            "name": product_name,

                                        }
                                    } else if (variant_json.length > 0 && variant_json[0].hasOwnProperty('variants') && variant_json[0]['variants'].hasOwnProperty(trigger_product_id)) {
                                        var variant_id = trigger_product_id;
                                        var variant_name = variant_json[0]['variants'][trigger_product_id];
                                        var product_id = variant_json[0]['product'][trigger_product_id];
                                        var product_name = product_json[0][variant_json[0]['product'][trigger_product_id]];
                                        triggersOutPut.products[variant_id] = {
                                            "name": variant_name,
                                            "parent_product_id": product_id,
                                            "parent_product_name": product_name,
                                        }
                                    }

                                    //triggersOutPut.product_ids[triggers_array[0].product_ids[0]]= true;

                                    triggers = triggersOutPut;
                                }


                            } else {

                                if (isset(triggers_array[0].quantity)) {
                                    var triggersOutPut = {
                                        products: {},
                                        quantity: triggers_array[0].quantity
                                    };
                                    for (var j = 0; j < triggers_array[0].product_ids.length; j++) {
                                        var triggerObj = triggers_array[0].product_ids[j];
                                        //triggersOutPut.product_ids[triggerObj]=true;
                                        if (product_json.length > 0 && product_json[0].hasOwnProperty(triggerObj)) {

                                            var product_id = triggerObj;
                                            var product_name = product_json[0][triggerObj];
                                            triggersOutPut.products[product_id] = {
                                                "name": product_name,

                                            }
                                        } else if (variant_json.length > 0 && variant_json[0].hasOwnProperty('variants') && variant_json[0]['variants'].hasOwnProperty(triggerObj)) {
                                            var variant_id = triggerObj;
                                            var variant_name = variant_json[0]['variants'][triggerObj];
                                            var product_id = variant_json[0]['product'][triggerObj];
                                            var product_name = product_json[0][variant_json[0]['product'][triggerObj]];
                                            triggersOutPut.products[variant_id] = {
                                                "name": variant_name,
                                                "parent_product_id": product_id,
                                                "parent_product_name": product_name,
                                            }
                                        }

                                    }
                                    logger.info(triggersOutPut);
                                    triggers = triggersOutPut;
                                } else {
                                    // get mysql category
                                    var triggersOutPut = {
                                        products: {},
                                        amount: triggers_array[0].amount  // quantity: " "

                                    };
                                    for (var j = 0; j < triggers_array[0].product_ids.length; j++) {
                                        var triggerObj = triggers_array[0].product_ids[j];
                                        //triggersOutPut.products[triggerObj]=true;
                                        var trigger_product_id = triggers_array[0].product_ids[j];

                                        if (product_json.length > 0 && product_json[0].hasOwnProperty(trigger_product_id)) {

                                            var product_id = trigger_product_id;
                                            var product_name = product_json[0][trigger_product_id];
                                            triggersOutPut.products[product_id] = {
                                                "name": product_name,

                                            }
                                        } else if (variant_json.length > 0 && variant_json[0].hasOwnProperty('variants') && variant_json[0]['variants'].hasOwnProperty(trigger_product_id)) {
                                            var variant_id = trigger_product_id;
                                            var variant_name = variant_json[0]['variants'][trigger_product_id];
                                            var product_id = variant_json[0]['product'][trigger_product_id];
                                            var product_name = product_json[0][variant_json[0]['product'][trigger_product_id]];
                                            triggersOutPut.products[variant_id] = {
                                                "name": variant_name,
                                                "parent_product_id": product_id,
                                                "parent_product_name": product_name,
                                            }
                                        }
                                        logger.info("*****************Start object*********************");
                                    }
                                    triggers = triggersOutPut;
                                    logger.info(triggersOutPut);

                                }

                            }
                        }
                    }
                    /// check apply //////////////
                    // check for type and discount and add to expectedOutput object external
                    if (row[i].type !== 'Discount') {
                        // type upsell case
                        if (row[i].apply) {
                            var applys = JSON.parse(row[i].apply);
                            var applysOutput;
                            if (applys.hasOwnProperty('product_tags')) {
                                applysOutput = {
                                    // order_total: applys.order_total,
                                    // percent: ""
                                };
                                applys = applysOutput;

                            } else if (applys.hasOwnProperty('order_total')) {
                                applysOutput = {
                                    // order_total: applys.order_total,
                                    // percent: ""
                                };
                                applys = applysOutput;
                            } else if (applys.hasOwnProperty('product_category_ids')) {

                                if (applys.product_category_ids.length == 1) {

                                    if (isset(applys.amount)) {
                                        applysOutput = {
                                            categories: {},
                                            amount: applys.amount
                                        };
                                    } else {
                                        applysOutput = {
                                            categories: {},
                                            percent: applys.percent
                                        };

                                    }
                                    //applysOutput.category_ids[applys.product_category_ids[0]] = true;
                                    //
                                    var apply_category = applys.product_category_ids[0];
                                    if (in_array(apply_category, category_keys)) {
                                        var cat_key = apply_category;
                                        var category_name = promo_category[0][apply_category];
                                        applysOutput.categories[cat_key] = {
                                            "name": category_name
                                        }
                                    } else {

                                    }

                                    applys = applysOutput;

                                } else {

                                    if (isset(applys.amount)) {
                                        var applysOutput = {
                                            categories: {},
                                            amount: applys.amount
                                        };
                                        for (var k = 0; k < applys.product_category_ids.length; k++) {
                                            //applysOutput.category_ids[applys.product_category_ids[k]] = true;
                                            //
                                            var apply_category = applys.product_category_ids[k];
                                            if (in_array(apply_category, category_keys)) {
                                                var cat_key = apply_category;
                                                var category_name = promo_category[0][apply_category];
                                                applysOutput.categories[cat_key] = {
                                                    "name": category_name
                                                }
                                            } else {

                                            }
                                            //
                                        }
                                        applys = applysOutput;

                                    } else {
                                        var applysOutput = {
                                            categories: {},
                                            percent: applys.percent
                                        };
                                        for (var k = 0; k < applys.product_category_ids.length; k++) {
                                            //applysOutput.category_ids[applys.product_category_ids[k]] = true;
                                            logger.info("*** start multiple categories amount  ***");
                                            var apply_category = applys.product_category_ids[k];
                                            if (in_array(apply_category, category_keys)) {
                                                var cat_key = apply_category;
                                                var category_name = promo_category[0][apply_category];
                                                applysOutput.categories[cat_key] = {
                                                    "name": category_name
                                                }
                                            } else {

                                            }
                                        }
                                        applys = applysOutput;
                                    }
                                }
                            } else if (applys.hasOwnProperty('product_ids')) {

                                if (applys.product_ids.length == 1) {

                                    if (isset(applys.amount)) {
                                        logger.info("*****upsel apply*))))))))))))))))00********");
                                        var applysOutput = {
                                            products: {},
                                            amount: applys.amount
                                        };
                                        //applysOutput.product_ids[applys.product_ids[0]] = true;
                                        //
                                        var apply_product_id = applys.product_ids[0];
                                        if (product_json.length > 0 &&  product_json[0].hasOwnProperty(apply_product_id)) {

                                            var product_id = apply_product_id;
                                            var product_name = product_json[0][apply_product_id];
                                            applysOutput.products[product_id] = {
                                                "name": product_name,

                                            }
                                        } else if (variant_json.length > 0 && variant_json[0].hasOwnProperty('variants') && variant_json[0]['variants'].hasOwnProperty(apply_product_id)) {
                                            var variant_id = apply_product_id;
                                            var variant_name = variant_json[0]['variants'][apply_product_id];
                                            var product_id = variant_json[0]['product'][apply_product_id];
                                            var product_name = product_json[0][variant_json[0]['product'][apply_product_id]];
                                            applysOutput.products[variant_id] = {
                                                "name": variant_name,
                                                "parent_product_id": product_id,
                                                "parent_product_name": product_name,
                                            }
                                        }
                                        //

                                        applys = applysOutput;

                                    } else {
                                        var applysOutput = {
                                            products: {},
                                            percent: applys.percent
                                        };
                                        // applysOutput.product_ids[applys.product_ids[0]] = true;
                                        //
                                        var apply_product_id = applys.product_ids[0];
                                        if (product_json.length > 0 && product_json[0].hasOwnProperty(apply_product_id)) {

                                            var product_id = apply_product_id;
                                            var product_name = product_json[0][apply_product_id];
                                            applysOutput.products[product_id] = {
                                                "name": product_name,

                                            }
                                        } else if (variant_json.length > 0 && variant_json[0].hasOwnProperty('variants') && variant_json[0]['variants'].hasOwnProperty(apply_product_id)) {
                                            var variant_id = apply_product_id;
                                            var variant_name = variant_json[0]['variants'][apply_product_id];
                                            var product_id = variant_json[0]['product'][apply_product_id];
                                            var product_name = product_json[0][variant_json[0]['product'][apply_product_id]];
                                            applysOutput.products[variant_id] = {
                                                "name": variant_name,
                                                "parent_product_id": product_id,
                                                "parent_product_name": product_name,
                                            }
                                        }
                                        //
                                        logger.info(applysOutput);
                                        applys = applysOutput;
                                    }

                                } else {

                                    if (isset(applys.amount)) {

                                        var applysOutput = {
                                            products: {},
                                            amount: applys.amount
                                        };
                                        for (var k = 0; k < applys.product_ids.length; k++) {
                                            //applysOutput.product_ids[applys.product_ids[k]] = true;
                                            //
                                            var apply_product_id = applys.product_ids[k];
                                            if (product_json.length > 0 && product_json[0].hasOwnProperty(apply_product_id)) {

                                                var product_id = apply_product_id;
                                                var product_name = product_json[0][apply_product_id];
                                                applysOutput.products[product_id] = {
                                                    "name": product_name,

                                                }
                                            } else if (variant_json.length > 0 && variant_json[0].hasOwnProperty('variants') && variant_json[0]['variants'].hasOwnProperty(apply_product_id)) {
                                                var variant_id = apply_product_id;
                                                var variant_name = variant_json[0]['variants'][apply_product_id];
                                                var product_id = variant_json[0]['product'][apply_product_id];
                                                var product_name = product_json[0][variant_json[0]['product'][apply_product_id]];
                                                applysOutput.products[variant_id] = {
                                                    "name": variant_name,
                                                    "parent_product_id": product_id,
                                                    "parent_product_name": product_name,
                                                }
                                            }
                                            //
                                        }

                                        applys = applysOutput;
                                    } else {
                                        logger.info("&&&&&&&&&&AMMMMMMMMMMMMMMMM&&&7")
                                        var applysOutput = {
                                            products: {},
                                            percent: applys.percent
                                        };
                                        for (var k = 0; k < applys.product_ids.length; k++) {
                                            //applysOutput.product_ids[applys.product_ids[k]] = true;
                                            //
                                            var apply_product_id = applys.product_ids[k];
                                            if (product_json.length > 0 && product_json[0].hasOwnProperty(apply_product_id)) {

                                                var product_id = apply_product_id;
                                                var product_name = product_json[0][apply_product_id];
                                                applysOutput.products[product_id] = {
                                                    "name": product_name,

                                                }
                                                logger.info("Variants Lists");

                                            } else if (variant_json.length > 0 && variant_json[0].hasOwnProperty('variants') && variant_json[0]['variants'].hasOwnProperty(apply_product_id)) {
                                                var variant_id = apply_product_id;
                                                var variant_name = variant_json[0]['variants'][apply_product_id];
                                                var product_id = variant_json[0]['product'][apply_product_id];
                                                var product_name = product_json[0][variant_json[0]['product'][apply_product_id]];
                                                applysOutput.products[variant_id] = {
                                                    "name": variant_name,
                                                    "parent_product_id": product_id,
                                                    "parent_product_name": product_name,
                                                }
                                            }
                                            //
                                        }
                                        logger.info(applysOutput);
                                        applys = applysOutput;
                                    }
                                }	// else
                            }
                        }
                        expectedOutput.v1[row[i].site_id] = {
                            [row[i].promotion_id]: {
                                "type": row[i].type,
                                "name": row[i].name,
                                "trigger": triggers,
                                "apply": applys
                            }
                        };

                    } else {
                        ///  apply  Discount case

                        if (row[i].apply) {
                            var applys = JSON.parse(row[i].apply);
                            var applysOutput;
                            if (applys.product_tags) {
                                applysOutput = {
                                    // order_total: applys.order_total,
                                    // percent: ""
                                };
                                applys = applysOutput;
                            } else if (applys.order_total) {
                                if (isset(applys.amount)) {
                                    applysOutput = {
                                        order_total: applys.order_total,
                                        //percent: ""      // not support
                                    };
                                } else {
                                    applysOutput = {
                                        order_total: applys.order_total,
                                        percent: applys.percent
                                    };
                                }
                                applys = applysOutput;
                            } else if (applys.hasOwnProperty('product_category_ids')) {

                                if (applys.product_category_ids.length == 1) {
                                    if (isset(applys.amount)) {
                                        applysOutput = {
                                            categories: {},
                                            amount: applys.amount
                                        };
                                    } else {
                                        applysOutput = {
                                            categories: {},
                                            percent: applys.percent
                                        };
                                    }
                                    //applysOutput.category_ids[applys.product_category_ids[0]] = true;
                                    //
                                    var apply_category = applys.product_category_ids[0];
                                    if (in_array(apply_category, category_keys)) {
                                        var cat_key = apply_category;
                                        var category_name = promo_category[0][apply_category];
                                        applysOutput.categories[cat_key] = {
                                            "name": category_name
                                        }
                                    }
                                    //
                                    applys = applysOutput;

                                } else {
                                    if (isset(applys.amount)) {
                                        var applysOutput = {
                                            categories: {},
                                            amount: applys.amount   // percent: ""      // not support
                                        };
                                        for (var k = 0; k < applys.product_category_ids.length; k++) {
                                            //applysOutput.category_ids[applys.product_category_ids[k]] = true;
                                            //
                                            var apply_category = applys.product_category_ids[k];
                                            if (in_array(apply_category, category_keys)) {
                                                var cat_key = apply_category;
                                                var category_name = promo_category[0][apply_category];
                                                applysOutput.categories[cat_key] = {
                                                    "name": category_name
                                                }
                                            }
                                            //
                                        }
                                        applys = applysOutput;
                                    } else {
                                        var applysOutput = {
                                            categories: {},
                                            percent: applys.percent
                                        };
                                        for (var k = 0; k < applys.product_category_ids.length; k++) {
                                            //applysOutput.category_ids[applys.product_category_ids[k]] = true;
                                            //
                                            var apply_category = applys.product_category_ids[k];
                                            if (in_array(apply_category, category_keys)) {
                                                var cat_key = apply_category;
                                                var category_name = promo_category[0][apply_category];
                                                applysOutput.categories[cat_key] = {
                                                    "name": category_name
                                                }
                                            }

                                        }
                                        applys = applysOutput;
                                        logger.info(applys);
                                    }
                                }
                            } else if (applys.hasOwnProperty('product_ids')) {

                                if (applys.product_ids.length == 1) {
                                    if (isset(applys.amount)) {
                                        var applysOutput = {
                                            products: {},
                                            amount: applys.amount  // percent: ""        // not support
                                        };
                                        //applysOutput.product_ids[applys.product_ids[0]] = true;
                                        //
                                        var apply_product_id = applys.product_ids[0];
                                        if (product_json.length > 0 && product_json[0].hasOwnProperty(apply_product_id)) {

                                            var product_id = apply_product_id;
                                            var product_name = product_json[0][apply_product_id];
                                            applysOutput.products[product_id] = {
                                                "name": product_name,

                                            }
                                        } else if (variant_json.length > 0 && variant_json[0].hasOwnProperty('variants') &&  variant_json[0]['variants'].hasOwnProperty(apply_product_id)) {
                                            var variant_id = apply_product_id;
                                            var variant_name = variant_json[0]['variants'][apply_product_id];
                                            var product_id = variant_json[0]['product'][apply_product_id];
                                            var product_name = product_json[0][variant_json[0]['product'][apply_product_id]];
                                            applysOutput.products[variant_id] = {
                                                "name": variant_name,
                                                "parent_product_id": product_id,
                                                "parent_product_name": product_name,
                                            }
                                        }
                                        //
                                        logger.info(applysOutput);
                                        applys = applysOutput;
                                    } else {
                                        logger.info("********percent")
                                        var applysOutput = {
                                            products: {},
                                            percent: applys.percent
                                        };
                                        // applysOutput.product_ids[applys.product_ids[0]] = true;
                                        //
                                        var apply_product_id = applys.product_ids[0];
                                        if (product_json.length > 0 && product_json[0].hasOwnProperty(apply_product_id)) {

                                            var product_id = apply_product_id;
                                            var product_name = product_json[0][apply_product_id];
                                            applysOutput.products[product_id] = {
                                                "name": product_name,

                                            }
                                        } else if (variant_json.length > 0 && variant_json[0].hasOwnProperty('variants') && variant_json[0]['variants'].hasOwnProperty(apply_product_id)) {
                                            var variant_id = apply_product_id;
                                            var variant_name = variant_json[0]['variants'][apply_product_id];
                                            var product_id = variant_json[0]['product'][apply_product_id];
                                            var product_name = product_json[0][variant_json[0]['product'][apply_product_id]];
                                            applysOutput.products[variant_id] = {
                                                "name": variant_name,
                                                "parent_product_id": product_id,
                                                "parent_product_name": product_name,
                                            }
                                        }
                                        //
                                        logger.info(applysOutput)
                                        applys = applysOutput;
                                    }

                                } else {
                                    if (isset(applys.amount)) {
                                        //logger.info("amount discunt****************");
                                        var applysOutput = {
                                            products: {},
                                            amount: applys.amount    // percent: ""     // not support

                                        };
                                        for (var k = 0; k < applys.product_ids.length; k++) {
                                            // applysOutput.product_ids[applys.product_ids[k]] = true;
                                            //
                                            var apply_product_id = applys.product_ids[k];
                                            if (product_json.length > 0 && product_json[0].hasOwnProperty(apply_product_id)) {
                                                var product_id = apply_product_id;
                                                var product_name = product_json[0][apply_product_id];
                                                applysOutput.products[product_id] = {
                                                    "name": product_name,
                                                }
                                            } else if (variant_json.length > 0 && variant_json[0].hasOwnProperty('variants') && variant_json[0]['variants'].hasOwnProperty(apply_product_id)) {
                                                var variant_id = apply_product_id;
                                                var variant_name = variant_json[0]['variants'][apply_product_id];
                                                var product_id = variant_json[0]['product'][apply_product_id];
                                                var product_name = product_json[0][variant_json[0]['product'][apply_product_id]];
                                                applysOutput.products[variant_id] = {
                                                    "name": variant_name,
                                                    "parent_product_id": product_id,
                                                    "parent_product_name": product_name,
                                                }
                                            }
                                            //
                                        }
                                        //logger.info(applysOutput);
                                        applys = applysOutput;
                                    } else {
                                        logger.info("amount discunt percentage****************");
                                        var applysOutput = {
                                            products: {},
                                            percent: applys.percent
                                        };
                                        for (var k = 0; k < applys.product_ids.length; k++) {
                                            //applysOutput.product_ids[applys.product_ids[k]] = true;
                                            //
                                            var apply_product_id = applys.product_ids[k];
                                            if (product_json.length > 0 && product_json[0].hasOwnProperty(apply_product_id)) {
                                                var product_id = apply_product_id;
                                                var product_name = product_json[0][apply_product_id];
                                                applysOutput.products[product_id] = {
                                                    "name": product_name,
                                                }
                                            } else if (variant_json.length > 0 && variant_json[0].hasOwnProperty('variants') && variant_json[0]['variants'].hasOwnProperty(apply_product_id)) {
                                                var variant_id = apply_product_id;
                                                var variant_name = variant_json[0]['variants'][apply_product_id];
                                                var product_id = variant_json[0]['product'][apply_product_id];
                                                var product_name = product_json[0][variant_json[0]['product'][apply_product_id]];
                                                applysOutput.products[variant_id] = {
                                                    "name": variant_name,
                                                    "parent_product_id": product_id,
                                                    "parent_product_name": product_name,
                                                }
                                            }
                                            //
                                        }
                                        logger.info(applysOutput)
                                        applys = applysOutput;
                                    }

                                }	// else
                            }
                            expectedOutput.v1[row[i].site_id] = {
                                [row[i].promotion_id]: {
                                    "type": row[i].type,
                                    "name": row[i].name,
                                    "apply": applys
                                }
                            };
                        }
                    }
                    //logger.info(applys);
                    var online_cat = JSON.parse(db_category);
                    logger.info(online_cat);
                    if (online_cat.length > 0 ) {

                        var refss = firebase.database().ref('/promotions/v1/' + [row[i].site_id] + '/');
                        refss.child('/').set(null);
                        // cate_arr=JSON.parse('{"type": "promotion first"}') ;
                        refss.child(['/' + row[i].promotion_id] + '/apply/').setWithPriority(applys, 1);
                        refss.child('/' + [row[i].promotion_id] + '/name/').setWithPriority(row[i].name, 2);
                        refss.child(['/' + row[i].promotion_id] + '/trigger/').setWithPriority(triggers, 3)
                        refss.child('/' + [row[i].promotion_id] + '/type/').setWithPriority(row[i].type, 4);
                    } else {
                        logger.info("Category is not online ");
                        var refss = firebase.database().ref('/promotions/v1/' + [row[i].site_id] + '/');
                        refss.child('/').set(null);
                    }
                    logger.info("***********End*******************")

                    ///
                }
            }
        });