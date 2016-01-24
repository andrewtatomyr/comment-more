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


/*
app.post('/AJAX/get-auth', function(req,res) { //AJAX get auth
	res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");

	//var dateTime= new Date().getTime();

	MongoClient.connect(mongoUrl, function(err,db) {
		if (err) throw err;

		var collection= db.collection('users');

		collection.find({ CMLogin: req.body.CMLogin }).toArray(function(err, results) { //{ lastDateTime: {$gt:req.body.lastDateTime} }
			if(err) throw err;

			db.close();

			//console.log(results);//x
			if (results.length) {
				if ( results[0].CMPassword===req.body.CMPassword ) {
					console.log(results[0].CMLogin,"password ok",results[0].CMPassword,req.body.CMPassword);
					var answer= results[0].CMLogin ;
					res.json({ answer });
				} else {
					console.log("password wrong",results[0].CMPassword,req.body.CMPassword);
					var answer= "Anonymous" ;
					res.json({ answer });
				}
			} else {
				//console.log("password wrong",results[0].CMPassword,req.body.CMPassword);
				var answer= "Anonymous" ;
				res.json({ answer });
			}


			//return answer;
		});

	});
	//console.log(req.body.CMLogin,req.body.CMPassword,">>>",getInnerAuth(req.body.CMLogin,req.body.CMPassword));//x
	//res.json( getInnerAuth(req.body.CMLogin,req.body.CMPassword) );


});
*/


app.post('/AJAX/sign-up', function(req,res) { //AJAX sign up
	//only from original site
	var dateTime= new Date().getTime();
	console.log(req.body.CMLogin, " | ", dateTime);//x

	MongoClient.connect(mongoUrl, function(err,db) {
		if (err) throw err;



		var collection= db.collection('users');
		collection.find({ CMLogin: req.body.CMLogin }).toArray(function(err, results) { //{ lastDateTime: {$gt:req.body.lastDateTime} }
			if (err) throw err;
			console.log(results);//x


			if (results.length) {
				db.close();

				var answer= "user already exits";
				res.json({ answer }); //user exits
			} else {
				collection.insert({
					CMLogin: req.body.CMLogin, //email
					CMPassword: req.body.CMPassword,
					CMEmail: req.body.CMEmail,
					dateTime: dateTime
				}, function(err,docs) {
					if (err) throw err;

					db.close();

					var answer= "registration succesfull";
					res.json({ answer }); //ok
				});
			}



			//db.close();

			//answer= results;
			//res.json({ answer });
			//console.log(answer);
		});


	});
});




app.post('/AJAX/get-app', function(req,res) { //AJAX get app
	//original page only
	//var hostDomain= "http://localhost:3000"; //
	//var hostDomain= "https://comment-more.herokuapp.com"; //

	var dateTime= new Date().getTime();
	console.log(dateTime,req.body.CMLogin,req.body.CMPassword);//x
	var answer= "---";

	var fileStamp= fs.readFileSync("public/comment-more.user.js","utf8");
	var CMVersion= fs.readFileSync("public/CMVersion.txt","utf8").trim();

	fileStamp= fileStamp.replace("var CMLogin=undefined;","var CMLogin=\""+req.body.CMLogin+"\";")
	.replace("var CMPassword=undefined;","var CMPassword=\""+req.body.CMPassword+"\";")
	.replace("var hostDomain=\"http://localhost:3000/\";","var hostDomain=\""+req.body.hostDomain+"\";")
	.replace("var CMVersion=\"0.0\";","var CMVersion=\""+CMVersion+"\";");


	fileStamp= "// ==UserScript==\n// @name CommentMore\n// @namespace tatomyr\n// @description	parallel comment on any web page\n// @include http*\n// @version "+CMVersion+"\n// @require http://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js\n// @grant GM_getValue\n// @grant GM_setValue\n// ==/UserScript==\n"
	+fileStamp;




	var userLink= "comment-more.["+req.body.CMLogin+"]["+req.body.CMPassword+"].user.js";
	fs.writeFileSync("public/"+userLink,fileStamp,"utf8");
	console.log("ok - fileStamp | user link: ",userLink);

	res.json({ userLink , CMVersion });


});






function leftSlice(url,str) {
	return (url.indexOf(str)>-1)? url.slice(str.length): url;
}

function truncateLeftAll(url) {
	var webPage= url;
	webPage= leftSlice( webPage , "http://m." );
	webPage= leftSlice( webPage , "http://www." );
	webPage= leftSlice( webPage , "https://m." );
	webPage= leftSlice( webPage , "https://www." );
	return webPage;
}

app.post('/AJAX/get-comments', function(req,res) { //AJAX get comment
	res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");

	//var answer= [];
	var lastDateTime= parseInt(req.body.lastDateTime);
	var webPage= req.body.webPage;
	if (webPage.indexOf("?")>-1) webPage= webPage.slice(0,webPage.indexOf("?"));
	if (webPage.indexOf("#")>-1) webPage= webPage.slice(0,webPage.indexOf("#"));
	//webPage= webPage.replace(/\?/,"\\?");

	webPage= truncateLeftAll(webPage);

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

	//if (req.body.userComment) { ~

		//var author= getInnerAuth(req.body.CMLogin,req.body.CMPassword);//?
		var author= undefined;//?
		MongoClient.connect(mongoUrl, function(err,db) {
			if (err) throw err;

			var collection= db.collection('users');
			collection.find({ CMLogin: req.body.CMLogin }).toArray(function(err, results) { //{ lastDateTime: {$gt:req.body.lastDateTime} }
				if(err) throw err;

				db.close();

				//console.log(results);//x
				if ( results.length ) {
					if ( results[0].CMPassword===req.body.CMPassword ) {
						console.log(results[0].CMLogin,"password ok",results[0].CMPassword,req.body.CMPassword);
						author= results[0].CMLogin ;
						//res.json({ answer });
					} else {
						console.log("password wrong",results[0].CMPassword,req.body.CMPassword);
						author= "Anonymous" ;
						//res.json({ answer });
					}
				} else {
					//console.log("password wrong",results[0].CMPassword,req.body.CMPassword);
					author= "Anonymous" ;
				}


				//return answer;



				//-----------------------------------



				MongoClient.connect(mongoUrl, function(err,db) {
					if (err) throw err;
					console.log("author #0 >",author);//x

					var collection= db.collection('comments');
					collection.insert({
						webPage: req.body.webPage,
						webPageTitle: req.body.webPageTitle,
						author: author,
						userComment: req.body.userComment,
						dateTime: dateTime
					}, function(err,docs) {
						if (err) throw err;
						/*
						collection.find().toArray(function(err, results) {
			        console.dir(results);
			        // Let's close the db
			        db.close();
			      });
						*/
						db.close();

						res.json({ answer: "ok" });

					});

				});

				//----------------------------------------





			});

		});

		//console.log("author #1 >",author);//x
		/*
		MongoClient.connect(mongoUrl, function(err,db) {
			if (err) throw err;
			console.log("author #2 >",author);//x

			var collection= db.collection('comments');
			collection.insert({
				webPage: req.body.webPage,
				webPageTitle: req.body.webPageTitle,
				author: author,
				userComment: req.body.userComment,
				dateTime: dateTime
			}, function(err,docs) {
				if (err) throw err;
				/*
				collection.find().toArray(function(err, results) {
	        console.dir(results);
	        // Let's close the db
	        db.close();
	      });
				*
				db.close();

			});

		});
		*/
		//answer= "ok";
	//} ~




	//res.json({ answer });
});





app.set('port', (process.env.PORT || 3000));//
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
