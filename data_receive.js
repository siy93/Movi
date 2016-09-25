//movi_app_main.js

//set up =======================================================================

var express          = require('express');
var app              = express();
var session          = require('express-session');
var bodyParser       = require('body-parser');
var MySQLStore       = require('express-mysql-session')(session);
var mysql            = require('mysql');
var _                = require('underscore');
var port             = process.env.PORT || 3333;
var server           = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'movi1234',
  database:'movi'
});
server.connect();
app.use(bodyParser.urlencoded({extended:false}));

app.post('/', function(req,res){
    var data = _.values(req.body);
    var sql = 'INSERT INTO movi.mytest VALUES (?)';
    server.query(sql,[data],function(err,results){
      console.log(data + "is added on database");
    });
});

app.listen(port,function(){
    console.log('data receving');
});
