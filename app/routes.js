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
  host:'127.0.0.1',
  user:'root',
  password:'movi1234',
  database:'gsz'
});
server.connect();

var find;
//var recentday;
var count;
var pose = ['태아형','통나무형','갈구형','군인형','자유낙하형','불가사리형']
var character =['겉으로는 강해보이지만 속마음은 여리고 민감합니다. 처음엔 낯을 가리지만 금방 편안해 합니다.',
'매사에 느긋하고 사교적이지만 그만큼 허술한 구석이 많고 남에게 쉽게 속아 넘어갑니다.',
'의심이 많고 냉소적이며 결정에 시간이 많이 걸리지만 일단 결심하면 추진력이 매우 강합니다.',
'꼼꼼하고 참을성이 많은 성격입니다. 사무처리 능력이 뛰어나며 평소 흐트러진 것을 싫어합니다. 대체로 조용하지만 결단력이 있습니다.',
'활달한 성격이지만 참을성이 부족해 남의 비난에 지나치게 신경질적인 반응을 가끔 보입니다. 독립적이기보다는 강한 것에 의지하고자 하는 마음이 강합니다. 꾸준한 경쟁보다는 단판승부를 좋아하는 성격이라 가끔 대담한 행동으로 주위를 놀라게합니다.',
'낙천적이고 대범한 성격인 경우가 많습니다.사교성이 좋고 다정다감한 성격으로 남의 말을 경청하고 도와주기를 잘해 좋은 친구가 됩니다.싫증을 잘 내고 끈기가 부족한 것이 단점입니다.']


function change(count){
  if(count < 5)return 100;
  else if(count == 6)return 90;
  else if(count == 7)return 80;
  else if(count == 8)return 75;
  else if(count == 9)return 70;
  else if(count == 10)return 63;
  else if(count == 11)return 52;
  else if(count == 12)return 45;
  else if(count == 13)return 35;
  else if(count == 14)return 22;
  else if(count == 15)return 15;
  else if(count == 16)return 7;
  else if(count == 17)return 3;
  else return 0;

}

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/',function(req,res){
      var sql3 =  "select count(*) from skeldata;";
      server.query(sql3,function(err,results){
        if(err){console.log(err);}
        else{
          totalvideo =_.max(_.values(results[0]));
        }
      });
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

      var data = [];
      var username = [];
      var sql = "select * from skeldata order by id desc;";

      server.query(sql,function(err,results){
        if(err){
          console.log(err);
        }else {
          data.push(_.values(_.pick(results[0],'vertex')));
          for(var key in results){
            username.push(_.values(_.pick(results[key],'name')));
          }
        }

        if(req.user && req.user.username) {
          res.render('index.ejs', {
            message: username[0] ,
            other: username,
            totalvideo :totalvideo,
            pageSize : pageSize,
            images: imagesList,
            pageCount : pageCount,
            currentPage : currentPage,
            data : data
          }); // load the index.ejs file
        }else{
          res.render('index.ejs', {
            message: username[0] ,
            other: username,
            totalvideo :totalvideo,
            pageSize : pageSize,
            images: imagesList,
            pageCount : pageCount,
            currentPage : currentPage,
            data : data
          });
        }
      });

    });

    app.get('/graph',function(req,res){
      // var datax = [];
      // var datay = [];
      var best = [];
      //if (req.isAuthenticated()){
        var name;
        if(req.query.page == 'undefined'){
          name = req.user.username;
        }
        else{name = req.query.page; }
        var sql = "SELECT * FROM gsz.sleepdata WHERE name=? ;";
        var date = new Date();
        var pos;
        server.query(sql,[name],function(err,results){
          if(err){

            console.log(err);
          }else {
            best.push(_.max(_.pick(results[0],'sp1')));
            best.push(_.max(_.pick(results[0],'sp2')));
            best.push(_.max(_.pick(results[0],'sp3')));
            best.push(_.max(_.pick(results[0],'sp4')));
            best.push(_.max(_.pick(results[0],'sp5')));
            best.push(_.max(_.pick(results[0],'sp6')));

            for(var i in best){
              if(_.max(best) == best[i]){
                pos = i;
                console.log(pos);
                break;
              }
            }


            /*
            datax.push(_.values(_.pick(results[key],'day(date)')));
            datay.push(_.values(_.pick(results[key],'HOUR(TIMEDIFF(end,start))')));
            }
            */
          //recentday = _.values(_.pick(results[0],'year(date)'))+"년"+_.values(_.pick(results[0],'month(date)'))+"월"+_.values(_.pick(results[0],'day(date)'))+"일";\
          var sleeptime =" "+_.values(_.pick(results[0],'sleeptime'));
          var sleepArray = sleeptime.split(',');
          count = _.values(_.pick(results[0],'maxmove'));
          res.render('graph.ejs',{
            message:name,
            sleeptime : sleepArray[0] +"시간"+ sleepArray[1] + "분" + sleepArray[2] + "초",
            sleephour : sleepArray[0],
            //x : datax,
            //y : datay,
            //recentday : recentday,
            //num : req.user.sleeptime,
            posenum : pos,
            pose : pose[pos],
            char : character[pos],
            date : "" + date.getFullYear() +"년"+ date.getMonth() +"월"+ date.getDate() + "일",
            realcount : count,
            count : change(count)
           });
          }
        });
      //}else {
      //  req.flash('loginMessage', '로그인이 필요한 서비스 입니다.')
      //  res.render('login.ejs',{message:req.flash('loginMessage')})
      //}
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
      //res.redirect('/')
      // 회원가입 제한
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
