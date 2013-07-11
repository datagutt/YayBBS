var mongoose = require('mongoose'),
	bcrypt = require('bcrypt');
module.exports = function(mongoose){
	var Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId,
		SALT_WORK_FACTOR = 10;
	var User = new Schema({
		username: {
			type: String,
			required: true,
			index: {unique: true}
		},
		password: {
			type: String,
			required: true
		},
		services: Object,
		invited_by: ObjectId
	});
	User.pre('save', function(next){
		var user = this;
		
		if(!user.isModified('password')){
			return next();
		}
		
		bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
			if(err){
				next(err);
			}
			
			bcrypt.hash(user.password, salt, function(err, hash){
				if(err){
					next(err);
				}
				
				user.password = hash;
				next();
			});
		});
	});
	User.methods.comparePassword = function(password, cb){
		bcrypt.compare(password, this.password, function(err, isMatch){
			if(err){
				return cb(err);
			}
			
			cb(null, isMatch);
		})	
	};
	User = mongoose.model('User', User);
	
	return User;
};