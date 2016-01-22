// ==UserScript==
// @name        CommentMore
// @namespace		tatomyr
// @description	parallel comment on any web page
// @include     http*
// @version     0.1
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

var JMVersion= "0.1";
var cookiesExpires= 3600*24*365;
var resMaxHeight= Math.round( document.documentElement.clientHeight*0.6 )+"px";
var appHead= 37; //px
var collapsed= 1;
var appPanelBackground= getCookie("app_panel_background")? getCookie("app_panel_background"): "248 , 199 , 0 , 1";
var uName= "Anonymous";


//--------------------------------o-n---r-e-a-d-y------------------------------(

(function() {
	commentMore();
})();



function commentMore() {




	setInterval(function() {

		var feedback= document.getElementsByClassName("feedback-panel");
		if (feedback.length===0) {
			setFull();
			ignoreFull();



			if ( !getCookie("do_not_show_images") ) viewMore(); // Chester! DELETE THIS ROW


			scrollToLastComment(); //якщо ми тут, то логічно припустити, що був доданий комент аяксом (або ми не в темі, але тоді спрацює внутрішній захист ф-ції)

		}

	}, 3000);

	setTimeout(function() {
		setAppPanel();
	}, 2000);

	setTimeout(function() { //pp
		getNewCount();
	}, 3000);

	if ( !getCookie("do_not_show_images") ) viewMore(); // Chester! DELETE THIS ROW

	setTimeout(function() {
		setPrivateKey(); //pp
	}, 5000);


}


//--------------------------------o-n---r-e-a-d-y------------------------------)


//-----------------------------------p-a-n-e-l---------------------------------(
function setAppPanel() {

	echo("[APP PANEL]");//dm
	var appPanel= document.createElement('div');
	appPanel.id= "cm-app-panel";
	appPanel.style.width= "300px";
	//appPanel.style.maxHeight= "500px";
	appPanel.style.border= "1px solid #DFDFDF";
	appPanel.style.borderRadius= "10px 10px 0px 0px ";
	appPanel.style.background= str("rgba( ",appPanelBackground," )"); //"lightblue"; 173 , 216 , 230 , 0.8
	appPanel.style.margin= "0px";
	appPanel.style.padding= "10px";
	//appPanel.style.padding= "10px";

	appPanel.style.position= "fixed";
	appPanel.style.zIndex= "1000";
	//appPanel.style.bottom= "-100px";//замінено нижче
	appPanel.style.left= "50px";

	appPanel.innerHTML= str(
		"<div id='cm-app-head' style='text-align:right;' >",
			"<div style='float:left;' ><button id='cm-toggle-button' ></button></div> ",
			"<span id='cm-app-status' > </span> ",
			"<a href='http://comment-more.herokuapp.com/' title='Project site' target=blank style='text-decoration:underline; color:grey; ' >CommentMore v.",
			JMVersion,
			"</a> ",
			"<button id='cm-options-button' title='налаштування' > ≡ </button> ", //≡
			" <span id='cm-version-status' style='color:black;'  ></span>",
		"</div>",
		//comments:

		"<div id='cm-comments-area' style='margin-top:10px; max-height:"+resMaxHeight+"; overflow:auto; ' ></div>", //c
		/* *
		//upload more:
		+"<div><b>Завантажити зображення</b></div>" //um
		+"<div>"
			+"<span style='float:left; overflow:hidden; font-family:inherit; font-size:inherit; line-height:inherit; padding:0px;' ><input style='width:200px; overflow:hidden; font-family:inherit; font-size:smaller; line-height:inherit; padding:0px;' type='file' id='file-to-upload' accept='.txt,image/*' ></span>"
			+" <button id='upload-button' >завантажити</button>"
			//+"<span id='upload-status' ></span>"
		+"</div>" //um
		//+"<div><input id='uploaded-file-link' ></div>" //um
		// */
		//find more:
		//+"<div><b>Your comment</b></div>"
		"<input id='cm-user-comment' placeholder='Your comment' style='width:100%; margin-bottom:10px; ' > ",
		"<button id='cm-post-comment' style='width:100%; ' >Post comment as ",uName,"</button> "
	);

	document.body.appendChild(appPanel);

	$("#cm-toggle-button").click(toggleAppPanel); //^v
	$("#cm-options-button").click(showOptions); //≡
	$("#cm-post-comment").click(postComment); //pc
	//$("#upload-button").click(uploadImg); //um


	echo("panel height",$('#cm-app-panel').css('height'));
	appPanel.style.bottom= str( -parseInt($('#cm-app-panel').css('height')) , "px" ); 

	//appHead= parseInt($('#app-head').css('height')) + parseInt($('#app-panel').css('padding')) ;
	echo("app head", appHead);

	var waterLine= str( appHead-parseInt($('#app-panel').css('height')) , "px" );
	echo("water line",waterLine);


	$("#cm-toggle-button").text("^");
	echo($("#cm-toggle-button").text());
	collapsed= 1;
	$(appPanel).animate({bottom: waterLine}, 500);
	echo("start collapsed");


}


function toggleAppPanel() {
	var waterLine= str( appHead-parseInt($('#cm-app-panel').css('height')) , "px" );
	echo("water line",waterLine);

	if (collapsed) {
		$("#cm-app-panel").animate({bottom: "0px"}, 500);
		$("#cm-toggle-button").text("v");
		collapsed= false;
	} else {
		$("#cm-app-panel").animate({bottom: waterLine}, 500); //!
		$("#cm-toggle-button").text("^");
		collapsed= 1;
	}
}




//-----------------------------------p-a-n-e-l---------------------------------)




//----------------------------p-r-i-v-a-t-e---m-o-r-e--------------------------(





function getComments() {
	echo("[get comments]");//dm

	$("#app-status").text(" ⌛ "); //⌛


	clearAppPanel(); //f

	var msgArea= document.getElementById("private-msg");//$("div#results-area");//$("#private-msg");
	msgArea.innerHTML= "";

	$.ajax({
     url: "http://nobuna.pp.ua/AJAX-get-msg.php",
		 dataType: "json",
		 method: "post",
		 data: {
			 addressee: detectUser(),
			 //author: userName,
			 //msg: msg,
			 key: getCookie("private_more_key")
		 },
     success: function(res) {
	     echo("Success");//dm
			 $("#received-button").text("отримані"); //⌛
			 $("#app-status").text(" "); //⌛

			 for (key in res) {
					var tab= document.createElement('div');
					tab.style.background= "white";
					tab.style.padding= "3px";
					tab.style.marginBottom= "10px";
					var current= res[key];
					if (current.new==1) {
						tab.innerHTML= "<b>"+current.author+"</b>: <br><span style='color:red;' >"+current.msg+"</span> ";
					} else {
						tab.innerHTML= "<span style='color:grey;' ><b>"+current.author+"</b>: <br>"+current.msg+"</span> ";
					}
					//if (res[key]!==detectUser()) {
					//tab.innerHTML= tab.innerHTML+" <button onclick=\"function() { setMsg(\'"+res[key].author+"\'); }\">reply</button>";
					//}
					tab.title= str(current.date_time," GMT");
					//tab.onclick= function() { setMsg(this.title); }
					//tab.style.cursor= "pointer";


					msgArea.appendChild(tab);



					var reply= document.createElement('button');
					reply.title= current.author;
					reply.innerHTML= "відповісти";
					reply.onclick= function() { setMsg(this.title); }
					tab.appendChild(reply);


			 }




     },
     error: function() {
       echo("Error");//dm
			 $("#app-status").text(" помилка: [GP] "); //⌛
     }
	});

}


function postComment(addressee, msg) {
	echo("[post private]");//dm
	$("#app-status").text(" ⌛ "); //⌛

	$.ajax({
     url: "http://nobuna.pp.ua/AJAX-post-msg.php",
		 dataType: "json",
		 method: "post",
		 data: {
			 addressee: addressee,
			 author: detectUser(),
			 msg: msg,
			 key: getCookie("private_more_key")
		 },
     success: function(res) {
				echo("Success");//dm

				//$("#app-status").text("повідомлення надіслано "); //⌛
				$("#app-status").text(" "); //⌛

     },
     error: function() {
			 echo("Error");//dm
			 $("#app-status").text(" помилка: [PP] "); //⌛


			 playSound("http://wav-library.net/effect/windows/xp/windows_xp_-_kriticheskaya_oshibka.mp3");//sm //"http://nobuna.pp.ua/dload/windows_xp_-_kriticheskaya_oshibka.mp3"

     }
	});

}


function setMsg(addressee) {
	var txt= prompt("Приватне повідомлення "+addressee+": ");
	if (txt) {
		postPrivate(addressee, txt);
	} else {
		alert("Забули ввести текст, га?")
	}
}


var mostBanned= [];
function verifyStatus() {
	$("#app-status").text(" ⌛ "); //⌛

	{ //update status
		//nop
		/* */
		echo("[update status]");//dm

		$.ajax({
	     url: "http://nobuna.pp.ua/AJAX-update-status.php",
			 dataType: "json",
			 method: "post",
			 data: {
				 addressee: "__system",
				 author: detectUser(),
				 //msg: msg,
				 //key: getCookie("private_more_key")
				 ignore_set: decodeURI(getCookie("ignore_set")).replace("undefined",""), //.slice(1,-1).replace( /\]\[/g , "," ), //decodeURI(getCookie("ignore_set")).slice(1,-1).split("][")
				 version: JMVersion
			 },
	     success: function(res) {
				 var ignoreRank= res.ignored;


				 /* moved from getNewCount() */
				 if (JMVersion==res.version) {//⌛
					 echo("[version ok]");//dm
					 //$("#version-status").text("");
				 } else {
					 echo("[app version:"+JMVersion+"][latest version:"+res.version+"]");//dm
					 $("#version-status").text("доступна нова версія!");

					 var JMChangelog= res.changelog.replace(/; /g, "\n");//dm
					 echo("changelog", JMChangelog);//dm
					 $("#version-status").attr("title", JMChangelog);//dm
				 }
				 // */



				 var topCount= 3;
				 for (var i=0; i<topCount; i++) {
					 var maxRank= 0;
					 for (var key in ignoreRank) {
						 if ( !isNaN(ignoreRank[key]) && ignoreRank[key]>=maxRank ) {
							 mostBanned[i]= str(key.slice(1,-1)," (",ignoreRank[key],"%) ");
							 var mostBannedKey=key;
							 maxRank= ignoreRank[key];
						 }
					 }
					 ignoreRank[mostBannedKey]= -ignoreRank[mostBannedKey];
				 }

				 echo("Success","most banned:",mostBanned);//dm
				 $("#app-status").text(" "); //⌛
	     },
	     error: function() {
	       echo("Error");//dm
				 $("#app-status").text(" помилка: [US] "); //⌛

	     }
		});
		// */

	}



}


//----------------------------p-r-i-v-a-t-e---m-o-r-e--------------------------)











//-------------------------------f-i-n-d---m-o-r-e-----------------------------(

function searchQuery(appPanel) {

	//$("#app-status").text(" ⌛ "); //⌛

	var search= $("#search-string").val();
	echo("[search: "+search+"]");//dm

	postPrivate("__system", "Пошук: ,,"+search+"\""); //pp

	$("#x-button").remove();
	$("#results-area").remove();
	$("#progress-counter").remove();
	//$("#results-amount").remove();
	clearMsg();//pp



	var progressCounter= document.createElement('span'); //progress%
	progressCounter.id= "progress-counter";
	progressCounter.style.marginLeft= "3px";
	appPanel.appendChild(progressCounter);

	//var resultsAmount= document.createElement('span'); //amount
	//resultsAmount.id= "results-amount";
	//resultsAmount.style.marginLeft= "5px";
	//appPanel.appendChild(resultsAmount);

	var xButton= document.createElement('button'); //<button id='x-button'  >x</button>
	xButton.id= "x-button";
	xButton.style.marginLeft= "3px";
	xButton.innerHTML= "x"; //&nbsp;
	xButton.onclick= function() {
		clearAppPanel(); //$("#search-string").val()
	}
	appPanel.appendChild(xButton);



	var resultsArea= document.createElement('div'); //place to print search results
	resultsArea.id= "results-area";
	resultsArea.style.maxHeight= resMaxHeight; //"400px";
	resultsArea.style.overflow= "auto"; //scroll
	resultsArea.style.marginTop= "10px";
	resultsArea.style.marginBottom= "0px";
	appPanel.appendChild(resultsArea);

	//$("#search-button").hide();//?

	var maxPage= $("#search-depth").val();
	/*var*/ resultsAmount= 0; //без var - глобальна змінна
	for (var p= 1; p<=maxPage; p++) {
		//$("#app-status").text(" ⌛ "); //⌛
		echo( window.location.hostname+"/forum/bunker?page="+p );//dm
		findMore( search , "http://"+window.location.hostname+"/forum/bunker?page="+p , p , resultsArea ); //http://www.footboom.com
		//if (p>=99) $("#search-button").show();//?
	}

}

function clearAppPanel() {
	$("#x-button").remove();
	$("#results-area").remove();
	$("#progress-counter").remove();
	//$("#results-amount").remove();

	$("#search-string").val("");
	//$("#search-string").focus();

}

function findMore(search,url,p,resultsArea) {
	var maxPage= $("#search-depth").val();
	var lastP= 0;


	$.get(url, function(res) {

		var parse= $(res).find( "a.g-smooth_tr" );


		$(parse).each(function(i, anchor) {


			var parentRow= anchor.parentNode.parentNode; //date-author
			//console.log(parentRow); //x

			var txt= $(anchor).text().trim();

			txt= str("",parentRow.childNodes[1].firstChild.innerHTML," | ",txt," | ",parentRow.childNodes[5].innerHTML); //date-author


			if ( txt.toLowerCase().indexOf( search.toLowerCase() )>-1 ) {
				echo(txt); //dm
				//console.log(parentRow);//x
				//console.log(resultsAmount++);
				resultsAmount++;

				var replacePattern= new RegExp(search,"gi");
				txt= txt.replace( replacePattern, "<span style='color:red;' >"+search+"</span>" );

				//console.log( text /*, " : " , anchor.href , " (page "+p+") "*/ );//x

				var tab= document.createElement('div');
				tab.style.background= "white";
				tab.style.padding= "3px";
				tab.style.marginBottom= "10px";
				tab.innerHTML= "<a href='"+anchor.href+"'>"+txt+" <span style='color:grey;' >(стор. "+p+")</span></a>";



				resultsArea.appendChild(tab);

			}
		});

		if (p>lastP) {
			lastP= p;
		}
		//$("#progress-counter").text(resultsAmount+" ("+Math.ceil(lastP/maxPage*100)+"%)");
		$("#progress-counter").text( str(resultsAmount," (",Math.ceil(lastP/maxPage*100),"%)") );

		/*
		return {
			function(parse) {}
		}
		*/

		//$("#app-status").text(" "); //⌛
	});
}


//-------------------------------f-i-n-d---m-o-r-e-----------------------------)



//-----------------------------v-i-e-w---m-o-r-e-------------------------------(

function viewMore() {
	//if ()

	var imgExt= "[.jpg][.jpeg][.png][.gif]";
	//var videoPattern= '[youtube.][youtu.be]'// document.write('<iframe width="420" height="315" src="https://www.youtube.com/v/DgdP5U28jHc" frameborder="0" allowfullscreen></iframe>') // '<iframe width="420" height="315" src="https://www.youtube.com/embed/FIL8PxLmjm4" frameborder="0" allowfullscreen></iframe>';
	var aCollection= $("a");

	$.each(aCollection, function(i, a) {
		if ( a.id==="" && a.className==="" ) { //add image || video
			var link= a.href;
			var probExt= link.substr( link.lastIndexOf(".") ).toLowerCase(); //, (link.lastIndexOf(":")-link.lastIndexOf("."))

			if (probExt.lastIndexOf(":")>-1) probExt= probExt.substr( 0, probExt.lastIndexOf(":") );
			if (probExt.lastIndexOf("/")>-1) probExt= probExt.substr( 0, probExt.lastIndexOf("/") );
			if (probExt.lastIndexOf("?")>-1) probExt= probExt.substr( 0, probExt.lastIndexOf("?") );

			if ( imgExt.indexOf("["+probExt+"]")>-1 ) { //add image
				echo( i , probExt , link, a.innerHTML );//dm
				a.innerHTML= "<img style='max-width:100%; '  src='"+link+"' >";




				a.className= "shown-img"; //no-blink
				$("a.shown-img").hover(function() { $("a.shown-img").css("opacity", 1); }, function() { }); //no-blink







			} else if ( link.indexOf('youtube')>-1 && link.indexOf('?v=')>-1 ) { //add video

				var v= link.substr( link.indexOf('?v=')+3 );


				if (v.indexOf('&')>-1) var v= v.substr( 0 , v.indexOf('&') );//del after &


				echo( i , v , link );//dm

				//$(a).replaceWith('<iframe width="420" height="315" src="https://www.youtube.com/v/'+v+'" frameborder="0" allowfullscreen></iframe>');
				$(a).replaceWith('<iframe width="560" height="315" src="https://www.youtube.com/embed/'+v+'" frameborder="0" allowfullscreen></iframe>');

			} else if ( link.indexOf('youtube')>-1 && link.indexOf('&v=')>-1 ) { //add video "https://m.youtube.com/watch?feature=youtu.be&v=9YWvUJOQf8g"

				var v= link.substr( link.indexOf('&v=')+3 );


				if (v.indexOf('&')>-1) var v= v.substr( 0 , v.indexOf('&') );//del after &


				echo( i , v , link );//dm

				//$(a).replaceWith('<iframe width="420" height="315" src="https://www.youtube.com/v/'+v+'" frameborder="0" allowfullscreen></iframe>');
				$(a).replaceWith('<iframe width="560" height="315" src="https://www.youtube.com/embed/'+v+'" frameborder="0" allowfullscreen></iframe>');

			} else if ( link.indexOf('youtu.be')>-1 ) { //add video


				var v= link.substr( link.indexOf('.be/')+4 );



				var vTime= v.substr( v.indexOf('?t=')+3 );
				if (v.indexOf('?t=')>-1) var v= v.substr( 0, v.indexOf('?t=') );

				if (v.indexOf('&')>-1) var v= v.substr( 0 , v.indexOf('&') );//del after &


				echo( i , v , vTime , link );//dm

				//$(a).replaceWith('<iframe width="420" height="315" src="https://www.youtube.com/v/'+v+'" frameborder="0" allowfullscreen></iframe>');
				$(a).replaceWith('<iframe width="560" height="315" src="https://www.youtube.com/embed/'+v+'" frameborder="0" allowfullscreen></iframe>');
				// ?start=seconds ||  data-start="seconds"
			} else {
				/*
				https://www.youtube.com/watch?v=hULwmKb44Fw)


				*/
			}

		}

	});

}

function scrollToLastComment() {
	var comments= $("li.comment");
	var lastComment= comments[comments.length-1];
	lastComment= $(lastComment).attr("id");
	echo("last comment id",lastComment);//x
	if (lastComment) scrollToElement(lastComment); //if the comment exsists
}



//-----------------------------v-i-e-w---m-o-r-e-------------------------------)

//---------------------------u-p-l-o-a-d---m-o-r-e-----------------------------(

function uploadImg() {
	var fileToUpload= document.getElementById("file-to-upload").files[0];
	if (!fileToUpload) {
		echo("no file");
		//break;//?
	} else {
		console.log(fileToUpload);//x



		echo("[upload image]");//dm
		$("#app-status").text(" ⌛ "); //⌛
		$("#upload-button").text(" ⌛ "); //⌛




		var data = new FormData();
		data.append( "file_to_upload" , fileToUpload );


		$.ajax({
	     url: "http://nobuna.pp.ua/AJAX-upload-img.php",
			 dataType: "json",
			 method: "post",
			 data: data,
			 cache: false, //I don't know (:
			 processData: false, // Не обрабатываем файлы (Don't process the files)
	     contentType: false, // Так jQuery скажет серверу что это строковой запрос
	     success: function(res) {
				 	postPrivate( "__system" , str("Завантаження: ",res.link," (",fileToUpload.size," байт)") );

					echo("UM Success",res.link);//dm



					var shownImg= document.createElement('span');
					shownImg.innerHTML= '<div id="uploaded-img" style="padding: 50px;background: rgba(100,100,100,0.2);position: fixed;top:0;left:0;right:0;bottom:0;text-align: center;z-index: 3000;" ></div>';

					document.body.appendChild(shownImg);

					$("#uploaded-img").html("<img style='max-width:100%;max-height:100%; z-index:3010;'  src='"+res.link+"' >");
					echo(shownImg.innerHTML);

					setTimeout(function() {
						prompt("Зображення завантажено\nСкопіюйте посилання і вставте його в... куди треба\nТакож можете знайти його в Надісланих Повідомленнях", res.link);
						$(shownImg).remove();//?

					},1000);



					$("#app-status").text(" "); //⌛
					//$("#uploaded-file-link").text(res.link); //⌛
					$("#upload-button").text("завантажити"); //⌛



	     },
	     error: function() {
				 echo("UM Error",res.link);//dm
				 $("#app-status").text(" помилка: [UM] "); //⌛
				 //$("#upload-status").text("помилка "); //⌛
				 alert("Не вдалося завантажити зображення");
				 $("#upload-button").text("завантажити"); //⌛

	     }
		});

	}

}

//---------------------------u-p-l-o-a-d---m-o-r-e-----------------------------)


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
	if ( getCookie("dev_mode") ) {

		for (var i= 0, txt= ""; i<arguments.length; i++) {
			var delimiter= (i===arguments.length-1)? "": " | ";
			txt+= arguments[i] + delimiter;
		}
		console.log(txt);

		//console.log(arguments);
	}
}



//--------------------------------m-i-c-r-o-l-i-b------------------------------)
