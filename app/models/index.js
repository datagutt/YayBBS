var fs = require('fs');
module.exports = function(db){
	fs.readdirSync(__dirname).forEach(function(name){
		if(name !== 'index.js' && name.indexOf('.js') == name.length - 3){
			var model = require(__dirname + '/' + name);
			if(model){
				model(db);
			}
		}
	});
};