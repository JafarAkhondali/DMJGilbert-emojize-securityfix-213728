var fs = require('fs');
var youtube = require('youtube-dl');
var mkdirp = require('mkdirp');
var rest = require('restler');
var async = require('async');
var iod = require('iod-node')

var client = new iod.IODClient('http://api.idolondemand.com', 'ca566e83-6d86-4c7a-ae83-7e9a38d54e6f')

var CACHE_DIR = './server/cache/';
var YT_PREFIX = 'https://www.youtube.com/watch?v=';

module.exports = function (app) {
	app.get('/example', function (req, res) {
		return res.status(418).json({
			message: "I am a teapot"
		});
	});

	app.get('/api/youtube', function (req, res) {
		var url = req.query.url;
		if (url) {
			if (isCached(url)) {
				fs.readFile(CACHE_DIR + url + "/data.json", 'utf8', function (err, data) {
					async.map(JSON.parse(data), function (d, cb) {
						if (d.int_response == 1) {
							rest.post('http://betafaceapi.com/service_json.svc/GetImageInfo', {
								multipart: true,
								data: {
									"api_key": "d45fd466-51e2-4701-8da8-04351c872236",
									"api_secret": "171e8465-f548-401d-b63b-caf0dc28df5f",
									"img_uid": d.uid
								}
							}).on('complete', function (newData, response) {
								cb(null, newData)
							});
						} else {
							cb(null, d);
						}
					}, function (err, results) {
						fs.writeFile(CACHE_DIR + url + "/data.json", JSON.stringify(results), function (err) {});
						if(err){
							console.log(err);
						}
						res.jsonp(results);
					})
				});
			} else {
				processVideo(url, function (data) {
					res.jsonp(data);
				});
			}
		} else {
			res.jsonp({
				error: 'Unsupported URL'
			});
		}
	});

	app.get('/api/sentiment', function (req, res) {
		var url = req.query.url;
		if (url) {
			if (isCached(url)) {
				if (fs.existsSync(CACHE_DIR + url + "/sentiment.json")) { //CACHE_DIR + ytid + "/sentiment.json"
					fs.readFile(CACHE_DIR + url + "/sentiment.json", 'utf8', function (err, data) {
						res.jsonp(JSON.stringify(data));
					});
				} else {
					var data = {
						'file': CACHE_DIR + url + '/video.mp4'
					};
					console.log(data)
					client.call('recognizespeech', data, function (err, resp, body) {
						rest.post('http://api.idolondemand.com/1/job/result/' + body.data.jobID, {
							multipart: true,
							data: {
								apikey: 'ca566e83-6d86-4c7a-ae83-7e9a38d54e6f'
							}
						}).on('complete', function (magic, response) {
							var text = magic.actions[0].result.document[0].content;
							client.call('analyzesentiment', {
								text: text
							}, function (err, resp, body) {
								fs.writeFile(CACHE_DIR + url + "/sentiment.json", JSON.stringify(body), function (err) {});
								res.jsonp(JSON.parse(data));
							})
						});
					}, true);
				}
			} else {
				res.jsonp({
					error: 'Video not cached'
				});
			}
		} else {
			res.jsonp({
				error: 'Unsupported URL'
			});
		}
	})

	app.get('/api/video', function (req, res) {
		var url = req.query.url;
		if (url) {
			if (isCached(url)) {
				res.sendfile(CACHE_DIR + url + '/video.mp4');
			} else {
				res.jsonp({
					error: 'Video not cached'
				});
			}
		} else {
			res.jsonp({
				error: 'Unsupported URL'
			});
		}
	})
};

function isCached(ytid) {
	try {
		// Query the entry
		stats = fs.lstatSync(CACHE_DIR + ytid);
		return stats.isDirectory();
	} catch (e) {
		return false;
	}
}

function processVideo(ytid, callback) {
	var videoLocation = CACHE_DIR + ytid + '/video.mp4';
	var captureLocation = CACHE_DIR + ytid + '/capture/';
	var captureExpression = captureLocation + '%002d.png';

	mkdirp(captureLocation, function (err) {
		var video = youtube(YT_PREFIX + ytid, ['--format=18'], {
			cwd: __dirname
		});
		video.on('end', function (info) {
			var exec = require('child_process').exec;
			var child = exec('ffmpeg -i ' + videoLocation + ' -r 10 -vcodec png ' + captureExpression, function (error, stdout, stderr) {
				fs.readdir(captureLocation, function (err, files) {
					console.log(files);
					for (var i = 0; i < files.length; i++) {
						files[i] = captureLocation + files[i];
					}
					async.map(files, processImage, function (err, results) {
						console.log(results);
						fs.writeFile(CACHE_DIR + ytid + "/data.json", JSON.stringify(results), function (err) {});
						callback(results);
					});
				});
			});
		});
		video.pipe(fs.createWriteStream(videoLocation));
	});
}

function processImage(name, callback) {
	if (name.indexOf('.png') != -1) {
		fs.readFile(name, function (err, data) {
			var base64data = new Buffer(data).toString('base64');
			rest.post('http://betafaceapi.com/service_json.svc/UploadImage', {
				multipart: true,
				data: {
					"api_key": "d45fd466-51e2-4701-8da8-04351c872236",
					"api_secret": "171e8465-f548-401d-b63b-caf0dc28df5f",
					"detection_flags": "propoints,classifiers,extended",
					"image_base64": base64data
				}
			}).on('complete', function (data, response) {
				setTimeout(function () {
					rest.post('http://betafaceapi.com/service_json.svc/GetImageInfo', {
						multipart: true,
						data: {
							"api_key": "d45fd466-51e2-4701-8da8-04351c872236",
							"api_secret": "171e8465-f548-401d-b63b-caf0dc28df5f",
							"img_uid": data.img_uid
						}
					}).on('complete', function (data, response) {
						callback(null, data)
					});
				}, 6000);
			});
		});
	}
}
