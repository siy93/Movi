var AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
var s3 = new AWS.S3();
var count = 0;
var params = {
  Bucket: 'movistorage',
  Prefix: 'image/'
};

  s3.listObjectsV2(params, setTimeout(function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else  data.KeyCount;
  }



var getUserName = function( callback ) {
    // get the username somehow
    var username = "Foo";
    callback( username );
};

var saveUserInDatabase = function( username ) {
    console.log("User: " + username + " is saved successfully.")
};

getUserName( saveUserInDatabase );
