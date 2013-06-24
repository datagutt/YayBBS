module.exports = function(app, db){
	var Thread = require('../models/Thread')(db);

	app.get('/', function(req, res){
		var config = require('../../config'),
			categories = [];
		
		for(key in config.categories){
			categories.push(key);
		}
		/*var a = new Thread({
			user_id: 1, 
			subject: 'What is your favorite food?',
			comments: [
				{
					user_id: 2,
					content: 'Nothing beats homemade lasagna',
				},
				{
					user_id: 3,
					content: 'What is the idiot above saying? Pizza is obviously the only true food.',
				}
			]
		});
		a.save();*/
		
		Thread.find().sort({lastUpdate: -1}).exec(function(err, threads){
			res.render('partials/threads', {
				'threads': threads,
				'categories': categories
			});
		});
	});
};