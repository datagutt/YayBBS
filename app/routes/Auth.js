module.exports = function(app, models){
	var User = models.User;

	app.post('/auth/login', function(req, res){
		var username = req.body.username,
			password = req.body.password;
		User.findOne({username: username}, function(err, user){
			if(err){
				throw err;
			}
			
			if(user){
				user.comparePassword(password, function(err, isMatch){
					if(isMatch){
						// TODO: session shit
						req.session.user = {
							'id': user._id,
							'username': user.username	
						};
						res.redirect('/');
					}else{
						res.render('partials/error', {
							message: 'Wrong username or password'
						});
					}
				});
			}else{
				res.render('partials/error', {
					message: 'Wrong username or password'
				});
			}
		});
	});
	
	app.get('/auth/register', function(req, res){
		var user = new User({
			username: 'yes',
			password: 'no'
		});
		user.save();
		res.end('lol');
	});
	
	app.post('/auth/logout', function(req, res){
		req.session.loggedin = false;
		if(req.session.user){
			delete req.session.user;
		}
		res.redirect('/');
	});
};