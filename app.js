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

//var methodOverride= require("method-override");
//------------------------------------------------------------------------------




app.get('/', function (req, res) { //index
	res.render('index.jade');


	//var uName = url.parse(req.url, true).query.uName || "Anonymous";
	//console.log("start refresh | uName: ", uName);//x
});



app.post('/AJAX/get-auth', function(req,res) { //AJAX get auth
	res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");

	var dateTime= new Date().getTime();

	MongoClient.connect(mongoUrl, function(err,db) {
		if (err) throw err;

		var collection= db.collection('users');

		collection.find({ uName: req.body.CMLogin }).toArray(function(err, results) { //{ lastDateTime: {$gt:req.body.lastDateTime} }
			if(err) throw err;

			db.close();

			if (results.uPassword===req.body.CMPassword) {

				answer= { uName: results.uName };
			} else {
				answer= { uName: undefined };
			}

			res.json( answer );
		});

	});


});


app.post('/AJAX/registration', function(req,res) { //AJAX registration
	//only from original site
	var dateTime= new Date().getTime();

	//...


});




app.post('/AJAX/get-comments', function(req,res) { //AJAX get comment
	res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");

	//var answer= [];
	var lastDateTime= parseInt(req.body.lastDateTime);
	var webPage= req.body.webPage;
	if (webPage.indexOf("?")>-1) webPage= webPage.slice(0,webPage.indexOf("?"));
	if (webPage.indexOf("#")>-1) webPage= webPage.slice(0,webPage.indexOf("#"));
	//webPage= webPage.replace(/\?/,"\\?");
	var regWebPage= new RegExp(webPage, "");

	console.log(webPage, regWebPage, lastDateTime);//x


	MongoClient.connect(mongoUrl, function(err,db) {
		if (err) throw err;



		var collection= db.collection('comments');

		collection.find({ dateTime: {$gt:lastDateTime} , webPage: regWebPage }).toArray(function(err, results) { //{ lastDateTime: {$gt:req.body.lastDateTime} }
			if (err) throw err;

			//console.log(results);//x
			// Let's close the db
			db.close();

			answer= results;
			res.json({ answer });
			//console.log(answer);
		});


	});
	//console.log(answer);

	//res.json({ answer });



});




app.post('/AJAX/post-comment', function(req,res) { //AJAX post comments
	res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");


	var dateTime= new Date().getTime();
	console.log(dateTime,req.body.webPage);//x
	var answer= "---";

	if (req.body.userComment) {

		MongoClient.connect(mongoUrl, function(err,db) {
			if (err) throw err;

			var collection= db.collection('comments');
			collection.insert({
				webPage: req.body.webPage,
				webPageTitle: req.body.webPageTitle,
				author: req.body.author,
				userComment: req.body.userComment,
				dateTime: dateTime
			}, function(err,docs) {
				/*
				collection.find().toArray(function(err, results) {
	        console.dir(results);
	        // Let's close the db
	        db.close();
	      });
				*/
				db.close();
			});

		});

		answer= "ok";
	}




	res.json({ answer });
});





app.set('port', (process.env.PORT || 3000));//
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
