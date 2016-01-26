// ==UserScript==
// @name CommentMore
// @namespace comment-more
// @description	comment on any web page
// @include http*
// @version 0.41
// @require http://localhost:3000/jquery/jquery-1.12.0.min.js
// @require http://localhost:3000/jquery-ui-1.11.4.custom/jquery-ui.min.js
// @grant GM_getValue
// @grant GM_setValue
// ==/UserScript==
var CMVersion="0.41";var hostDomain="http://localhost:3000/";var CMLogin="У мене чудова новина!";var CMPassword="12345678";var cookiesExp=3600*24*365;var resMaxHeight=Math.round(document.documentElement.clientHeight*.6)+"px";var collapsed=1;var appPanelBackground=getCookie("app_panel_background")||"145 , 207 , 142 , 0.9";var oldWebPage=location.href;var lastDateTime=0;var ajaxInProcess=false;var commentsCount={local:0,all:0};(function(){if(window.top===window.self)commentMore()})();function commentMore(){setInterval(function(){if(!collapsed)getComments()},15*1e3);setTimeout(function(){setAppPanel();setEnvironmentDisplay();getComments()},2e3)}function applyStyle(){$(".cm-font").css({font:"12px Franklin Gothic Medium, Arial , Gabriola, Impact"});$(".cm-black").css({color:"black"});$(".cm-grey").css({color:"grey"});$(".cm-buttons").css({background:"transparent",padding:"1px"});$(".cm-link").css({"text-decoration":"underline"});$(".cm-comment-tab").css({background:"white",padding:"3px","margin-bottom":"10px"});$("#cm-app-panel").css({width:"300px",border:"1px solid #DFDFDF","border-radius":"10px 10px 0px 0px",background:str("rgba( ",appPanelBackground," )"),margin:"0px",padding:"10px",position:"fixed","z-index":"1000"});$("#cm-comments-area").css({"margin-top":"10px","margin-bottom":"10px","max-height":resMaxHeight,overflow:"auto"});$("#cm-user-comment").css({width:"100%","margin-bottom":"0px"});$("#cm-post-comment").css({width:"100%"})}function setAppPanel(){echo("CommentMore panel starts");var t=document.createElement("div");t.id="cm-app-panel";t.innerHTML=str("<div id='cm-app-head' style='text-align:right;' >","<div style='float:left;' >","<button id='cm-toggle-button' class='cm-buttons cm-font cm-black ' ></button>","<button id='cm-toggle-env-comm-button' class='cm-buttons cm-font cm-black ' >","<span id='cm-toggle-env-comm-ico' class='cm-font cm-black ' ></span>"," ","<span id='cm-comments-count' class='cm-font cm-black ' ></span>","</button>","</div> ","<span id='cm-app-status' class='cm-font cm-black ' > </span> ","<span class='cm-font cm-grey ' ><a href='",hostDomain,"' title='Project site' target=blank class='cm-link cm-font cm-grey ' ><b>CommentMore</a></b><sup id='cm-version' class='cm-grey ' >",CMVersion," </sup></span>","<button id='cm-options-button' title='Options' class='cm-buttons cm-font cm-black ' >≡</button>"," <span id='cm-version-status' class='cm-font cm-black '  ></span>"," <span id='cm-notice' class='cm-font cm-red ' ></span>","</div>","<div id='cm-enhanced-area' style='display:none; ' >","<div id='cm-comments-area' ></div>","<input id='cm-user-comment' placeholder='Your comment' class='cm-font cm-black ' > ","<button id='cm-post-comment' class='cm-buttons cm-font cm-black ' >Post comment as ",CMLogin,"</button> ","</div>");document.body.appendChild(t);applyStyle();$("#cm-toggle-button").click(toggleAppPanel);$("#cm-post-comment").click(postComment);$("#cm-toggle-env-comm-button").click(toggleEnvComments);echo("panel height",$("#cm-app-panel").css("height"));t.style.bottom=str(-parseInt($("#cm-app-panel").css("height")),"px");$("#cm-toggle-button").text("▲");$("#cm-toggle-button").attr({title:"Toggle comments"});collapsed=1;$(t).animate({bottom:0},500);t.style.right=getCookie("cm_app-panel-right")||"50px";echo("cookie right:",getCookie("cm_app-panel-right"));$("#cm-app-panel").draggable({axis:"x",handle:"div#cm-app-head",stop:function(t,e){$("#cm-app-panel").css({top:"auto"});var o=$("#cm-app-panel").css("right");if(o==="auto")o=str(document.body.clientWidth-parseInt($("#cm-app-panel").css("left"))-parseInt($("#cm-app-panel").css("width")),"px");echo(o);setCookie("cm_app-panel-right",o,{path:"/",expires:cookiesExp})}})}function toggleAppPanel(){if(collapsed){$("div#cm-enhanced-area").css({display:"block"});$("#cm-toggle-button").text("▼");collapsed=false}else{$("div#cm-enhanced-area").css({display:"none"});$("#cm-toggle-button").text("▲");collapsed=1}}function toggleEnvComments(){if(getCookie("cm_localCommentsOnly")){setCookie("cm_localCommentsOnly","",{path:"/",expires:-1})}else{setCookie("cm_localCommentsOnly",1,{path:"/",expires:cookiesExp})}setEnvironmentDisplay()}function setEnvironmentDisplay(){echo("localCommentsOnly?",getCookie("cm_localCommentsOnly"));if(getCookie("cm_localCommentsOnly")){$("#cm-toggle-env-comm-ico").text("☂");$("#cm-toggle-env-comm-button").attr({title:"Switch to all comments"});$(".cm-external-comments").css({display:"none"});$("#cm-comments-count").text(commentsCount.local)}else{$("#cm-toggle-env-comm-ico").text("☀");$("#cm-toggle-env-comm-button").attr({title:"Switch to local comments"});$(".cm-external-comments").css({display:"block"});$("#cm-comments-count").text(commentsCount.all)}}function getComments(t){if(ajaxInProcess){echo(">>> ajax in process. get omitted");return undefined}ajaxInProcess=true;echo("[get comments]");$("#cm-app-status").text(" ⌛ ");var e=document.getElementById("cm-comments-area");if(location.href!==oldWebPage){echo(oldWebPage,location.href);oldWebPage=location.href;e.innerHTML="";lastDateTime=0;commentsCount={local:0,all:0}}$.ajax({url:str(hostDomain,"AJAX/get-comments"),dataType:"json",method:"post",data:{webPage:location.href,lastDateTime:lastDateTime},success:function(o){echo("Success get");$("#cm-app-status").text(" ");for(key in o.answer){var n=document.createElement("div");var c=o.answer[key];var a=truncateLeftAll(c.webPage);var s=truncateLeftAll(location.href);n.className=a===s?"cm-comment-tab cm-font cm-black ":"cm-comment-tab cm-font cm-grey cm-external-comments ";if(a===s)commentsCount.local++;commentsCount.all++;var m=new Date(c.dateTime);m=str(m.getDate(),".",m.getMonth()+1,".",m.getFullYear()," ",m.getHours(),":",m.getMinutes());n.innerHTML=str("<b>",c.author,"</b> (",m,"): <br>",c.userComment," ");n.title=str(c.webPageTitle," | ",c.webPage);e.appendChild(n);if(c.dateTime>lastDateTime)lastDateTime=c.dateTime}applyStyle();if(t)e.scrollTop=e.scrollHeight;setEnvironmentDisplay();ajaxInProcess=false},error:function(){echo("Error get comment");$("#cm-app-status").text(" error ");ajaxInProcess=false}})}function postComment(){echo("[post comment]");$("#cm-app-status").text(" ⌛ ");var t=$("#cm-user-comment").val();if(t){$("#cm-user-comment").val("");$.ajax({url:str(hostDomain,"AJAX/post-comment"),dataType:"json",method:"post",data:{webPage:location.href,webPageTitle:document.title,CMLogin:CMLogin,CMPassword:CMPassword,userComment:t},success:function(t){echo("post: Success",t.answer);$("#cm-app-status").text(" ");getComments(1)},error:function(){echo("Error post");$("#cm-app-status").text(" error ");playSound("http://wav-library.net/effect/windows/xp/windows_xp_-_kriticheskaya_oshibka.mp3")}})}}function playSound(t){var e=new Audio;e.src=t;e.autoplay=true}function setCookie(t,e,o){o=o||{};var n=o.expires;if(typeof n=="number"&&n){var c=new Date;c.setTime(c.getTime()+n*1e3);n=o.expires=c}if(n&&n.toUTCString){o.expires=n.toUTCString()}e=encodeURIComponent(e);var a=t+"="+e;for(var s in o){a+="; "+s;var m=o[s];if(m!==true){a+="="+m}}document.cookie=a}function getCookie(t){var e=document.cookie.match(new RegExp("(?:^|; )"+t.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,"\\$1")+"=([^;]*)"));return e?decodeURIComponent(e[1]):undefined}function scrollToElement(t){if(typeof t==="string")t=document.getElementById(t);var e=0;var o=0;while(t!=null){e+=t.offsetLeft;o+=t.offsetTop;t=t.offsetParent}window.scrollTo(0,o)}function scrollToElement(t){if(typeof t==="string")t=document.getElementById(t);var e=0;var o=0;while(t!=null){e+=t.offsetLeft;o+=t.offsetTop;t=t.offsetParent}window.scrollTo(0,o)}function str(){for(var t=0,e="";t<arguments.length;t++){e+=arguments[t]}return e}function echo(){{for(var t=0,e="";t<arguments.length;t++){var o=t===arguments.length-1?"":" | ";e+=arguments[t]+o}console.log(e)}}function leftSlice(t,e){return t.indexOf(e)>-1?t.slice(e.length):t}function truncateLeftAll(t){var e=t;e=leftSlice(e,"http://m.");e=leftSlice(e,"http://www.");e=leftSlice(e,"https://m.");e=leftSlice(e,"https://www.");e=leftSlice(e,"https://");e=leftSlice(e,"http://");return e}