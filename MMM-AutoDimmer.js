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
	getDateTime: function(text) {
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

	// get default value for a variable if it's not set
    getVar: function(variable, defaultVal) {
        if (typeof variable !== 'undefined') {
             return variable;
        }
        else {
            return defaultVal;
        }
    },
  
	start: function() {
		var self = this;

		self.overlay = null;

		let mySchedules = new Array(0);

		self.initialRun = true; // Only true when MM is first loaded

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
			console.log(self.getDateTime() + ": " + this.name + ": timeToBrighten: " + timeToBrighten);
			console.log(self.getDateTime() + ": " + this.name + ": timeToBrighten.getDate(): " + timeToBrighten.getDate());
			timeToBrighten.setHours(Math.floor(brightTime / 100), Math.floor(brightTime % 100), 0, 0);

			transitionCount = 0; // Counts how many iterations into the transition we are

			// If time already passed, reset for tomorrow
			if(timeToBrighten < new Date()) {
				timeToBrighten.setDate(timeToBrighten.getDate() + 1);
			}
			if(timeToDim < new Date()) {
				timeToDim.setDate(timeToDim.getDate() + 1);
			}

			let schedule = {
				"days": days,
				"dimTime": dimTime,
				"brightTime": brightTime,
				"timeToDim": timeToDim,
				"timeToBrighten": timeToBrighten,
				"transitionCount": transitionCount,
				"maxDim": maxDim,
				"transitionSteps": transitionSteps,
				"transitionDuration": transitionDuration
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

		var dimming = false;

		// Variables for loop
		var startToBrighten;
		var brighten;
		var startToDim;
		var dim;

		// Starts to dim the screen
		function setDim(schedule) {
			console.log(self.getDateTime() + ": " + this.name + ": Dim");
			// Find out which day of the week it is
			const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
			const today = weekday[(new Date()).getDay()];
			
			// Only dim if days includes this day of the week
			if(schedule.days.includes(today)) {
				// How much to change opacity by at each step
				var opacityStep = schedule.maxDim / schedule.transitionSteps;
			  
				// If there is a transition time
				if(schedule.transitionDuration > 0) {
					// If Magic Mirror was loaded during dim time, or if done dimming
					if(self.initialRun || schedule.transitionCount == schedule.transitionSteps - 1) {
						opacity = schedule.maxDim;
						schedule.transitionCount = 0;
						
						if(nextUpdate === 0 || nextUpdate > startToBrighten - now.getTime()) {
							nextUpdate = startToBrighten - now.getTime();
						}
					}
					// Transition from bright to dim
					else {
						schedule.transitionCount = schedule.transitionCount + 1;
						opacity = opacityStep * schedule.transitionCount;
						
						if(nextUpdate === 0 || nextUpdate > (schedule.transitionDuration / schedule.transitionSteps)) {
							nextUpdate = (schedule.transitionDuration / schedule.transitionSteps);
						}
					}
				}
				// Set to fully dim immediately
				else{
					opacity = schedule.maxDim;
					if(nextUpdate === 0 || nextUpdate > startToBrighten - now.getTime()) {
						nextUpdate = startToBrighten - now.getTime();
					}
				}

				dimming = true;
			}
			else {
				console.log(self.getDateTime() + ": " + this.name + ": " + today + " is not in this schedule. Will not dim.");
				finalSchedule = schedule;
				if(nextUpdate === 0 || nextUpdate > startToBrighten - now.getTime()) {
					nextUpdate = startToBrighten - now.getTime();
				}
			}
		}

		// Starts to brighten the screen
		function setBright(schedule) {
			console.log(self.getDateTime() + ": " + this.name + ": Bright");

			// How much to change opacity by at each step
			var opacityStep = schedule.maxDim / schedule.transitionSteps;

			// If there is a transition time
			if(schedule.transitionDuration > 0) {
				// If Magic Mirror was loaded during bright schedule, or if done brightening
				if(self.initialRun || schedule.transitionCount == (schedule.transitionSteps - 1)) {
					opacity = 0;
					schedule.transitionCount = 0;
					
					if(nextUpdate === 0 || nextUpdate > startToDim - now.getTime()) {
						nextUpdate = startToDim - now.getTime();
					}
				}
				// Transition from dim to bright
				else {
					schedule.transitionCount = schedule.transitionCount + 1;
					opacity = schedule.maxDim - (opacityStep * schedule.transitionCount);
					
					if(nextUpdate === 0 || nextUpdate > (schedule.transitionDuration / schedule.transitionSteps)) {
						nextUpdate = (schedule.transitionDuration / schedule.transitionSteps);
					}
				}
			}
			// Set to fully bright immediately
			else {
				opacity = 0;
				
				if(nextUpdate === 0 || nextUpdate > startToDim - now.getTime()) {
					nextUpdate = startToDim - now.getTime();
				}
			}
		}

		var finalSchedule;

		self.mySchedule.forEach((schedule) => {
			
			// If time already passed, reset for tomorrow
			if(schedule.timeToBrighten < new Date()) {
				schedule.timeToBrighten.setDate(schedule.timeToBrighten.getDate() + 1);
			}
			if(schedule.timeToDim < new Date()) {
				schedule.timeToDim.setDate(schedule.timeToDim.getDate() + 1);
			}
			
			// Calculate times
			startToBrighten = schedule.timeToBrighten.getTime();
			brighten = startToBrighten + schedule.transitionDuration;
			startToDim = schedule.timeToDim.getTime();
			dim = startToDim + schedule.transitionDuration;

			// Need to treat these ranges differently based on which value is greater
			if(brighten < dim) {
				// If before start to brighten, or after start to dim
				if ( now.getTime() < startToBrighten || startToDim < now.getTime() ) {
					setDim(schedule);
				}
				else {
					finalSchedule = schedule;
				}
			}
			else if (dim < brighten) {
				// If after start to dim, but before start to brighten
				if(startToDim < now.getTime() && now.getTime() < startToBrighten) {
					setDim(schedule);
				}
				else {
					finalSchedule = schedule;
				}
			}
			// if brighten = dim, it will always be dimmed.
			else {
				setDim(schedule);
			}
		});

		// If not already dimming, it will brighten
		if(!dimming) {
			setBright(finalSchedule);
		}

		console.log(self.getDateTime() + ": " + this.name + ": Opacity: " + opacity);

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

		// Set timer for next update
		setTimeout(function() { self.updateDom(); }, nextUpdate);

		self.initialRun = false;

		return self.overlay;
	},
});
