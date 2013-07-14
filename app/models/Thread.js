var mongoose = require('mongoose');
module.exports = function(mongoose){
	var Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;
	var Thread = new Schema({
		user_id: {type: ObjectId},
		subject: {type: String, default: ''},
		created: {type: Date, default: Date.now},
		lastUpdate: {type: Date, default: Date.now},
		category: {type: String, default: 'Discussions'}
	});
	Thread = mongoose.model('Thread', Thread);
	
	return Thread;
};