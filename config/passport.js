//config/passport.js

//load all the things we need
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var OrientDB         = require('orientjs');
var server           = OrientDB({
  host:'localhost',
  port:2424,
  username:'root',
  password:'1234'
});
var db = server.use('song');


//expose this function to our app using module.exports
module.exports = function(passport){
   // =========================================================================
   // passport session setup ==================================================
   // =========================================================================
   // required for persistent login sessions
   // passport needs ability to serialize and unserialize users out of session

   //used to serialize the user for the session
   passport.serializeUser(function(user, done) {
     console.log('serializeUser', user);
     done(null, user.authId);
   });

   //used to deserialize the user
   passport.deserializeUser(function(id, done) {
     console.log('deserializeUser', id);
     var sql = "SELECT FROM user WHERE authId=:authId";
     db.query(sql,{params:{authId:id}}).then(function(results){
       if(results.length === 0){
         done('There is no user');
       }else {
         return done(null,results[0]);
       }
     });
   });
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'


    passport.use('local-login',new LocalStrategy({
       // by default, local strategy uses username and password, we will override with email
       usernameField : 'email',
       passwordField : 'password',
       passReqToCallback : true
    },
      function( req, email, password, done){
        var em = email;
        var pwd = password;
        var sql = 'SELECT * FROM user WHERE authId=:authId';
        db.query(sql,{params:{authId:'local:'+em}}).then(function(results){
          if(results.length === 0){
            return done(null,false,req.flash('loginMessage', 'No user found.'));
          }
          var user = results[0];
          return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
            if(hash === user.password){
              console.log('LocalStrategy', user);
              return done(null, user);
            } else {
              done(null, false,req.flash('loginMessage', 'Oops! Wrong password.'));
            }
          });
        })
      }
    ));

    passport.use(new FacebookStrategy({
      clientID: '1615308522131885',
      clientSecret: '592bc0c969607bef6d756c370673506a',
      callbackURL: "/auth/facebook/callback",
      profileFields:['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName']
    },
    function(accessToken,refreshToken,profile,done){
      console.log(profile);
      var authId = 'facebook:'+profile.id;
      var sql = 'SELECT FROM user WHERE authId=:authId';
      db.query(sql,{params:{authId:authId}}).then(function(results){
        if(results.length === 0){
          var user = {
            'authId':authId,
            'username':profile.displayName,
            'email':profile.emails[0].value
          };
          var sql = 'INSERT INTO user (authId,username,email) VALUES(:authId,:username,:email)';
          db.query(sql,{params:user}).then(function(){
            return done(null,user);
          },function(error){
            console.log(error);
            done('Error');
          })
        }else{
          return done(null,results[0]);
        }
      })
    }
  ));



}
