var makeUser = function(req, res, models, user, token){
	var User = models.User,
		Invite = models.Invite;
	if(req.body.username){
		var username = req.body.username,
			email = req.body.email,
			password = req.body.password;
		var errors = [];
		
		if(username.length == 0){
			errors.push(res.__('Username must contain more than 1 character'));
		}
		
		if(password.length < 5){
			errors.push(res.__('Password must contain more than 5 characters'));
		}
		User.exists(username, function(taken){
			if(taken){
				errors.push(res.__('Username is already registered'));
			}
		
			if(errors.length == 0){
				user.username = username;
				user.email = email;
				user.password = password;
				var u = new User(user);
				if(token){
					Invite.accept(token, function(err){
						if(!err){
							u.save();
						}
						res.redirect('/');
					});
				}else{
					u.save();
					res.redirect('/');
				}
			}else{
				res.render('partials/error', {
					'message': errors.join('\n')
				});
			}
		});
	}else{
		res.render('partials/signup_form');
	}
};
module.exports = function(app, models){
	var User = models.User,
		Invite = models.Invite,
		config = require('../../config');

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
							'realname': user.realname,
							'username': user.username,
							'avatar': user.avatar,
							'services': user.services
						};
						res.redirect('/');
					}else{
						res.render('partials/error', {
							message: res.__('Wrong username or password')
						});
					}
				});
			}else{
				res.render('partials/error', {
					message: res.__('Wrong username or password')
				});
			}
		});
	});
	
	app.all('/auth/register', function(req, res){
		var user = {},
			invite_token = req.query.invite_token;
		if(!config.site.signups_allowed && invite_token){
			user.invited = true;
			
			Invite.valid(invite_token, function(err, valid){
				if(!err && valid){
					makeUser(req, res, models, user, invite_token);
				}else{
					res.render('partials/error', {
						'message': res.__('Invalid invite provided')
					});
				}
			});
		}else if(config.site.signups_allowed){
			var user = {};
			user.invited = false;
			makeUser(req, res, models, user, '');
		}else{
			res.render('partials/error', {
				'message': res.__('Signups are not allowed')
			});
		}
	});
	
	app.post('/auth/logout', function(req, res){
		req.session.loggedin = false;
		if(req.session.user){
			delete req.session.user;
		}
		res.redirect('/');
	});
};