var mongoose = require('mongoose');
// deifne our schema
var userSchema   = new mongoose.Schema({
    name:       String,
    password:   String,
    token:      String,
    admin:      Boolean
});

// export mongoose model
module.exports = mongoose.model('User',userSchema);