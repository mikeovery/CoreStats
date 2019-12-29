import document from "document";
import { battery } from "power";

const batArc = document.getElementById("batArc");
const batText = document.getElementById("batText");

export function setLevel() {
  let charge = Math.round(battery.chargeLevel);
  
  let currentDataArc = (charge/100) * 180;
  if (charge > 0)
  {
    batArc.style.fill = "fb-red";
  } 
  if (charge > 10)
  {
    batArc.style.fill = "fb-peach";
  } 
  if (charge > 20)
  {
    batArc.style.fill = "fb-green";
  } 
  batArc.sweepAngle = currentDataArc;
  batText.text = charge + "%";
}