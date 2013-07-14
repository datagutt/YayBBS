var pagination = require('pagination');
module.exports = function(app, models){
	var Thread = models.Thread;
	var Comment = models.Comment;
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
			content: 'So?'
		});
		a.save();*/
		/*var b = new Comment({
			user_id: '51d167a56db736cc16000002',
			thread_id: '51d80d85845c7e0000000008',
			content: 'So?'
		});
		b.save();*/
		
		var page = req.query.page ? parseInt(req.query.page, 10) : 0,
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
				threads.forEach(function(thread){
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
		var page = req.query.page ? parseInt(req.query.page, 10) : 1,
			perPage = 5,
			offset = (page - 1) * perPage;
		Comment.find({thread_id: req.params.id}).sort({created: 1}).skip(offset).limit(perPage).exec(function(err, comments){
			if(comments && comments.length > 0){
				var i = 0;
				var paginator = new pagination.ItemPaginator({
					prelink: '/thread/' + req.params.id + '/' + req.params.subject,
					current: page,
					rowsPerPage: perPage,
					totalResult: comments.length
				});
				comments.forEach(function(comment){
					User.findOne({_id: comment.user_id}, function(err, user){
						if(user){
							comments[i].author = user.username;
						}
						if(i == comments.length - 1){			
							Thread.findOne({_id: comment.thread_id}, function(err, thread){
								res.render('partials/thread', {
									'thread': thread,
									'comments': comments,
									'pagination': paginator.render()
								});
							});
						}
						i++;
					});
				});
			}else{
				if(page > 0 && offset > 0){
					res.render('partials/error', {
						'message': 'This page of thread does not exist.'
					});
				}else{
					res.render('partials/error', {
						'message': 'This thread does not exist.'
					});
				}
			}
		});
	});

	app.post('/thread/:id/:subject', function(req, res){
		var comment = new Comment({
			'user_id': req.session.user.id,
			'thread_id': req.params.id,
			'content': req.body.comment
		});
		comment.save(function(err){
			if(err){
				console.log(err);
			}
			res.redirect('/thread/' + req.params.id + '/' + req.params.subject +'');
		});
	});
};