const NodeHelper = require("node_helper");
const Log = require("logger");
const { exec } = require("child_process");

const PWRBTNGPIO = 6;
const ONLEDGPIO = 3;

module.exports = NodeHelper.create({
  // Override start method.
  start: function () {
    Log.log("Starting node helper for: " + this.name);
    this.isHelperActive = true;
  },

  stop: function () {
    this.isHelperActive = false;
  },

  togglingPower: false,

  // Override socketNotificationReceived method.
  socketNotificationReceived: function (notification, payload) {
    switch (notification)
    {
      case "POWER_INIT":
        this.initGPIOs();
        break;
      case "TOGGLE_POWER":
        this.togglePower();
        break;
      case "ASK_POWER":
        this.checkPower();
        break;
    }
  },

  initGPIOs: function()
  {
    const _this = this;
    exec(`echo ${PWRBTNGPIO} > /sys/class/gpio/export`, _this.stdLog);
    exec(`echo "out" > /sys/class/gpio/gpio${PWRBTNGPIO}/direction`, _this.stdLog);
    exec(`echo "1" > /sys/class/gpio/gpio${PWRBTNGPIO}/value`, _this.stdLog);
    exec(`echo ${ONLEDGPIO} > /sys/class/gpio/export`, _this.stdLog);
    exec(`echo "in" > /sys/class/gpio/gpio${ONLEDGPIO}/direction`, _this.stdLog);
  },

  togglePower: function()
  {
    const _this = this;
    if (_this.togglingPower)
    {
      return;
    }
    _this.togglingPower = true;
    exec(`echo "1" > /sys/class/gpio/gpio${PWRBTNGPIO}/value`, _this.stdLog);
    setTimeout(function() {
      exec(`echo "0" > /sys/class/gpio/gpio${PWRBTNGPIO}/value`, _this.stdLog);
      setTimeout(function() {
        exec(`echo "1" > /sys/class/gpio/gpio${PWRBTNGPIO}/value`, _this.stdLog);
        _this.togglingPower = false;
      }, 1000);
    }, 100);
  },

  checkPower: function()
  {
    const _this = this;
    exec(`cat /sys/class/gpio/gpio${ONLEDGPIO}/value`, function(error, stdout, stderr)
    {
      if (error) {
        Log.warn(`error: ${error.message}`);
        _this.sendSocketNotification("CUR_POWER", { error: error });
        return;
      }
      if (stderr) {
        Log.warn(`stderr: ${stderr}`);
        _this.sendSocketNotification("CUR_POWER", { error: stderr });
        return;
      }
      Log.info(`stdout: ${stdout}`);
      _this.sendSocketNotification("CUR_POWER", { state: stdout });
    });
  },

  stdLog: function(error, stdout, stderr)
  {
    if (error) {
      Log.warn(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      Log.warn(`stderr: ${stderr}`);
      return;
    }
    Log.info(`stdout: ${stdout}`);
  }
});
