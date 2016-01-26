// ==UserScript==
// @name CommentMore
// @namespace comment-more
// @description	comment on any web page
// @include http*
// @version 0.38
// @require http://localhost:3000/jquery/jquery-1.12.0.min.js
// @require http://localhost:3000/jquery-ui-1.11.4.custom/jquery-ui.min.js
// @grant GM_getValue
// @grant GM_setValue
// ==/UserScript==
var CMVersion="0.38";var hostDomain="http://localhost:3000/";var CMLogin="У мене чудова новина!";var CMPassword="12345678";var cookiesExp=3600*24*365;var resMaxHeight=Math.round(document.documentElement.clientHeight*.6)+"px";var collapsed=1;var appPanelBackground=getCookie("app_panel_background")||"145 , 207 , 142 , 0.9";var oldWebPage=location.href;var lastDateTime=0;var ajaxInProcess=false;var commentsCount={local:0,all:0};(function(){if(window.top===window.self)commentMore()})();function commentMore(){setInterval(function(){if(!collapsed)getComments()},15*1e3);setTimeout(function(){setAppPanel();setEnvironmentDisplay();getComments()},2e3)}function setAppPanel(){echo("[APP PANEL]");var e=document.createElement("div");e.id="cm-app-panel";e.style.width="300px";e.style.border="1px solid #DFDFDF";e.style.borderRadius="10px 10px 0px 0px ";e.style.background=str("rgba( ",appPanelBackground," )");e.style.margin="0px";e.style.padding="10px";e.style.position="fixed";e.style.zIndex="1000";e.style.right=getCookie("cm_app-panel-right")||"50px";echo("cookie right:",getCookie("cm_app-panel-right"));e.style.font="12px Franklin Gothic Medium, Arial , Gabriola, Impact";e.innerHTML=str("<div id='cm-app-head' style='text-align:right;' >","<div style='float:left;' >","<button id='cm-toggle-button' class='cm-buttons' ></button>","<button id='cm-toggle-env-comm-button' class='cm-buttons' ></button>","<span id='cm-comments-count'  ></span>","</div> ","<span id='cm-app-status' > </span> ","<a href='",hostDomain,"' title='Project site' target=blank class='cm-link ' ><b>CommentMore</a></b><sup id='cm-version' >",CMVersion," </sup>","<button id='cm-options-button' title='Options' class='cm-buttons' style='' >≡</button>"," <span id='cm-version-status' style='color:black;'  ></span>"," <span id='cm-notice' style='color:red;'  ></span>","</div>","<div id='cm-enhanced-area' style='display:none; ' >","<div id='cm-comments-area' style='margin-top:10px; margin-bottom:10px; max-height:"+resMaxHeight+"; overflow:auto; ' ></div>","<input id='cm-user-comment' placeholder='Your comment' style='width:100%; margin-bottom:0px; ' > ","<button id='cm-post-comment' class='cm-buttons' style='width:100%; ' >Post comment as ",CMLogin,"</button> ","</div>");document.body.appendChild(e);$(".cm-buttons").css({font:"12px Franklin Gothic Medium, Arial , Gabriola, Impact",color:"black",padding:"1px"});$("#cm-user-comment").css({font:"12px Franklin Gothic Medium, Arial , Gabriola, Impact",color:"black"});$(".cm-link").css({font:"12px Franklin Gothic Medium, Arial , Gabriola, Impact","text-decoration":"underline",color:"grey"});$("#cm-version").css({color:"grey"});echo("panel created");$("#cm-toggle-button").click(toggleAppPanel);$("#cm-post-comment").click(postComment);$("#cm-toggle-env-comm-button").click(toggleEnvComments);echo("panel height",$("#cm-app-panel").css("height"));e.style.bottom=str(-parseInt($("#cm-app-panel").css("height")),"px");$("#cm-toggle-button").text("▲");$("#cm-toggle-button").attr({title:"Toggle comments"});collapsed=1;$(e).animate({bottom:0},500);echo("start collapsed");$("#cm-app-panel").draggable({axis:"x",handle:"div#cm-app-head",stop:function(e,t){$("#cm-app-panel").css({top:"auto"});var o=$("#cm-app-panel").css("right");if(o==="auto")o=str(document.body.clientWidth-parseInt($("#cm-app-panel").css("left"))-parseInt($("#cm-app-panel").css("width")),"px");echo(o);setCookie("cm_app-panel-right",o,{path:"/",expires:cookiesExp})}})}function toggleAppPanel(){if(collapsed){$("div#cm-enhanced-area").css({display:"block"});$("#cm-toggle-button").text("▼");collapsed=false}else{$("div#cm-enhanced-area").css({display:"none"});$("#cm-toggle-button").text("▲");collapsed=1}}function toggleEnvComments(){if(getCookie("cm_localCommentsOnly")){setCookie("cm_localCommentsOnly","",{path:"/",expires:-1})}else{setCookie("cm_localCommentsOnly",1,{path:"/",expires:cookiesExp})}setEnvironmentDisplay()}function setEnvironmentDisplay(){echo("localCommentsOnly",getCookie("cm_localCommentsOnly"));if(getCookie("cm_localCommentsOnly")){$("#cm-toggle-env-comm-button").text("☂");$("#cm-toggle-env-comm-button").attr({title:"Switch to all comments"});$(".cm-external-comments").css({display:"none"});$("#cm-comments-count").text(commentsCount.local)}else{$("#cm-toggle-env-comm-button").text("☀");$("#cm-toggle-env-comm-button").attr({title:"Switch to local comments"});$(".cm-external-comments").css({display:"block"});$("#cm-comments-count").text(commentsCount.all)}}function getComments(e){if(ajaxInProcess){echo(">>> ajax in process. get omitted");return undefined}ajaxInProcess=true;echo("[get comments]");$("#cm-app-status").text(" ⌛ ");var t=document.getElementById("cm-comments-area");if(location.href!==oldWebPage){echo(oldWebPage,location.href);oldWebPage=location.href;t.innerHTML="";lastDateTime=0;commentsCount={local:0,all:0}}$.ajax({url:str(hostDomain,"AJAX/get-comments"),dataType:"json",method:"post",data:{webPage:location.href,lastDateTime:lastDateTime},success:function(o){echo("Success get",o.answer);console.log(o);$("#cm-app-status").text(" ");for(key in o.answer){var n=document.createElement("div");n.style.background="white";n.style.padding="3px";n.style.marginBottom="10px";var a=o.answer[key];var s=truncateLeftAll(a.webPage);var c=truncateLeftAll(location.href);var l=s===c?"color:black;":"color:grey;";n.className=s===c?"":"cm-external-comments";if(s===c)commentsCount.local++;commentsCount.all++;var i=new Date(a.dateTime);i=str(i.getDate(),".",i.getMonth()+1,".",i.getFullYear()," ",i.getHours(),":",i.getMinutes());echo(i);n.innerHTML=str("<span style='",l,"'  ><b>",a.author,"</b> (",i,"): <br>",a.userComment,"</span> ");n.title=str(a.webPageTitle," | ",a.webPage);t.appendChild(n);if(a.dateTime>lastDateTime)lastDateTime=a.dateTime;echo("last date time",lastDateTime)}if(e)t.scrollTop=t.scrollHeight;setEnvironmentDisplay();ajaxInProcess=false},error:function(){echo("Error get comment");$("#cm-app-status").text(" error ");ajaxInProcess=false}})}function postComment(){echo("[post comment]");$("#cm-app-status").text(" ⌛ ");var e=$("#cm-user-comment").val();if(e){$("#cm-user-comment").val("");$.ajax({url:str(hostDomain,"AJAX/post-comment"),dataType:"json",method:"post",data:{webPage:location.href,webPageTitle:document.title,CMLogin:CMLogin,CMPassword:CMPassword,userComment:e},success:function(e){echo("post: Success",e.answer);$("#cm-app-status").text(" ");getComments(1)},error:function(){echo("Error post",res.answer);$("#cm-app-status").text(" error ");playSound("http://wav-library.net/effect/windows/xp/windows_xp_-_kriticheskaya_oshibka.mp3")}})}}function playSound(e){var t=new Audio;t.src=e;t.autoplay=true}function setCookie(e,t,o){o=o||{};var n=o.expires;if(typeof n=="number"&&n){var a=new Date;a.setTime(a.getTime()+n*1e3);n=o.expires=a}if(n&&n.toUTCString){o.expires=n.toUTCString()}t=encodeURIComponent(t);var s=e+"="+t;for(var c in o){s+="; "+c;var l=o[c];if(l!==true){s+="="+l}}document.cookie=s}function getCookie(e){var t=document.cookie.match(new RegExp("(?:^|; )"+e.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,"\\$1")+"=([^;]*)"));return t?decodeURIComponent(t[1]):undefined}function scrollToElement(e){if(typeof e==="string")e=document.getElementById(e);var t=0;var o=0;while(e!=null){t+=e.offsetLeft;o+=e.offsetTop;e=e.offsetParent}window.scrollTo(0,o)}function scrollToElement(e){if(typeof e==="string")e=document.getElementById(e);var t=0;var o=0;while(e!=null){t+=e.offsetLeft;o+=e.offsetTop;e=e.offsetParent}window.scrollTo(0,o)}function str(){for(var e=0,t="";e<arguments.length;e++){t+=arguments[e]}return t}function echo(){{for(var e=0,t="";e<arguments.length;e++){var o=e===arguments.length-1?"":" | ";t+=arguments[e]+o}console.log(t)}}function leftSlice(e,t){return e.indexOf(t)>-1?e.slice(t.length):e}function truncateLeftAll(e){var t=e;t=leftSlice(t,"http://m.");t=leftSlice(t,"http://www.");t=leftSlice(t,"https://m.");t=leftSlice(t,"https://www.");t=leftSlice(t,"https://");t=leftSlice(t,"http://");return t}