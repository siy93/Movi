//movi_app_main.js

//set up =======================================================================

var express          = require('express');
var app              = express();
var session          = require('express-session');
var cookieParser     = require('cookie-parser');
var bodyParser       = require('body-parser');
var passport         = require('passport');
var flash            = require('connect-flash');
var MySQLStore       = require('express-mysql-session')(session);
var mysql            = require('mysql');
var port             = process.env.PORT || 3003;
var server           = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'movi1234',
  database:'movi'
});
server.connect();

//configuration=================================================================


//set up express application
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());

//requried for passport
app.use(session({
  secret: 'mother&father&daughter&son@HAPPYFAMILYbabababa',
  resave: false,
  saveUninitialized: true,
  store:new MySQLStore({
    host:'localhost',
    port:3306,
    user:'root',
    password:'movi1234',
    database:'movi'
  })
}));

//required for passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static('public'));



//required for passport
require('./app/routes.js')(app,passport);

require('./config/passport.js')(passport); // pass passport for configuration


app.listen(port,function(){
    console.log('Server open');
});
