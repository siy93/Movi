//movi_app_main.js

//set up =======================================================================

var express          = require('express');
var app              = express();
var session          = require('express-session');
var cookieParser     = require('cookie-parser');
var bodyParser       = require('body-parser');
var passport         = require('passport');
var flash            = require('connect-flash');
var OrientoStore     = require('connect-oriento')(session);
var OrientDB         = require('orientjs');
var port             = process.env.PORT || 3000;
var server           = OrientDB({
  host:'localhost',
  port:2424,
  username:'root',
  password:'1234'
});

//configuration=================================================================
var db = server.use('song');

//set up express application
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());

//requried for passport
app.use(session({
  secret: 'mother&father&daughter&son@HAPPYFAMILYbabababa',
  resave: false,
  saveUninitialized: true,
  store:new OrientoStore({
    server:"host=localhost&port=2424&username=root&password=1234&db=song"
  })
}));

//required for passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static('public'));



//required for passport
require('./app/routes.js')(app,passport);

require('./config/passport')(passport); // pass passport for configuration


app.listen(port,function(){
    console.log('Server open');
});
