var https = require('https');

exports.verify = function(secret) {
	
	return function(req,res,next) {
		var responseString = req.body['gRecaptchaResponse'];

		var options = {
		  hostname: 'www.google.com',
		  port: 443,
		  path: '/recaptcha/api/siteverify?secret='+secret+'&response='+responseString,
		  method: 'GET'
		};

		https.request(options, function(res) {
			var data = '';

			res.on('data', function(d) {
				data += d;
			});

			 res.on('end', function() {
				 var r =  JSON.parse(data);

				if(!r.success)
					 return next({name: 'UnauthorizedError', message: 'Recaptcha verify failed'});

				console.log('Recaptcha verified');
				next();
			 })
		})
		.on('error', function(err) {
			return next(err)
		})
		.end();
	}
	
}

