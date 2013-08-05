var pagination = require('pagination');
module.exports = function(app, models){
	var Thread = models.Thread;
	var Comment = models.Comment;
	var User = models.User;
	var config = require('../../config');
	
	app.get('/', function(req, res){
		var categories = [],
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
		
		var page = req.query.page ? parseInt(req.query.page, 10) : 1,
			perPage = 10,
			offset = (page - 1) * perPage;
		Thread.find(find).sort({lastUpdate: -1}).skip(offset).limit(perPage).lean().exec(function(err, threads){
			Thread.count({}, function(err, threadCount){
				if(threads.length > 0){
					var paginator = new pagination.ItemPaginator({
						prelink: '/',
						current: page,
						rowsPerPage: perPage,
						totalResult: threadCount
					});
					var i = 0;
					threads.forEach(function(thread){
						User.findOne({_id: thread.user_id}).lean().exec(function(err, user){
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
						'message': res.__('This category does not exist.')
					});
				}else{
					res.render('partials/error', {
						'message': res.__('This category is empty.')
					});
				}
			});
		});
	});
	
	app.get('/thread/:id/:subject', function(req, res){
		var page = req.query.page ? parseInt(req.query.page, 10) : 1,
			perPage = 5,
			offset = (page - 1) * perPage;
		Comment.find({thread_id: req.params.id}).sort({created: 1}).skip(offset).limit(perPage).lean().exec(function(err, comments){
			if(comments && comments.length > 0){
				var i = 0;
				Comment.count({thread_id: req.params.id}, function(err, commentCount){
					var paginator = new pagination.ItemPaginator({
						prelink: '/thread/' + req.params.id + '/' + req.params.subject,
						current: page,
						rowsPerPage: perPage,
						totalResult: commentCount
					});
					comments.forEach(function(comment){
						User.findOne({_id: comment.user_id}).lean().exec(function(err, user){
							if(user){
								comments[i].user = user;
							}
							comments[i].show_controls = (req.session.user && page == 1 && comment.user_id == req.session.user.id && !i);
							if(i == comments.length - 1){			
								Thread.findOne({_id: comment.thread_id}).lean().exec(function(err, thread){
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
				});
			}else{
				if(page > 0 && offset > 0){
					res.render('partials/error', {
						'message': res.__('This page of thread does not exist.')
					});
				}else{
					res.render('partials/error', {
						'message': res.__('This thread does not exist.')
					});
				}
			}
		});
	});
	
	app.get('/newthread', function(req, res){
		if(app.locals.loggedin){
			res.render('partials/newthread');
		}else{
			res.render('partials/error', {
				'message': res.__('You are not logged in.')
			});
		}
	});
	
	app.post('/newthread', function(req, res){
		if(app.locals.loggedin){
			var categories = config.categories,
				category = req.body.category;
			var thread = new Thread({
				'user_id': req.session.user.id,
				'category': category in categories ? category : 'Discussions',
				'subject': req.body.subject
			});
			thread.save(function(err){
				if(err){
					console.log(err);
				}
				var comment = new Comment({
					'user_id': req.session.user.id,
					'thread_id': thread.id,
					'content': req.body.comment
				});
				comment.save(function(err){
					if(err){
						console.log(err);
					}
					res.redirect('/thread/' + thread.id + '/' + req.params.subject +'');
				});
			});
		}else{
			res.render('partials/error', {
				'message': res.__('You are not logged in.')
			});
		}
	});
	
	app.post('/deletethread', function(req, res){
		if(app.locals.loggedin){
			if(req.body.id){
				Thread.findOne({_id: req.body.id}, function(err, thread){
					Comment.remove({thread_id: req.body.id}, function(err, comments){
						if(err){
							console.log(err);
							res.end();
						}
						if(thread){
							if(thread.user_id == req.session.user.id){
								thread.remove();
								res.redirect('/');
							}else{
								res.render('partials/error', {
									'message': res.__('You are not the owner of this thread.')
								});
							}
						}else{
							res.render('partials/error', {
								'message': res.__('This thread does not exist.')
							});
						}
					});
				});
			}else{
				res.render('partials/error', {
					'message': res.__('This thread does not exist.')
				});
			}
		}else{
			res.render('partials/error', {
				'message': res.__('You are not logged in.')
			});
		}
	});

	app.post('/thread/:id/:subject', function(req, res){
		if(app.locals.loggedin){
			Thread.findOne({_id: req.params.id}, function(err, thread){
				if(thread && !thread.closed){
					var comment = new Comment({
						'user_id': req.session.user.id,
						'thread_id': req.params.id,
						'content': req.body.comment
					});
					comment.save(function(err){
						if(err){
							console.log(err);
						}
						if(thread){
							thread.lastUpdate = new Date();
							thread.save(function(){
								res.redirect('/thread/' + req.params.id + '/' + req.params.subject);
							});
						}
					});
				}else{
					res.render('partials/error', {
						'message': res.__('Thread is closed.')
					});
				}
			});
		}else{
			res.render('partials/error', {
				'message': res.__('You are not logged in.')
			});
		}
	});
};