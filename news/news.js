

var news = function(){
	// 
	var fancyObj = {
    favoriteFood: "pizza",
    add: function(a, b){
        return a + b;
      }
   };

var cal =  fancyObj.add(2,3); // returns 5
console.log(cal);
}
module.exports = {news};