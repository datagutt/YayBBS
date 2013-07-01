module.exports = function(app, db){
	var Thread = require('../models/Thread')(db);

	app.get('/', function(req, res){
		var config = require('../../config'),
			categories = [],
			category,
			find = {};
		
		for(key in config.categories){
			categories.push(key);
		}
		
		if(category = req.query.c){
			find['category'] = category;
		}else{
			find['category'] = {$in: categories};
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
		
		Thread.find(find).sort({lastUpdate: -1}).exec(function(err, threads){
			if(threads.length > 0){
				res.render('partials/threads', {
					'threads': threads,
					'categories': categories,
					'category': category
				});
			}else{
				res.render('partials/error', {
					'message': 'This category does not exist.'
				});
			}
		});
	});
};