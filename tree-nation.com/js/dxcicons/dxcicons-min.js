var imagesPath="/images/icons/weather/",delayBetweenIcons=0,useRollover=!1,hoverScale=1.05,speed=1,playOnStart=!0,iconLinks=[],tls=[],tlsIdle=[],tlsActive=[],tlsRollover=[],iconNames=[];function makeVisible(e,n){e.attr({visibility:n})}function determineIcon(e,n,a,i){var o=a.select("#"+n).node;window[n](e,a,o),makeVisible(a,"visible"),$(i).addClass("loaded")}function animationComplete(e,n){tlsActive[e]=n,n?tlsIdle[e]&&tlsIdle[e].play():tlsIdle[e]&&tlsIdle[e].pause()}$("#weather-description-modal").on("shown.bs.modal",(function(e){loadWeatherIcons()})),window.loadWeatherIcons=function(){$(".weathericon:not(.loaded)").each((function(e,n){if($(n).is(":visible"))for(var a=Snap(n),i=0;i<iconNames.length;i++)if(n.classList.contains(iconNames[i])){var o=iconNames[i];Snap.load(imagesPath+o+".svg",(function(i){var s=a.append(i);determineIcon(e,o,s,n)}))}}))};