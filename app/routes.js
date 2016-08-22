//app/routes/js

//AWS Setup
var AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
var s3 = new AWS.S3();
var totalvideo = 0,
    pageSize = 9,
    currentPage = 1,
    images = [],
    imagesArrays= [],
    imagesList = [];
s3.listObjects(
  {Bucket: 'movistorage',
  Prefix: 'video/'
}).on('success', function handlePage(response) {
    for(var name in response.data.Contents){
        totalvideo++;
    }
}).send();

//DataBase Setup
var bkfd2Password = require("pbkdf2-password");
var hasher        = bkfd2Password();
var mysql         = require('mysql');
var _             = require('underscore');
var server        = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'movi1234',
  database:'movi'
});
server.connect();

var find;
var recentday;
var count;

function change(count){
  if(count < 5)return 100;
  else if(count = 6)return 90;
  else if(count = 7)return 80;
  else if(count = 8)return 75;
  else if(count = 9)return 70;
  else if(count = 10)return 63;
  else if(count = 11)return 52;
  else if(count = 12)return 45;
  else if(count = 13)return 35;
  else if(count = 14)return 22;
  else if(count = 15)return 15;
  else if(count = 16)return 7;
  else if(count = 17)return 3;
  else return 0;

}

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/',function(req,res){
      pageCount = parseInt(totalvideo/pageSize) + 1;

      if (typeof req.query.page !== 'undefined') {
          currentPage = +req.query.page;
      }
      for (var i = 1; i < totalvideo; i++) {
          images.push({num:  i});
      }

      while (images.length > 0) {
          imagesArrays.push(images.splice(0, pageSize));
      }

      imagesList = imagesArrays[+currentPage - 1];


      if(req.user && req.user.username) {
        res.render('index.ejs', {
          message: req.user.username ,
          totalvideo :totalvideo,
          pageSize : pageSize,
          images: imagesList,
          pageCount : pageCount,
          currentPage : currentPage
        }); // load the index.ejs file
      }else{
        res.render('index.ejs', {
          message: null ,
          totalvideo :totalvideo,
          pageSize : pageSize,
          images: imagesList,
          pageCount : pageCount,
          currentPage : currentPage
        });
      }
    });

    app.get('/graph',function(req,res){
      var datax = [];
      var datay = [];
      if (req.isAuthenticated()){
        var code = req.user.code;
        var sql = "SELECT count,year(date),month(date),day(date),HOUR(TIMEDIFF(end,start)) FROM videoinfo WHERE code=? order by date DESC;";
        server.query(sql,[code],function(err,results){
          if(err){
            console.log(err);
          }else {
            for(var key in results){
            datax.push(_.values(_.pick(results[key],'day(date)')));
            datay.push(_.values(_.pick(results[key],'HOUR(TIMEDIFF(end,start))')));
          }
          recentday = _.values(_.pick(results[0],'year(date)'))+"년"+_.values(_.pick(results[0],'month(date)'))+"월"+_.values(_.pick(results[0],'day(date)'))+"일";
          count = _.values(_.pick(results[0],'count'))
          return res.render('graph.ejs',{
            message:req.user.username,
            x : datax,
            y : datay,
            recentday : recentday,
            count : change(count)
           });
          }
        });
      }else {
        req.flash('loginMessage', '로그인이 필요한 서비스 입니다.')
        res.render('login.ejs',{message:req.flash('loginMessage')})
      }
    })

    app.get('/calender',function(req,res){
      if (req.isAuthenticated())
          return res.render('calender.ejs',{message:req.user.username});
      else {
        req.flash('loginMessage', '로그인이 필요한 서비스 입니다.')
        res.render('login.ejs',{message:req.flash('loginMessage')})
      }
    })

    app.get('/open-video',function(req,res){
      pageCount = parseInt(totalvideo/pageSize) + 1;

      if (typeof req.query.page !== 'undefined') {
          currentPage = +req.query.page;
      }
      for (var i = 1; i < totalvideo; i++) {
          images.push({num:  i});
      }

      while (images.length > 0) {
          imagesArrays.push(images.splice(0, pageSize));
      }

      imagesList = imagesArrays[+currentPage - 1];


      if(req.isAuthenticated()) {
        var allday = [];
        var code = req.user.code;
        var sql = "SELECT year(date),month(date),day(date) FROM videoinfo WHERE code=? order by date DESC;";
        server.query(sql,[code],function(err,results){
          if(err){
            console.log(err);
          }else {
              for(var key in results){
              allday.push( _.values(_.pick(results[key],'year(date)'))+"년"+_.values(_.pick(results[key],'month(date)'))+"월"+_.values(_.pick(results[key],'day(date)'))+"일");
            }
            if (typeof req.query.recentday !== 'undefined') {
                recentday = req.query.recentday;
            }else{
              recentday = _.values(_.pick(results[0],'year(date)'))+"년"+_.values(_.pick(results[0],'month(date)'))+"월"+_.values(_.pick(results[0],'day(date)'))+"일";
            }
            find = code+"_"+recentday;
            return res.render('open-video.ejs', {
              message: req.user.username ,
              totalvideo :totalvideo,
              pageSize : pageSize,
              images: imagesList,
              pageCount : pageCount,
              currentPage : currentPage,
              find : find,
              recentday : recentday,
              allday : allday
            }); // load the index.ejs file
            }
          });
      }else{
        req.flash('loginMessage', '로그인이 필요한 서비스 입니다.')
        res.render('login.ejs',{message:req.flash('loginMessage')})
      }
    })



    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);
    app.post('/login', passport.authenticate('local-login', {
        failureRedirect : '/login',
        failureFlash : true // allow flash messages
    }),
    function(req,res){
      res.redirect('/login_success');
    });

    app.get('/login_success',isLoggedIn,function(req,res){
      res.redirect('/')
    })

    app.get('/auth/facebook',passport.authenticate('facebook',{scope:'email'}));
    app.get('/auth/facebook/callback',
      passport.authenticate('facebook',
        {
          successRedirect:'/',
          failureRedirect:'/login'
        }
      )
    );

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', function(req, res){
      res.redirect('/')
      /* 회원가입 제한
      hasher({password:req.body.password}, function(err, pass, salt, hash){
        var user = {
          authId:'local:'+req.body.email,
          username:req.body.username,
          email:req.body.email,
          code:req.body.code,
          password:hash,
          salt:salt
        };
        var sql = 'INSERT INTO users SET ?'
        server.query(sql,user,function(results){
          if(err){
            console.log(err);
            res.status(500);
          }else{
            res.redirect('/');
            req.login(user,function(err){
              req.session.save(function(){
                res.redirect('/');
              });
            });
          }
        });
      });
      */
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}
