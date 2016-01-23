// ==UserScript==
// @name        CommentMore
// @namespace		tatomyr
// @description	parallel comment on any web page
// @include     http*
// @version     0.6
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==


var CMVersion= "0.6";
var cookiesExp= 3600*24*365; //ms
var resMaxHeight= Math.round( document.documentElement.clientHeight*0.6 )+"px";
var appHead= 37; //px
var collapsed= 1;
var appPanelBackground= getCookie("app_panel_background") || "248 , 199 , 0 , 0.9";
var oldWebPage= location.href;
var lastDateTime= 0;
var postingInProcess= false;
var commentsCount= { "local": 0, "all": 0 };
var hostDomain= "http://localhost:3000"; //
//var hostDomain= "https://comment-more.herokuapp.com"; //



//var CMLogin= "Admin"; //undefined
//var CMPassword= "12345678"; //undefined
var uName= /* getAuth("Admin","12345678") || */ "Anonymous";

//--------------------------------o-n---r-e-a-d-y------------------------------(


(function() {
	if (window.top===window.self)	commentMore(); //захист від запусків у фреймах!
})();



function commentMore() {

	setInterval(function() {
		if (!collapsed) getComments(); //в закритому стані не оновлюємо
	}, 15*1000);

	setTimeout(function() {
		setAppPanel();

		setEnvironmentDisplay();//?
		getComments();//?

	}, 2000);

}


//--------------------------------o-n---r-e-a-d-y------------------------------)


//-----------------------------------p-a-n-e-l---------------------------------(
function setAppPanel() {

	echo("[APP PANEL]");//dm
	var appPanel= document.createElement('div');
	appPanel.id= "cm-app-panel";
	appPanel.style.width= "300px";
	appPanel.style.border= "1px solid #DFDFDF";
	appPanel.style.borderRadius= "10px 10px 0px 0px ";
	appPanel.style.background= str("rgba( ",appPanelBackground," )"); //"lightblue"; 173 , 216 , 230 , 0.8
	appPanel.style.margin= "0px";
	appPanel.style.padding= "10px";

	appPanel.style.position= "fixed";
	appPanel.style.zIndex= "1000";
	appPanel.style.left= "50px";

	appPanel.style.font= "12px Franklin Gothic Medium, Arial , Gabriola, Impact";

	appPanel.innerHTML= str(
		"<div id='cm-app-head' style='text-align:right;' >",
			"<div style='float:left;' >", //left side
				"<button id='cm-toggle-button' class='cm-buttons' ></button>",
				"<button id='cm-toggle-env-comm-button' class='cm-buttons' ></button>",
				"<span id='cm-comments-count'  ></span>",
			"</div> ",

			"<span id='cm-app-status' > </span> ",
			"<a href='http://comment-more.herokuapp.com/' title='Project site' target=blank class='cm-link ' ><b>CommentMore</a></b><sup id='cm-version' >",
			CMVersion,
			" </sup>",
			"<button id='cm-options-button' title='Options' class='cm-buttons' style='' >≡</button>", //≡
			" <span id='cm-version-status' style='color:black;'  ></span>",
			" <span id='cm-notice' style='color:red;'  ></span>",
		"</div>",
		//comments:
		"<div id='cm-enhanced-area' style='display:none; ' >",
			"<div id='cm-comments-area' style='margin-top:10px; margin-bottom:10px; max-height:"+resMaxHeight+"; overflow:auto; ' ></div>", //c
			"<input id='cm-user-comment' placeholder='Your comment' style='width:100%; margin-bottom:0px; ' > ",
			"<button id='cm-post-comment' class='cm-buttons' style='width:100%; ' >Post comment as ",uName,"</button> ",
		"</div>"
	);
	document.body.appendChild(appPanel);

	/**/
	$(".cm-buttons").css({
		"font": "12px Franklin Gothic Medium, Arial , Gabriola, Impact",
		"color": "black",
		"padding": "1px"
	});//
	$("#cm-user-comment").css({
		"font": "12px Franklin Gothic Medium, Arial , Gabriola, Impact",
		"color": "black"
	});
	$(".cm-link").css({
		"font": "12px Franklin Gothic Medium, Arial , Gabriola, Impact",
		"text-decoration": "underline",
		"color": "grey"
	});
	$("#cm-version").css({
		"color": "grey"
	});
	//*/



	echo("panel created");

	$("#cm-toggle-button").click(toggleAppPanel); //^v
	//$("#cm-options-button").click(showOptions); //≡
	$("#cm-post-comment").click(postComment); //pc
	$("#cm-toggle-env-comm-button").click(toggleEnvComments); //☀☂



	echo("panel height",$('#cm-app-panel').css('height'));
	appPanel.style.bottom= str( -parseInt($('#cm-app-panel').css('height')) , "px" );
	//appHead= parseInt($('#app-head').css('height')) + parseInt($('#app-panel').css('padding')) ;
	echo("app head", appHead);
	echo("app panel height",parseInt($('#cm-app-panel').css('height')));
	var waterLine= 0;//str( parseInt(document.documentElement.clientHeight)-appHead , "px" );//str( appHead-parseInt($('#cm-app-panel').css('height')) , "px" );
	echo("water line",waterLine);


	$("#cm-toggle-button").text("▲");
	collapsed= 1;
	$(appPanel).animate({bottom: waterLine}, 500);
	echo("start collapsed");


	/*
	setEnvironmentDisplay();
	echo( "localCommentsOnly", getCookie("cm_localCommentsOnly") );
	if ( getCookie("cm_localCommentsOnly") ) { //☀☂
		$("#cm-toggle-env-comm-button").text("☂"); //☀☂
		$(".cm-external-comments").css({"display":"none"});

	} else {
		$("#cm-toggle-env-comm-button").text("☀"); //☀☂
		$(".cm-external-comments").css({"display":"block"});
	}
	*/

}


function toggleAppPanel() {

	//getComments();


	var waterLine= str( appHead-parseInt($('#cm-app-panel').css('height')) , "px" );
	echo("water line",waterLine);

	if (collapsed) {
		$("div#cm-enhanced-area").css({"display": "block"});
		//$("#cm-app-panel").animate({bottom: "0px"}, 500);
		$("#cm-toggle-button").text("▼");
		collapsed= false;
	} else {
		$("div#cm-enhanced-area").css({"display": "none"});
		//$("#cm-app-panel").animate({bottom: waterLine}, 500); //!
		$("#cm-toggle-button").text("▲");
		collapsed= 1;
	}
}

function toggleEnvComments() { //☀☂
	//echo( "localCommentsOnly", getCookie("cm_localCommentsOnly") );

	if ( getCookie("cm_localCommentsOnly") ) {
		setCookie( "cm_localCommentsOnly", "", { path: "/", expires: -1 } );
		//$(".cm-external-comments").css({"display":"block"});
		//$("#cm-toggle-env-comm-button").text("☀"); //☀☂

	} else {
		setCookie("cm_localCommentsOnly", 1, { path: "/", expires: cookiesExp });
		//echo("cookie ->",getCookie("cm_localCommentsOnly"));

		//$(".cm-external-comments").css({"display":"none"});
		//$("#cm-toggle-env-comm-button").text("☂"); //☀☂
	}
	setEnvironmentDisplay();
}

function setEnvironmentDisplay() {
	echo( "localCommentsOnly", getCookie("cm_localCommentsOnly") );
	if ( getCookie("cm_localCommentsOnly") ) { //☀☂
		$("#cm-toggle-env-comm-button").text("☂"); //☀☂
		$(".cm-external-comments").css({ "display":"none" });
		$("#cm-comments-count").text(commentsCount.local);

	} else {
		$("#cm-toggle-env-comm-button").text("☀"); //☀☂
		$(".cm-external-comments").css({ "display":"block" });
		$("#cm-comments-count").text(commentsCount.all);

	}
}

//-----------------------------------p-a-n-e-l---------------------------------)




//----------------------------c-o-m-m-e-n-t---m-o-r-e--------------------------(

function getAuth(CMLogin,CMPassword) {
	echo("[get auth]");//dm

	$.ajax({
		url: str(hostDomain,"/AJAX/get-auth"), // "https://comment-more.herokuapp.com/AJAX/post-comment", //
		dataType: "json",
		method: "post",
		data: {
			CMLogin: CMLogin,
			CMPassword: CMPassword
		},
		success: function(res) {
			echo("get auth: Success",res.answer);//dm
		},
		error: function() {
			echo("get auth  Error ",res.answer);//dm
			//playSound("http://wav-library.net/effect/windows/xp/windows_xp_-_kriticheskaya_oshibka.mp3");//sm //"http://nobuna.pp.ua/dload/windows_xp_-_kriticheskaya_oshibka.mp3"
		}
	});

	return res.answer.uName;
}



function getComments(scrollToLastComment) {
	while (postingInProcess) {
		echo("posting in process"); //delay ?
	}



	echo("[get comments]");//dm

	$("#cm-app-status").text(" ⌛ "); //⌛



	var commentArea= document.getElementById("cm-comments-area");//$("div#results-area");//$("#private-msg");
	if (location.href!==oldWebPage) { //очистка, якщо змінилася url
		echo(oldWebPage,location.href);

		oldWebPage= location.href;
		commentArea.innerHTML= "";
		lastDateTime= 0;

	}


	$.ajax({
     url: str(hostDomain,"/AJAX/get-comments"), // "https://comment-more.herokuapp.com/AJAX/get-comments", //
		 dataType: "json",
		 method: "post",
		 data: {
			 webPage: location.href,
			 lastDateTime: lastDateTime
		 },
     success: function(res) {
	     echo("Success get",res.answer);//dm

			 console.log(res);//x

			 $("#cm-app-status").text(" "); //⌛

			 for (key in res.answer) { //res.answer?
					var tab= document.createElement('div');
					tab.style.background= "white";
					tab.style.padding= "3px";
					tab.style.marginBottom= "10px";

					var current= res.answer[key];

					var commentStyle= (current.webPage===location.href)? "color:black;": "color:grey;";
					tab.className= (current.webPage===location.href)? "": "cm-external-comments"; //☀☂
					if (current.webPage===location.href) commentsCount.local++;
					commentsCount.all++;


					var dateTimeStr= new Date(current.dateTime); //
					dateTimeStr= str( dateTimeStr.getDate(),".",dateTimeStr.getMonth()+1,".",dateTimeStr.getFullYear(), " " ,dateTimeStr.getHours(),":",dateTimeStr.getMinutes() );
					echo(dateTimeStr);


					tab.innerHTML= str("<span style='",commentStyle,"'  ><b>",current.author,"</b> (",dateTimeStr,"): <br>",current.userComment,"</span> ");
					tab.title= str(current.webPageTitle," | ",current.webPage);
					//$(tsb).css({	"color": "black",	});

					commentArea.appendChild(tab);

					if (current.dateTime>lastDateTime) lastDateTime= current.dateTime;
					echo("last date time",lastDateTime);


					//if (scrollBottom) commentArea.scrollTop = commentArea.scrollHeight;
			 }

			 if (scrollToLastComment) commentArea.scrollTop = commentArea.scrollHeight;
			 setEnvironmentDisplay();//?


     },
     error: function() {
       echo("Error get comment", res.answer);//dm
			 $("#cm-app-status").text(" error "); //⌛
     }
	});

}


function postComment() {
	//if (gettingOrPostingCommentsInProcess) return "in process";
	postingInProcess= 1;

	echo("[post comment]");//dm
	$("#cm-app-status").text(" ⌛ "); //⌛



	var userComment= $("#cm-user-comment").val();
	if (userComment) {
		$("#cm-user-comment").val("");

		$.ajax({
	     url: str(hostDomain,"/AJAX/post-comment"), // "https://comment-more.herokuapp.com/AJAX/post-comment", //
			 dataType: "json",
			 method: "post",
			 data: {
				 "webPage": location.href,
				 "webPageTitle": document.title,
				 "author": uName,
				 "userComment": userComment
			 },
	     success: function(res) {
					echo("post: Success",res.answer);//dm

					$("#cm-app-status").text(" "); //⌛

					/**/
					getComments(1);
					//var commentArea= document.getElementById("cm-comments-area");
					//commentArea.scrollTop = commentArea.scrollHeight;
					//*/

	     },
	     error: function() {
				 echo("Error post",res.answer);//dm
				 $("#cm-app-status").text(" error "); //⌛


				 playSound("http://wav-library.net/effect/windows/xp/windows_xp_-_kriticheskaya_oshibka.mp3");//sm //"http://nobuna.pp.ua/dload/windows_xp_-_kriticheskaya_oshibka.mp3"

	     }
		});
	}

	postingInProcess= false;
}



//----------------------------c-o-m-m-e-n-t---m-o-r-e--------------------------)











//--------------------------------e-x-t-e-r-i-o-r------------------------------(

function playSound(src) {
  var audio = new Audio();
  audio.src = src;
  audio.autoplay = true;
}

function setCookie(name, value, options) {
  options = options || {};
  var expires = options.expires;
  if (typeof expires == "number" && expires) {
    var d = new Date();
    d.setTime(d.getTime() + expires * 1000);
    expires = options.expires = d;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }
  value = encodeURIComponent(value);
  var updatedCookie = name + "=" + value;
  for (var propName in options) {
    updatedCookie += "; " + propName;
    var propValue = options[propName];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }
  document.cookie = updatedCookie;
}

function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function scrollToElement(theElement) {
  if (typeof theElement === "string") theElement = document.getElementById(theElement);
  var selectedPosX = 0;
  var selectedPosY = 0;
  while (theElement != null) {
      selectedPosX += theElement.offsetLeft;
      selectedPosY += theElement.offsetTop;
      theElement = theElement.offsetParent;
  }
  window.scrollTo(0, selectedPosY);
}

// Модуль прокрутки сторінки до елемента по id (http://javascript.ru/forum/dom-window/21283-prokrutka-stranicy-do-id.html)
function scrollToElement(theElement) {
  if (typeof theElement === "string") theElement = document.getElementById(theElement);
  var selectedPosX = 0;
  var selectedPosY = 0;
  while (theElement != null) {
      selectedPosX += theElement.offsetLeft;
      selectedPosY += theElement.offsetTop;
      theElement = theElement.offsetParent;
  }
  window.scrollTo(0, selectedPosY);
}


//--------------------------------e-x-t-e-r-i-o-r------------------------------)

//--------------------------------m-i-c-r-o-l-i-b------------------------------(

/**
* Concatenates a number of arguments into the one resulting string
* with a warranty that the result is certainly should be a string.
* Also, some (or all) arguments can contain a Math operations
* (even without parentheses)
*/
function str() {
	for (var i= 0, txt= ""; i<arguments.length; i++) {
		txt+= arguments[i];
	}
	return txt;
}

/**
* Concatenates a number of arguments into the one resulting string
* and print it to the console if cookie "dev_mode" is true
*/
function echo() { //dm
	//if ( getCookie("dev_mode") )
	{

		for (var i= 0, txt= ""; i<arguments.length; i++) {
			var delimiter= (i===arguments.length-1)? "": " | ";
			txt+= arguments[i] + delimiter;
		}
		console.log(txt);

		//console.log(arguments);
	}
}



//--------------------------------m-i-c-r-o-l-i-b------------------------------)
