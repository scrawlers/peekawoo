
/**
 * Module dependencies.
 */

var express = require('express.io')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy
  , redis = require('redis')
  , RedisStore = require('connect-redis')(express)
  , cookieParser = require('connect').utils.parseSignedCookies
  , cookie = require("cookie")
  , config = require('./config.json');

var client = exports.client = redis.createClient();
var sessionStore = new RedisStore({client : client});
var app = express();
app.http().io();
// all environments



app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser("peekawoo"));
	app.use(express.session({ 
		key: "peekawoo",
		store : sessionStore
		}));
	app.use(passport.initialize());
	app.use(passport.session());
	
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(app.router);
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});
	
passport.use(new FacebookStrategy(config.fb,
  function(accessToken, refreshToken, profile, done) {
	profile.photourl = profile.profile_image_url;
    return done(null, profile);
  }
));


app.get("/login",function(req,res){
	res.render('login');
});
app.get('/authfb',
  passport.authenticate('facebook'));

app.get('/authfb/callback',
		passport.authenticate('facebook', { failureRedirect: '/login' }),
		function(req, res) {
			res.redirect('/option');
});
app.get('/option',function(req,res){
	res.render('option',{profile:req.session.passport.user.gender});
});
app.post('/loading',function(req,res){
	req.user.gender = req.body.gender;
	req.user.codename = req.body.codename;
	console.log(req.body.codename);
	res.render('loading',{user: req.user});
});

app.io.set('log level', 1);
app.io.set('authorization', function (handshakeData, callback) {
	if(handshakeData.headers.cookie){
	//	var cookies = cookieParser(cookie.parse(handshakeData.headers.cookie), "instawoo"),
		var cookies = handshakeData.headers.cookie.replace("'","").split(";")[1].split("=");
		sid = cookies[1].replace("s%3A","").split(".")[0];
	//	sid = cookies["instawoo"];

		sessionStore.load(sid, function(err,session){
			if(err || !session){
				return callback("Error retrieving session!",false);
			}
			handshakeData.peekawoo = {
					user : session.passport.user
			};
			return callback(null,true);
		});
	}
	else{
		return callback("No cookie transmitted.!",false);
	}
	
});

app.io.set('store', new express.io.RedisStore({
    redisPub: redis.createClient(),
    redisSub: redis.createClient(),
    redisClient: client
}));

app.io.sockets.on('connection',function(socket){
	console.log("===================");
	console.log(socket.handshake.peekawoo.user);
	console.log("===================");
});

app.io.route('member', function(req) {
	console.log(req.data);
});
function detectPair(){
	
}

app.listen(3000);
