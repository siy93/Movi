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
  host:'127.0.0.1',
  user:'root',
  password:'movi1234',
  database:'gsz'
});
server.connect();
app.use(bodyParser.urlencoded({extended:false,limit: '50mb'}));

app.post('/', function(req,res){
    var name = req.body.name;
    var data = req.body.data;
    var mypose = req.body.pose+'';
    var time = req.body.time;
    var maxsound = req.body.max;
    var pose = mypose.split(',');
    var sql1 = "INSERT INTO gsz.skeldata (name,vertex) VALUES ('"+name+"','"+data+"')"
    server.query(sql1,function(err,results){
      if(err)
        console.log(err);
        else{
          console.log("data is added on database");
      }
    });

    var sql2 = "INSERT INTO gsz.sleepdata (name,sp1,sp2,sp3,sp4,sp5,sp6,sleeptime,maxnoise,maxmove) VALUES ('"+name+"','"+pose[1]+"','"+pose[2]+"','"+pose[3]+"','"+pose[4]+"','"+pose[5]+"','"+pose[6]+"','"+time+"','"+maxsound +"','"+pose[0]+"')";
    server.query(sql2,function(err,results){
      if(err)
        console.log(err);
        else{
          console.log("data is added on database");
      }
    });
});

app.listen(port,function(){
    console.log('data receving');
});
