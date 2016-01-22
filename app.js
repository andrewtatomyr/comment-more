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
//------------------------------------------------------------------------------




app.get('/', function (req, res) { //index
	res.render('index.jade');


	var uName = url.parse(req.url, true).query.uName || "Anonymous";
	console.log("start refresh | uName: ", uName);//x
});






app.get('/api', function(req,res) { //AJAX get comments
	var uName = url.parse(req.url, true).query.uName || "Anonymous";
	console.log("start refresh | uName: ", uName);//x



	res.json({ uName });//?
});




app.post('/api', function(req,res) { //AJAX post comment
	var uName = url.parse(req.url, true).query.uName || "Anonymous";
	console.log("start refresh | uName: ", uName);//x




	res.json({     uName });



});





app.set('port', (process.env.PORT || 3000));//
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
