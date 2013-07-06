var pagination = require('pagination');
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
					user_id: '51d167a56db736cc16000002',
					content: 'Nothing beats homemade lasagna',
				},
				{
					user_id: '51d167a56db736cc16000002',
					content: 'What is the idiot above saying? Pizza is obviously the only true food.',
				}
			]
		});
		a.save();*/
		var page = req.query.page ? req.query.page : 0,
			perPage = 10;
		Thread.find(find).sort({lastUpdate: -1}).skip(page * perPage).limit(perPage).exec(function(err, threads){
			if(threads.length > 0){
				var paginator = new pagination.ItemPaginator({
					prelink: '/',
					current: page,
					rowsPerPage: perPage,
					totalResult: threads.length
				});
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
								'category': category,
								'pagination': paginator.render()
							});
						}
						i++;
					});
				});
			}else if(categories.length == 0){
				res.render('partials/error', {
					'message': 'This category does not exist.'
				});
			}else{
				res.render('partials/error', {
					'message': 'This category is empty.'
				});
			}
		});
	});
	
	app.get('/thread/:id/:subject', function(req, res){
		var page = req.query.page ? req.query.page : 1,
			perPage = 5;
		Thread.findOne({_id: req.params.id}).exec(function(err, thread){
			if(thread && thread.comments){
				var comments = thread.comments,
					i = 0;
				var paginator = new pagination.ItemPaginator({
					prelink: '/thread/' + req.params.id + '/' + req.params.subject,
					current: page,
					rowsPerPage: perPage,
					totalResult: comments.length
				});
				var offset = (page - 1) * perPage;
				comments = comments.slice(offset, offset + perPage);
				if(!comments.length){
					res.render('partials/error', {
						'message': 'This page of thread does not exist.'
					});
				}
				[].forEach.call(comments, function(comment){
					User.findOne({_id: comments[i].user_id}, function(err, user){
						if(user){
							comments[i].author = user.username;
						}
						if(i == comments.length - 1){				
							res.render('partials/thread', {
								'thread': thread,
								'comments': comments,
								'pagination': paginator.render()
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

	app.post('/thread/:id/:subject', function(req, res){
		var comment = {
			'user_id': req.session.user.id,
			'content': req.body.comment
		};
		Thread.update({_id: req.params.id}, {$pushAll: {comments: [comment]}},{upsert:true}, function(err){
			if(err){
				console.log(err);
			}
			res.redirect('/thread/' + req.params.id + '/' + req.params.subject +'');
		});
	});
};