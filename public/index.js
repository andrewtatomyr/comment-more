var hostDomain= window.location.protocol+"//"+window.location.host+"/";
echo(hostDomain);
var cookiesExp= 3600*24*365; //ms

console.log("index.js starts");//x

(function () {
	setTimeout(function() {
		echo(getCookie("CMLogin"));
		//$("#CMLogin").val("Test");//?????????
		$("#CMLogin").val( getCookie("CMLogin") );
		echo(getCookie("CMPassword"));

		$("#CMPassword").val( getCookie("CMPassword")  );
		$("#CMEmail").val( getCookie("CMEmail")  );



		$( "#DnD" ).draggable({});//x

	},1000);



})();




function signUp() {
	console.log("sign up starts");//x

	var CMLogin= $("#CMLogin").val();
	var CMPassword= $("#CMPassword").val();
	var CMEmail= $("#CMEmail").val();



	if (confirm( "Are you sure want to sign up? "+CMLogin+" | "+CMEmail )) {
		$.ajax({
			url: str(hostDomain,"AJAX/sign-up"), // "https://comment-more.herokuapp.com/AJAX/post-comment", //
			dataType: "json",
			method: "post",
			data: {
				CMLogin: CMLogin,
				CMPassword: CMPassword,
				CMEmail: CMEmail
			},
			success: function(res) {
				echo("sign up: Success",res.answer);//dm
				//console.log(res.answer);//x!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

				if (res.answer==="registration succesfull") {
					alert(res.answer);

					getApp();//?

				} else {
					alert("User already exists");
				}


			},
			error: function() {
				echo("sign up:  Error ",res.answer);//dm
				playSound("http://wav-library.net/effect/windows/xp/windows_xp_-_kriticheskaya_oshibka.mp3");//sm //"http://nobuna.pp.ua/dload/windows_xp_-_kriticheskaya_oshibka.mp3"
			}
		});
	}


}

function getApp() {
	console.log("log in starts");//x

	var CMLogin= $("#CMLogin").val();
	var CMPassword= $("#CMPassword").val();
	var CMEmail= $("#CMEmail").val();

	setCookie( "CMLogin" , CMLogin , { path: "/", expires: cookiesExp } );
	setCookie( "CMPassword" , CMPassword , { path: "/", expires: cookiesExp } );
	setCookie( "CMEmail" , CMEmail , { path: "/", expires: cookiesExp } );


	$.ajax({
		url: str(hostDomain,"AJAX/get-app"), // "https://comment-more.herokuapp.com/AJAX/post-comment", //
		dataType: "json",
		method: "post",
		data: {
			hostDomain: hostDomain,
			CMLogin: CMLogin,
			CMPassword: CMPassword,
			CMEmail: CMEmail
		},
		success: function(res) {
			echo("get app: Success",res);//dm

			$("#app-link-shell").html(str("And <a href='",res.userLink,"' >download</a> the CommentMore app v"+res.CMVersion+" "));



		},
		error: function() {
			echo("get app:  Error ");//dm
			//playSound("http://wav-library.net/effect/windows/xp/windows_xp_-_kriticheskaya_oshibka.mp3");//sm //"http://nobuna.pp.ua/dload/windows_xp_-_kriticheskaya_oshibka.mp3"
		}
	});


}

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

//--------------------------------m-i-c-r-o-l-i-b------------------------------)
