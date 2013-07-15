var fs = require('fs'),
	express = require('express'),
	app = express(),
	db = require('mongoose'),
	slug = require('slug'),
	markdown = require('markdown').markdown,
	sanitize = require('validator').sanitize;
var config = require('./config'),
	appDir = __dirname + '/app/';

app.set('views', appDir + '/views');
app.set('view engine', 'jade');
app.set('site_name', 'Forum');
app.use(express.static(__dirname + '/public'));

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: config.server.secret}));
app.use(express.csrf());
app.use(function(req, res, next){
	app.locals.loggedin = (typeof req.session.user !== 'undefined');
	if(req.session.user){
		app.locals.user = req.session.user;
	}
	next();
});
app.use(function(req, res, next){
	res.locals.token = req.session._csrf;
	next();
});
app.use(app.router);

app.locals.pretty = true;
app.locals.slug = function(title){
	return slug(title);
};
var meify = function(str, user){
	return str.replace(/(^|\<[\w]+\s?\/?\>|[\s])\/me/, '<span class="me">* <a href="/user/' + user + '">'+ user + '</a></span>');
};
app.locals.formatPost = function(str, user){
	// Markdown-ify!
	str = markdown.toHTML(str);
	// Me-ify
	str = meify(str, user);
	// Sanitize to protect from XSS
	str = sanitize(str).xss();
	return str;
};
app.locals.timeago = require('timeago');
app.locals.categories = [];

for(key in config.categories){
	app.locals.categories.push(key);
}

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