//variables
var imagesPath = "/images/icons/weather/";//path to the images
var delayBetweenIcons = 0;//stagger the animation of each iccon (in seconds)
var useRollover = false;//have an animation on rollover
var hoverScale = 1.05;//how much does the icon grow on rollover 
var speed = 1;//speed up or slow down the animations (1 being normal speed)
var playOnStart = true;//play animations on page load

//if you want to give your icons links, add them in order in this array. 
var iconLinks = [];
//var iconLinks = ["http://aprendagames.com",,,"http://aprendagames.com"];//In this example, only the first and fourth have a link. 

//--------------------------NO NEED TO EDIT BELOW THIS LING--------------------------//
var tls = [];
var tlsIdle = [];
var tlsActive = [];
var tlsRollover = [];
var iconNames = [];

// icons are loaded from vue.js, when weather has been loaded ok
// window.addEventListener('load', function(){
// 	loadWeatherIcons();
// });

// weather modal icons are loaded on modal shown event
$('#weather-description-modal').on('shown.bs.modal', function (e) {
	loadWeatherIcons();
});

window.loadWeatherIcons = function loadWeatherIcons() {
	//replace each browsericon div
	$(".weathericon:not(.loaded)").each(function(index, elem){
		if ($(elem).is(":visible")) {
			var thisS = Snap(elem);
			//determine which svg to load
			for (var i = 0; i < iconNames.length; i++) {
				if(elem.classList.contains(iconNames[i])){
					var toLoad = iconNames[i];
					Snap.load(imagesPath + toLoad + ".svg", function(f){
						var appended = thisS.append(f);
						determineIcon(index, toLoad, appended, elem);
					});		
				};
			};
		}
	});
}

function makeVisible(appended, vis)
{
	appended.attr({visibility:vis});//this is because stupic safari shows them for exactly 1 frame
}


//determine which icon is being loaded
function determineIcon(index, toLoad, f, elem)
{
	var thisIcon = f.select("#" + toLoad).node;
	//play the icon-specific animation
	window[toLoad](index, f, thisIcon);
	makeVisible(f, "visible");
	$(elem).addClass('loaded');
}

function animationComplete(index, isActive)
{
	
	tlsActive[index] = isActive;
	if(isActive){
		if(tlsIdle[index])
			tlsIdle[index].play();
	}else{
		if(tlsIdle[index])
			tlsIdle[index].pause();
	}
}
