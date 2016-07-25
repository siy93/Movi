var AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
var s3 = new AWS.S3();
var count = 0;
var params = {
  Bucket: 'movistorage',
  Prefix: 'image/'
};
function foo(callback){
  s3.listObjectsV2(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  callback(data.KeyCount);
  });
}
foo(function(KeyCount){
  count = KeyCount;
});
