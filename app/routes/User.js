require('date-format-lite');
var request = require('request');
module.exports = function(app, models){
	var Thread = models.Thread;
	var Comment = models.Comment;
	var User = models.User;
	
	var lastfm = function(username, cb){
		var songs = [], i = 0;
		request('http://ws.audioscrobbler.com/1.0/user/' + username + '/recenttracks.txt', function(error, response, body){
			if(error){
				cb(error);
			}
			if(body){
				body = body.split('\n');
				if(!body){
					cb();
					return;
				}
				body.forEach(function(data){
					if(data){
						var parts = data.split(',');
						if(parts && parts[0] && parts[1]){
							var songinfo = parts[1].split(' – ');
							var artist = songinfo[0],
								name = songinfo[1];
							songs.push({
								'artist': artist,
								'name': name,
								'time': parts[0]
							});
						}
					}
					if(i == body.length - 1){						
						if(typeof cb == 'function'){
							cb(false, songs);
						}
					}
					i++;
				});
			}
		});
	};
	
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
					Comment.count({user_id: user.id}, function(err, commentCount){
						lastfm((user.services && user.services.lastfm) ? user.services.lastfm.username : '', function(err, data){
							res.render('partials/user', {
								'user': {
									'isYou': (req.session.user && user.username == req.session.user.username),
									'username': user.username,
									'since': since,
									'threads': threadCount || 0,
									'comments': commentCount || 0,
									'services': user.services || {},
									'lastfm': data
								}
							});
						});
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