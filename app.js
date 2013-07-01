var fs = require('fs'),
	express = require('express'),
	app = express(),
	db = require('mongoose'),
	slug = require('slug');
var config = require('./config'),
	appDir = __dirname + '/app/';

app.set('views', appDir + '/views');
app.set('view engine', 'jade');
app.set('site_name', 'YayBBS');
app.use(express.static(__dirname + '/public'));

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: config.server.secret}));
app.use(app.router);

app.locals.pretty = true;
app.locals.slug = function(title){
	return slug(title);
};

var models = require(appDir + 'models')(db);
fs.readdirSync(appDir + 'routes').forEach(function(name){
	if(name.indexOf('.js') == name.length - 3){
		var controller = require(appDir + 'routes/' + name);
		if(controller){
			controller(app, models);
		}
	}
});

app.get('*', function(req, res){
	res.status(404);
	res.render('partials/error', {
		message: 'Page not found'
	});
});

db.connect('mongodb://' + config.db.host + '/' + config.db.name);

app.listen(config.server.port);