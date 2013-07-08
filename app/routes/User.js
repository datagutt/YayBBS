require('date-format-lite');
module.exports = function(app, models){
	var Thread = models.Thread;
	var User = models.User;
	
	app.get('/user/:username', function(req, res){
		User.findOne({username: req.params.username}, function(err, user){
			if(err){
				res.render('partials/error', {
					'message': 'An error occured.'
				});
				return;
			}
			
			if(user){
				var date = new Date();
				if(user._id){
					date = new Date(user._id.getTimestamp());
				}
				var since = date.format('MMMM, YYYY');
				Thread.count({user_id: user.id}, function(err, threadCount){
					res.render('partials/user', {
						'user': {
							'isYou': (req.session.user && user.username == req.session.user.username),
							'username': user.username,
							'since': since,
							'threads': threadCount || 0,
							'comments': 0,
							'services': user.services || {}
						}
					});
				});
			}else{
				res.render('partials/error', {
					'message': 'User not found.'
				});
			}
		});
	});
};