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
  Prefix: 'image/'
}).on('success', function handlePage(response) {
    for(var name in response.data.Contents){
        totalvideo++;
    }
}).send();

//DataBase Setup
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var mysql         = require('mysql');
var server           = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'movi1234',
  database:'movi'
});
server.connect();

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
      if (req.isAuthenticated())
          return res.render('graph.ejs');
      else {
        req.flash('loginMessage', '로그인이 필요한 서비스 입니다.')
        res.render('login.ejs',{message:req.flash('loginMessage')})
      }
    })

    app.get('/calender',function(req,res){
      if (req.isAuthenticated())
          return res.render('calender.ejs');
      else {
        req.flash('loginMessage', '로그인이 필요한 서비스 입니다.')
        res.render('login.ejs',{message:req.flash('loginMessage')})
      }
    })

    app.get('/open-video',function(req,res){
      if (req.isAuthenticated())
          return res.render('open-video.ejs');
      else {
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
      res.send(req.user);
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
      hasher({password:req.body.password}, function(err, pass, salt, hash){
        var user = {
          authId:'local:'+req.body.email,
          username:req.body.username,
          email:req.body.email,
          password:hash,
          salt:salt
        };
        var sql = 'INSERT INTO users (authId,username,email,password,salt) VALUES(:authId,:username,:email,:password,:salt)'
        server.query(sql,user,function(results){
          req.login(user, function(err){
            req.session.save(function(){
              res.redirect('/');
            });
          });
        },function(error){
          console.log(error);
          res.status(500);
        });
      });
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
