// MMM-AutoDimmer.js

Module.register("MMM-AutoDimmer", {
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

        self.initialRun = false;
    }

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
