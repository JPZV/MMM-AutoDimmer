// MMM-AutoDimmer.js

Module.register("MMM-AutoDimmer", {
	// Default module config
	defaults: {
		  schedules: [
			  {
				  days: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
				  maxDim: 0.9,
				  transitionDuration: 10 * 60 * 1000,
				  transitionSteps: 20,
				  brightTime: 700,
				  dimTime: 2000
			  }
		  ]
	  },
  
	  // get current date and time for displaying in log
	  getDateTime: function() {
		  var currentdate = new Date();
		  var minute = currentdate.getMinutes();
		  if(minute < 10) {
			  minute = "0" + minute;
		  }
		  var second = currentdate.getSeconds();
		  if(second < 10) {
			  second = "0" + second;
		  }
		  return currentdate.getFullYear() + "/"
						  + (currentdate.getMonth()+1)  + "/"
						  + currentdate.getDate() + " "
						  + currentdate.getHours() + ":"
						  + minute + ":"
						  + second;
	  },
  
	  getStartOfLog : function() {
		  return this.getDateTime() + ": " + this.name + ": ";
	  },
  
	  // get default value for a variable if it's not set
	  getVar: function(variable, defaultVal) {
		  if (typeof variable === 'undefined') {
			  return defaultVal;
		  }
		  else {
			  return variable;
		  }
	  },
  
	  start: function() {
		  var self = this;
  
		  self.overlay = null;
		  self.initialRun = true; // Only true when MM is first loaded
		  let mySchedules = new Array(0);
  
		  self.config.schedules.forEach((configSchedule) => {
  
			  // Set each value to config value, or default if config value is missing
			  var dimTime = self.getVar(configSchedule.dimTime, 2000);
			  var brightTime = self.getVar(configSchedule.brightTime, 700);
			  var maxDim = self.getVar(configSchedule.maxDim, 0.9);
			  var transitionSteps = self.getVar(configSchedule.transitionSteps, 20);
			  var transitionDuration = self.getVar(configSchedule.transitionDuration, 10 * 60 * 1000);
			  var days = self.getVar(configSchedule.days, ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]);
  
			  // Set timeToDim based on value in config file
			  var timeToDim = new Date();
			  timeToDim.setHours(Math.floor(dimTime / 100), Math.floor(dimTime % 100), 0, 0);
  
			  var timeToBrighten = new Date();
			  timeToBrighten.setHours(Math.floor(brightTime / 100), Math.floor(brightTime % 100), 0, 0);
  
			  transitionCount = 0; // Counts how many iterations into the transition we are
			  opacityStep = maxDim / transitionSteps;
  
			  let schedule = {
				  "days": days,
				  "dimTime": dimTime,
				  "brightTime": brightTime,
				  "timeToDim": timeToDim,
				  "timeToBrighten": timeToBrighten,
				  "transitionCount": transitionCount,
				  "maxDim": maxDim,
				  "transitionSteps": transitionSteps,
				  "transitionDuration": transitionDuration,
				  "opacityStep": opacityStep,
				  "mode": "Dormant"
			  }
  
			  mySchedules.push(schedule);
		  });
  
		  self.mySchedule = mySchedules;
	  },
  
	  notificationReceived: function(notification, payload, sender) {
		  // Do nothing
	  },
  
	  socketNotificationReceived: function(notification, payload) {
		  // Do nothing
	  },
  
	  getDom: function() {
		  var self = this;
		  var now = new Date();
		  var nextUpdate = 0;
		  var opacity = 0;
  
		  var activeSchedule = null;
  
		  function setNextDay(schedule) {
			  // If time already passed, reset for tomorrow
			  while(schedule.timeToBrighten < new Date()) {
				  schedule.timeToBrighten.setDate(schedule.timeToBrighten.getDate() + 1);
			  }
			  while(schedule.timeToDim < new Date()) {
				  schedule.timeToDim.setDate(schedule.timeToDim.getDate() + 1);
			  }
		  }
  
		  function findActiveSchedule() {
			  self.mySchedule.forEach((schedule) => {
  
				  if(schedule.mode != "Dormant") {
					  activeSchedule = schedule;
				  }
				  else {
					  setNextDay(schedule);
				  }
			  });
		  }
  
		  function findNextDim() {
			  nextDimTime = -1;
  
			  self.mySchedule.forEach((schedule) => {
				  setNextDay(schedule);
				  var startToDim = schedule.timeToDim.getTime() - schedule.transitionDuration;
  
				  if(startToDim - now.getTime() < nextDimTime || nextDimTime === -1) {
					  nextDimTime = startToDim - (new Date).getTime();
				  }
			  });
  
			  return nextDimTime;
		  }
  
		  // Starts to dim the screen
		  function setDim(schedule) {
			  console.log(self.getStartOfLog() + 'Dim');
  
			  var startToBrighten = schedule.timeToBrighten.getTime() - schedule.transitionDuration;
			  var startToDim = schedule.timeToDim.getTime() - schedule.transitionDuration;
  
			  // If there is a transition time
			  if(schedule.transitionDuration > 0) {
				  // If Magic Mirror was loaded during dim time, or if done dimming
				  if(self.initialRun || schedule.transitionCount == schedule.transitionSteps) {
					  nextUpdate = startToBrighten - now.getTime();
					  schedule.transitionCount = 0;
					  schedule.mode = "Dim";
					  activeSchedule = schedule;
					  opacity = schedule.maxDim;
				  }
				  // Transition from bright to dim
				  else {
					  schedule.transitionCount = schedule.transitionCount + 1;
					  nextUpdate = (schedule.transitionDuration / schedule.transitionSteps);
					  opacity = schedule.opacityStep * schedule.transitionCount;
					  schedule.mode = "Dimming";
					  activeSchedule = schedule;
				  }
			  }
			  // Set to fully dim immediately
			  else{
				  nextUpdate = startToBrighten - now.getTime();
				  schedule.mode = "Dim";
				  activeSchedule = schedule;
				  opacity = schedule.maxDim;
			  }
		  }
  
		  // Starts to brighten the screen
		  function setBright(schedule) {
			  console.log(self.getStartOfLog() + 'Bright');
  
			  if(schedule === null) {
				  opacity = 0;
				  nextUpdate = findNextDim();
			  }
			  // If there is a transition time
			  else if(schedule.transitionDuration > 0) {
				  // If Magic Mirror was loaded during bright time, or if done brightening
				  if(self.initialRun || schedule.transitionCount == schedule.transitionSteps) {
					  opacity = 0;
					  nextUpdate = findNextDim();
					  schedule.transitionCount = 0;
					  schedule.mode = "Dormant";
				  }
				  // Transition from dim to bright
				  else {
					  schedule.transitionCount = schedule.transitionCount + 1;
					  nextUpdate = (schedule.transitionDuration / schedule.transitionSteps);
					  opacity = schedule.maxDim - (schedule.opacityStep * schedule.transitionCount);
					  schedule.mode = "Brightening";
					  activeSchedule = schedule;
				  }
			  }
			  // Set to fully bright immediately
			  else {
				  nextUpdate = findNextDim();
				  opacity = 0;
				  schedule.mode = "Dormant";
			  }
		  }
  
		  findActiveSchedule();
  
		  if(activeSchedule === null) {
			  self.mySchedule.forEach((schedule) => {
				  var startToBrighten = schedule.timeToBrighten.getTime() - schedule.transitionDuration;
				  var brighten = schedule.timeToBrighten.getTime();
				  var startToDim = schedule.timeToDim.getTime() - schedule.transitionDuration;
				  var dim = schedule.timeToDim.getTime();
  
				  // List of days
				  const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
				  const today = weekday[now.getDay()];
  
				  // If schedule is set to run today
				  if(schedule.days.includes(today)) {
					  if(brighten < dim) {
						  if (now.getTime() < startToBrighten || now.getTime() > startToDim) {
							  setDim(schedule);
						  } else {
							  //setBright(schedule);
						  }
					  }
					  else if (dim < brighten) {
						  if(now.getTime() < startToDim || now.getTime() > startToBrighten) {
							  //setBright(schedule);
						  } else {
							  setDim(schedule);
						  }
					  }
					  // if brighten = dim, it will always be dimmed.
					  else {
						  opacity = schedule.maxDim;
						  activeSchedule = schedule;
					  }
				  }
				  // Set to run tomorow
				  else {
					  setNextDay(schedule);
				  }
			  });
  
			  if(activeSchedule === null) {
				  setBright(null);
			  }
		  }
		  else if(activeSchedule.mode === "Dimming") {
			  setDim(activeSchedule);
		  }
		  else if(activeSchedule.mode.startsWith("Bright") || activeSchedule.mode === "Dim") {
			  setBright(activeSchedule);
		  }
  
		  // Set the overlay
		  if (self.overlay === null) {
			  self.overlay = document.createElement("div");
			  self.overlay.style.background = "#000";
			  self.overlay.style.position = "fixed";
			  self.overlay.style.top = "0px";
			  self.overlay.style.left = "0px";
			  self.overlay.style.right = "0px";
			  self.overlay.style.bottom = "0px";
			  self.overlay.style["z-index"] = 9999;
			  self.overlay.style.opacity = opacity;
		  } else if (Math.abs(self.overlay.style.opacity - opacity) > 0.001) {
			  self.overlay.style.transition = `opacity ${nextUpdate}ms linear`;
			  self.overlay.style.opacity = opacity;
		  }
  
		  self.initialRun = false;
		  console.log(self.getStartOfLog() + 'Opacity: ' + opacity);
		  console.log(self.getStartOfLog() + 'nextUpdate: ' + nextUpdate);
  
		  // Set timer for next update
		  setTimeout(function() { self.updateDom(); }, nextUpdate);
  
		  return self.overlay;
	  },
  });