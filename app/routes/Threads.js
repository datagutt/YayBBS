module.exports = function(app, models){
	var Thread = models.Thread;
	var User = models.User;
	
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
			user_id: '51d167a56db736cc16000002', 
			subject: 'What is your favorite food?',
			content: 'So?',
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
				var i = 0;
				[].forEach.call(threads, function(thread){
					User.findOne({_id: threads[i].user_id}, function(err, user){
						if(user){
							threads[i].author = user.username;
						}
						if(i == threads.length - 1){
							res.render('partials/threads', {
								'threads': threads,
								'categories': categories,
								'category': category
							});
						}
						i++;
					});
				});
			}else{
				res.render('partials/error', {
					'message': 'This category does not exist.'
				});
			}
		});
	});
	
	app.get('/thread/:id/:subject', function(req, res){
		Thread.findOne({_id: req.params.id}).exec(function(err, thread){
			if(thread && thread.comments){
				var comments = thread.comments;
				var i = 0;
				[].forEach.call(comments, function(comment){
					User.findOne({_id: comments[i].user_id}, function(err, user){
						if(user){
							comments[i].author = user.username;
						}
						if(i == comments.length - 1){
							res.render('partials/thread', {
								'thread': thread,
								'comments': comments
							});
						}
						i++;
					});
				})
			}else{
				res.render('partials/error', {
					'message': 'This thread does not exist.'
				});
			}
		})
	});
};