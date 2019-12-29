import document from "document";
import clock from "clock";
import userActivity from "user-activity";
import { display } from "display";
import { preferences } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import * as battery from "./battery";
import * as heartMonitor from "./hrm";
import * as util from "../common/utils";
import { locale } from "user-settings";
import { me } from "appbit";

// Update the clock every second
clock.granularity = "seconds";

let hourHand = document.getElementById("hours");
let minHand  = document.getElementById("mins");
let hourHandBkg = document.getElementById("hoursBkg");
let minHandBkg  = document.getElementById("minsBkg");
let secHand  = document.getElementById("secs");
let Data     = document.getElementById("Data");
let AOD      = document.getElementById("AOD");
let DialAndNumbers = document.getElementById("DialAndNumbers");
let stepCount = document.getElementById("stepCount");
let dateDataD = document.getElementById("dateDataD");
let dateDataM = document.getElementById("dateDataM");
let digitalTime = document.getElementById("digitalTime");
let days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
let dataTypes = [ "distance", "steps", "elevationGain", "activeMinutes" ];
let dataProgress  = [];
let aodon = false;

// Returns an angle (0-360) for the current hour in the day, including minutes
function hoursToAngle(hours, minutes) {
  let hourAngle = (360 / 12) * hours;
  let minAngle = (360 / 12 / 60) * minutes;
  return hourAngle + minAngle;
}

// Returns an angle (0-360) for minutes
function minutesToAngle(minutes) {
  return (360 / 60) * minutes;
}

// Returns an angle (0-360) for seconds
function secondsToAngle(seconds) {
  return (360 / 60) * seconds;
}

// Rotate the hands every tick
function updateClock() {
  let today = new Date();
  let hours = today.getHours() % 12;
  let mins = today.getMinutes();
  let secs = today.getSeconds();
  
  let hourAng = hoursToAngle(hours, mins);
  let minAng = minutesToAngle(mins);
  hourHand.groupTransform.rotate.angle = hourAng;
  minHand.groupTransform.rotate.angle = minAng;
  hourHandBkg.groupTransform.rotate.angle = hourAng;
  minHandBkg.groupTransform.rotate.angle = minAng;
  secHand.groupTransform.rotate.angle = secondsToAngle(secs);
}

if ( display.aodAvailable) {
  console.log(me.permissions.granted("access_aod"));
  display.aodAllowed = true;
}

let getCurrentDataProgress = function(dataType) {
  let dataContainer = document.getElementById(dataType);
  return {
    dataType: dataType,
    dataContainer: dataContainer,
    arcBack: dataContainer.getElementById("arcBack"),
    arcFront: dataContainer.getElementById("arcFront"),
  }
}

display.addEventListener("change", () => {
  console.log("aodActive: " + display.aodActive);
   if (display.aodActive) {
       console.log ("Always on Enabled")
       Data.style.display = "none";
       DialAndNumbers.style.display = "none";
       AOD.style.display = "inline";
       clock.granularity = 'minutes';
       display.brightnessOverride = "dim";
   } else {
       console.log ("Always on Disabled")
       Data.style.display = "inline";
       DialAndNumbers.style.display = "inline";
       AOD.style.display = "none";
       clock.granularity = "seconds";
       display.brightnessOverride = "normal";
   }
});

for(var i=0; i < dataTypes.length; i++) {
  var currentData = dataTypes[i];
  dataProgress.push(getCurrentDataProgress(currentData));
}

function refreshData(type) {
  let currentType = type.dataType;
  
  let currentDataProg = (userActivity.today.adjusted[currentType] || 0);
  let currentDataGoal = userActivity.goals[currentType];
  if (currentDataGoal == undefined)
  {
    currentDataGoal = 1;
  }
  
  if(currentType==="distance") {
      type.arcFront.style.fill = "green";    
  }
  if(currentType==="steps") {
      type.arcFront.style.fill = "orange";    
  }
  if(currentType==="elevationGain") {
      type.arcFront.style.fill = "red";    
  }
  if(currentType==="activeMinutes") {
      type.arcFront.style.fill = "yellow";    
  }

  type.arcFront.arcWidth = 1;
  let currentDataArc = (currentDataProg / currentDataGoal) * 360;
  if (currentDataArc >= 360) {
      currentDataArc = 360;
      type.arcFront.style.fill = "lightgreen";
      type.arcFront.arcWidth = 2;
  } 
  type.arcFront.sweepAngle = currentDataArc;   
}

function refreshAllData() {
  for(var i=0; i<dataTypes.length; i++) {
    refreshData(dataProgress[i]);
  }
}

display.addEventListener("change", () => {
  console.log("aodActive: " + display.aodActive);
  console.log("aodAllowed: " + display.aodAllowed);
   if (display.aodActive) {
       console.log ("Always on Enabled")
       DialAndNumbers.style.display = "none";
       Data.style.display = "none";
       AOD.style.display = "inline";
       clock.granularity = 'minutes';
       display.brightnessOverride = "dim";
   } else {
       console.log ("Always on Disabled")
       DialAndNumbers.style.display = "inline";
       Data.style.display = "inline";
       clock.granularity = "seconds";
       display.brightnessOverride = "normal";
       AOD.style.display = "none";
   }
});

// Update the clock every tick event
clock.ontick = evt => {
  updateClock();
  battery.setLevel();
  refreshAllData()
  let steps = userActivity.today.adjusted["steps"];
  let stepGoal =  userActivity.goals["steps"];
  stepCount.text = steps;
  if (steps > stepGoal) {
    stepCount.style.fill = "lightgreen";
  } else {
    stepCount.style.fill = "lightblue";    
  }
  let today = evt.date;
  let hours = today.getHours();
  if (hours > 12) { hours = hours -12;}
  if (hours == 0) { hours = 12;}
  let mins  = util.zeroPad(today.getMinutes());
  let day      = today.getDate();
  let dow      = days[today.getDay()];
  dateDataD.text = day;  
  dateDataM.text = dow;  
  digitalTime.text = hours + ":" + mins
  
}

heartMonitor.initialize();
