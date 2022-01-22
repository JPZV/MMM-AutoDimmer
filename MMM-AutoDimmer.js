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

  // Default module config
  defaults: {
    maxDim: 0.9,
    transitionDuration: 10 * 60 * 1000,
    transitionSteps: 20,
    brightTime: 700,
    dimTime: 2000
  },

  start: function() {
    var self = this;

    self.overlay = null;

    // Set timeToDim based on value in config file
    self.timeToDim = new Date();
    self.timeToDim.setHours(Math.floor(self.config.dimTime / 100), Math.floor(self.config.dimTime % 100), 0, 0);

    // Set timeToBrighten based on value in config file
    self.timeToBrighten = new Date();
    self.timeToBrighten.setHours(Math.floor(self.config.brightTime / 100), Math.floor(self.config.brightTime % 100), 0, 0);

    self.initialRun = true; // Only true when MM is first loaded
    self.transitionCount = 0; // Counts how many iterations into the transition we are

    // If time already passed, reset for tomorrow
    if(self.timeToBrighten < new Date()) {
      self.timeToBrighten.setDate(self.timeToBrighten.getDate() + 1);
    }
    if(self.timeToDim < new Date()) {
      self.timeToDim.setDate(self.timeToDim.getDate() + 1);
    }
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
    var opacity = self.config.maxDim;
    var startToBrighten = self.timeToBrighten.getTime();
    var brighten = startToBrighten + self.config.transitionDuration;
    var startToDim = self.timeToDim.getTime();
    var dim = startToDim + self.config.transitionDuration;
    var nextUpdate;
    var opacityStep = self.config.maxDim / self.config.transitionSteps;

    // If time already passed, reset for tomorrow
    if(self.timeToBrighten < new Date()) {
      self.timeToBrighten.setDate(self.timeToBrighten.getDate() + 1);
    }
    if(self.timeToDim < new Date()) {
      self.timeToDim.setDate(self.timeToDim.getDate() + 1);
    }

    // Starts to dim the screen
    function setDim() {
        console.log('MMM-AutoDimmer: Dim');
      
        // If there is a transition time
        if(self.config.transitionDuration > 0) {
            // If Magic Mirror was loaded during dim time, or if done dimming
            if(self.initialRun || self.transitionCount == self.config.transitionSteps) {
                nextUpdate = startToBrighten - now.getTime();
                self.transitionCount = 0;
            }
            // Transition from bright to dim
            else {
                self.transitionCount = self.transitionCount + 1;
                nextUpdate = (self.config.transitionDuration / self.config.transitionSteps);
                opacity = opacityStep * self.transitionCount;
            }
        }
        // Set to fully dim immediately
        else{
            nextUpdate = startToBrighten - now.getTime();
        }

        self.initialRun = false;
    }

    // Starts to brighten the screen
    function setBright() {
        console.log('MMM-AutoDimmer: Bright');

        // If there is a transition time
        if(self.config.transitionDuration > 0) {
            // If Magic Mirror was loaded during bright time, or if done brightening
            if(self.initialRun || self.transitionCount == self.config.transitionSteps) {
                opacity = 0;
                nextUpdate = startToDim - now.getTime();
                self.transitionCount = 0;
            }
            // Transition from dim to bright
            else {
                self.transitionCount = self.transitionCount + 1;
                nextUpdate = (self.config.transitionDuration / self.config.transitionSteps);
                opacity = opacity - (opacityStep * self.transitionCount);
            }
        }
        // Set to fully bright immediately
        else {
            nextUpdate = startToDim - now.getTime();
            opacity = 0;
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
			console.log(self.getStartOfLog() + "timeToDim: " + timeToDim);

			var timeToBrighten = new Date();			
			timeToBrighten.setHours(Math.floor(brightTime / 100), Math.floor(brightTime % 100), 0, 0);
			console.log(self.getStartOfLog() + "timeToBrighten: " + timeToBrighten);

			transitionCount = 0; // Counts how many iterations into the transition we are

			// If time already passed, reset for tomorrow
			if(timeToDim < new Date()) {
				timeToDim.setDate(timeToDim.getDate() + 1);
				console.log(self.getStartOfLog() + "new timeToDim: " + timeToDim);
			}
			
			if(timeToBrighten < new Date()) {
				timeToBrighten.setDate(timeToBrighten.getDate() + 1);
				console.log(self.getStartOfLog() + "new timeToBrighten: " + timeToBrighten);
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

        self.initialRun = false;
    }
	  
		// Variables for loop
		var startToBrighten;
		var brighten;
		var startToDim;
		var dim;
		
		/**
		 * Checks to see if the value passed in is lower than the current value, and sets nextUpdate if it is.
		 * If nextUpdate is currenlty 0, then it means it has never been set and should be set to this value.
		 * Returns true if nextUpdate was set, otherwise returns false.
		 */
		function setNextUpdate(value) {
			if(nextUpdate === 0 || nextUpdate > value) {
				nextUpdate = value;
				return true;
			}
			
			return false;
		}

		// Starts to dim the screen
		function setDim(schedule) {
			
			// Find out which day of the week it is
			const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
			const today = weekday[(new Date()).getDay()];
			
			// Only dim if days includes this day of the week
			if(schedule.days.includes(today)) {
				// How much to change opacity by at each step
				var opacityStep = schedule.maxDim / schedule.transitionSteps;
			  
				// If there is a transition time
				if(schedule.transitionDuration > 0) {
					// If Magic Mirror was loaded during dim time, if done dimming, or already at full dim
					if(self.initialRun || schedule.transitionCount == schedule.transitionSteps - 1 || (self.overlay != null && self.overlay.style.opacity === schedule.maxDim)) {
						if(setNextUpdate(startToBrighten - now.getTime())) {
							opacity = schedule.maxDim;
							schedule.transitionCount = 0;
							console.log(self.getStartOfLog() + "Dimming");
						}
					}
					// Transition from bright to dim
					else {
						if(setNextUpdate(schedule.transitionDuration / schedule.transitionSteps)) {
							schedule.transitionCount = schedule.transitionCount + 1;
							opacity = opacityStep * schedule.transitionCount;
							console.log(self.getStartOfLog() + "Dimming");
						}
					}
				}
				// Set to fully dim immediately
				else{
					if(setNextUpdate(startToBrighten - now.getTime())) {
						opacity = schedule.maxDim;
						console.log(self.getStartOfLog() + "Dimming");
					}
				}

				dimming = true;
			}
			else {
				console.log(self.getStartOfLog() + today +  " is not in this schedule. Will not dim.");
			}
		}

		// Starts to brighten the screen
		function setBright(schedule) {

			if(!dimming) {				
				// How much to change opacity by at each step
				var opacityStep = schedule.maxDim / schedule.transitionSteps;

				// If there is a transition time
				if(schedule.transitionDuration > 0) {
					// If Magic Mirror was loaded during bright schedule, if done brightening, or if already at full brightness
					if(self.initialRun || schedule.transitionCount == (schedule.transitionSteps - 1) || (self.overlay != null && self.overlay.style.opacity === 0)) {
						if(setNextUpdate(startToDim - now.getTime())) {
							opacity = 0;
							schedule.transitionCount = 0;
							console.log(self.getStartOfLog() + "Brightening");
						}
					}					
					// Transition from dim to bright
					else {
						if(setNextUpdate(schedule.transitionDuration / schedule.transitionSteps)) {
							schedule.transitionCount = schedule.transitionCount + 1;
							opacity = schedule.maxDim - (opacityStep * schedule.transitionCount);
							console.log(self.getStartOfLog() + "Brightening");
						}
					}
				}
				// Set to fully bright immediately
				else {
					if(setNextUpdate(startToDim - now.getTime())) {
						opacity = 0;
						console.log(self.getStartOfLog() + "Brightening");
					}
				}
			}
			else {
				console.log(self.getStartOfLog() + "Another schedule is currently dimming. Will not brighten.");
			}
		}

		self.mySchedule.forEach((schedule) => {
			
			// If time already passed, reset for tomorrow
			if(schedule.timeToBrighten < new Date()) {
				schedule.timeToBrighten.setDate(schedule.timeToBrighten.getDate() + 1);
				console.log(self.getStartOfLog() + "new schedule.timeToBrighten: " + schedule.timeToBrighten);
			}
			if(schedule.timeToDim < new Date()) {
				schedule.timeToDim.setDate(schedule.timeToDim.getDate() + 1);
				console.log(self.getStartOfLog() + "new schedule.timeToDim: " + schedule.timeToDim);
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
					setBright(schedule);
				}
			}
			else if (dim < brighten) {
				// If after start to dim, but before start to brighten
				if(startToDim < now.getTime() && now.getTime() < startToBrighten) {
					setDim(schedule);
				}
				else {
					setBright(schedule);
				}
			}
			// if brighten = dim, it will always be dimmed.
			else {
				setDim(schedule);
			}
		});

		console.log(self.getStartOfLog() + "Opacity: " + opacity);
		console.log(self.getStartOfLog() + "nextUpdate: " + nextUpdate);

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

    // Need to treat these ranges differently based on which value is greater
    if(brighten < dim) {
        if (now.getTime() < startToBrighten || now.getTime() > dim) {
          setDim();
        } else {
          setBright();
        }
    }
    else if (dim < brighten) {
        if(now.getTime() < startToDim || now.getTime() > brighten) {
          setBright();
        } else {
          setDim();
        }
    }
    // if brighten = dim, do nothing because it will always be dimmed.

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

    return self.overlay;
  },
});
