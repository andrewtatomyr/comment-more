var express = require('express')
var app = express();

var bodyParser = require('body-parser');
var http= require("http");
var url= require("url");


app.set('view engine', 'jade');

app.use(express.static('public')); //тут усі статичні файли, як-то: favicon, javascripts, style.css etc




app.use(bodyParser.urlencoded({'extended': 'true'})); //без цього не хотіло читати дані POST :) Очевидно!
app.use(bodyParser.json());

var fs= require('fs');


var MongoClient = require('mongodb').MongoClient;
var mongoUrl= "mongodb://CommentMore:12345678@waffle.modulusmongo.net:27017/davAd9yn";
//------------------------------------------------------------------------------




app.get('/', function (req, res) { //index
	res.render('index.jade');


	var uName = url.parse(req.url, true).query.uName || "Anonymous";
	console.log("start refresh | uName: ", uName);//x
});






app.post('/AJAX/post-comment', function(req,res) { //AJAX post comments


	var dateTime= getTime();

	var db= connect(mongoUrl);
	db.comments.insert({
		webPage: req.webPage,
		author: req.author,
		userComment: req.userComment,
		dateTime: dateTime
	});

	res.json({ dateTime });
});




app.post('/AJAX/get-comments', function(req,res) { //AJAX get comment


	res.json({     uName });



});





app.set('port', (process.env.PORT || 3000));//
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
