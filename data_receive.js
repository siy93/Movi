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
    var name = req.body.name;
    var data = req.body.data;
    var pose = req.body.pose.spilt(',');
    var time = req.body.time;
    var maxsound = req.body.max;
    var sql1 = 'INSERT INTO gsz.skeldata VALUES ('+name+','+data+'+)';
    server.query(sql,function(err,results){
      console.log(data + "is added on database");
    });

    var sql2 = 'INSERT INTO gsz.sleepdata VALUES ('+name+','+pose[1]+','+pose[2]+','+pose[3]+','+pose[4]+','+pose[5]+','+pose[6]+','+time+','+maxsound +','+pose[0]+')';
    server.query(sql,function(err,results){
      console.log(data + "is added on database");
    });
});

app.listen(port,function(){
    console.log('data receving');
});
