var mongoose = require('mongoose');
module.exports = function(mongoose){
	var Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;

	var Comment = new Schema({
		user_id: {type: ObjectId},
		thread_id: {type: ObjectId},
		content: {type: String, default:''},
		created: {type: Date, default: Date.now},
		deleted: {type: Boolean, default: false}
	});
	Comment.index({thread_id: 1, user_id: 1});
	
	Comment = mongoose.model('Comment', Comment);
	
	return Comment;
};