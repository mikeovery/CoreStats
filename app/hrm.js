import { me } from "appbit";
import document from "document";
import { HeartRateSensor } from "heart-rate";
import { display } from "display";

let hrm, checkInterval;

let heartText = document.getElementById("hrm-data");
let hrmfill   = document.getElementById("hrm-fill");

export function initialize() {
  if (me.permissions.granted("access_heart_rate")) {
    hrm = new HeartRateSensor();
    heartRateSetup();
    startReading();
  } else {
    console.log("Heart Rate Permission was denied.");
    heartText.text = "N/A";
  }
}

function getReading() {
  hrmfill.style.fill = "black";
  heartText.style.fill = "orange";
  if (hrm.heartRate == null) {
    heartText.text = "--";
  }
  else {
      let hrate = Math.round(hrm.heartRate);
      if (hrate > 90) {
        hrmfill.style.fill = "crimson";        
        heartText.style.fill = "white";
      }
    heartText.text = hrm.heartRate;  
  }
}

function heartRateSetup() {
  display.addEventListener("change", function() {
    if (display.on) {
       if (display.aodActive == false) {
        startReading();
       } else {
         stopReading();
       }
       
    } else {
      stopReading();
    }
  });
}

function startReading() {
  if (!checkInterval) {
    hrm.start();
    getReading();
    checkInterval = setInterval(getReading, 1000);
  }
}

function stopReading() {
  hrm.stop();
  clearInterval(checkInterval);
  checkInterval = null;
}