var mongoose = require('mongoose'),
	crypto = require('crypto');
module.exports = function(mongoose){
	var Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;

	var Invite = new Schema({
		token: String,
		email: String
	});
	
	Invite.statics.generate = function generate(token, cb){
		var invite = new Invite();
		var seed = crypto.randomBytes(20);
		
		invite.token = 	crypto.createHash('sha1').update(seed).digest('hex');
		invite.save(function(err){
			return cb(err, invite.token);
		});
	};
	
	Invite.statics.valid = function valid(token, cb){
		Invite.findOne({token: token}, function(err, invite){
			return cb(null, !!invite);
		});
	};
	
	Invite.statics.accept = function accept(token, cb){
		Invite.findOne({token: token}, function(err, invite){
			if(err){
				return cb(err);
			}
			
			if(!invite){
				return cb(null, false);
			}
			
			invite.remove();
			return cb(null, true);
		})
	}
	
	Invite = mongoose.model('Invite', Invite);
	
	return Invite;
};