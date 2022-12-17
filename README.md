# Module: MMM-AutoDimmer
Allows you to dim your magic mirror on a schedule. You simply set a time to dim and a time to brighten (and a few other optional settings, if you like) and it does the rest. At the dim time, it will gradually dim the screen until it hits the max threshold you set. When it's time to brighten again, it will gradually brighten the screen to full brightness.

This module was forked from https://github.com/kolbyjack/MMM-Dimmer, which dims the screen based on sunset and sunrise times.

## Installation

In terminal, go to your MagicMirror's Module folder:
```
cd ~/MagicMirror/modules
```

Clone this repository:
```
git clone https://github.com/Fifteen15Studios/MMM-AutoDimmer.git
```

## Updating

In terminal, go to the Module's folder and pull the latest version from GitHub:
```
cd ~/MagicMirror/modules/MMM-AutoDimmer
git pull
```

## Recent Changes

### 2022/12/16 Release

- Allow for multiple active schedules
  - When multiple schedules are active, the one with the highest maxDim setting will be activate
- Allow dimming based on notifications received
  - This was designed to work well with [MMM-homeassistant-sensors](https://github.com/Fifteen15Studios/MMM-homeassistant-sensors)
  - Can be used together to trigger on things like lights being off, or wifi not being connected to home SSID
- Transitioning from dim to bright (or vice-versa) is more precise now
  - Starting the mirror, or a schedule, during the transition will properly show the transition
- Having a schedule with dimTime equal to brightTime is properly supported
  - These schedules will always be dim, unless there is a NotificationTrigger that is not satisfied

## Configuration options

### Main config

|Option|Default|Description|
|---|---|---|
|`schedules`||See below table for how to configure schedules.|

### schedules Config

|Option|Default|Description|Acceptible Values|
|---|---|---|---|
|`days`|`["Sunday","Monday","Tuesday",`<BR>`"Wednesday","Thursday","Friday","Saturday"]`|An array of days of the week to dim the screen. Default is every day.| See default array. |
|`maxDim`|`0.9`|How much to lower the opacity of the screen when fully dimmed (higher is dimmer, 1.0 will turn the screen completely black).| 0 - 1 |
|`brightTime`|`700`|When the screen should be fully bright. Formatted as 24-hour time with no special characters. Ex: 700 = 7:00 AM| 0 - 2359 |
|`dimTime`|`2000`|When the screen should be fully dim. Formatted as 24-hour time with no special characters. Ex: 2000 = 20:00 = 8:00 PM| 0 - 2359 |
|`transitionDuration`|`10 * 60 * 1000`|How long to take (in ms) to gradually dim or brighten the screen. The screen will start to transition this long before dimTime or brightTime. Default is 10 minutes.| 0 or greater |
|`transitionSteps`|`20`|How many gradual changes to make during transitionDuration. By default, it will gradually change brightness every 30 seconds during the transition time. (20 times in a 10 minute period.)| 0 or greater |
|`notificationTriggers`|`undefined`|An array of values to trigger this schedule when notifications are received.|See below for details.|

### notificationTriggers Config

|Option|Type|Description|
|------|----|-----------|
|`name`|string|Name of the notification that should trigger this schedule|
|`value`|any|Value in the notification that should turn the schedule `on`. Any other value will turn the schedule `off`|

## Using the module

To use this module, add it to the modules array in the `~/MagicMirror/config/config.js` file.

**\*\* If you are updating, please note the changes to the config file \*\***

You can have as many schedules as you want, which will allow you to dim / brighten the screen multiple times per day if you like.

### Example 1 - Just The Default Schedule
```javascript
modules: [
  {
    module: 'MMM-AutoDimmer',
    position: 'fullscreen_above',
    header: '',
    // Don't change anything above this line
    config: {
      schedules: [{}] // Uses all default values
    }
  }
]
```

### Example 2 - Default Schedule and Mon-Friday 8am-5pm
```javascript
modules: [
  {
    module: 'MMM-AutoDimmer',
    position: 'fullscreen_above',
    header: '',
    // Don't change anything above this line
    config: {
      schedules: [
        {}, // default schedule - 8pm to 7am daily
        {
          // will dim to default level of 0.9, from 8am to 5pm, Mon-Fri
          days: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
          dimTime: 800,
          brightTime: 1700
          // defaults are used for values that are not explicitly set
        }
      ]
    }
  }
]
```

### Example 3 - Two Custom schedules
```javascript
modules: [
  {
    module: 'MMM-AutoDimmer',
    position: 'fullscreen_above',
    header: '',
    // Don't change anything above this line
    config: {
      schedules: [
        {
          // Will be dim to 0.9 (default level) from 9am-5pm every day
          brightTime: 900,
          dimTime: 1700
          // defaults are used for values that are not explicitly set
        },
        {
          // Will dim completely from 11am-1pm every day
          maxDim: 1,
          dimTime: 1100,
          brightTime: 1300
          // defaults are used for values that are not explicitly set
        }
      ]
    }
  }
]
```

### Example 4 - Notification Example
```javascript
modules: [
  {
    module: 'MMM-AutoDimmer',
    position: 'fullscreen_above',
    header: '',
    // Don't change anything above this line
    config: {
      schedules: [{
        // Will be dim starting when a notification is received with name "HOME"
          //and value false
        // Will no longer be dim when a notification is received with name "HOME"
          // and value of anything other than false
        notificationTriggers: [
          {
            name: "HOME",
            value: false
          },
          {
            name: "TV",
            value: "on"
          },
        ],
        dimTime: 800,
        brightTime: 1700,
        maxDim: 1
      }]
    }
  }
]
```

#### NotificationTriggers Example Explanation

Conditions: current time is 12:00pm (noon), schedule is setup as shown in Example 4<BR>
Notification Received: `name: "HOME", value: false` <BR>
Action: This schedule will activate, because a notification was received with the name `"HOME"` and the value `false`.

Condition: 5 minutes later (12:05pm)<BR>
Notification Received: `name: "BUS_ARRIVING", value: 12:12pm'`<BR>
Action: Nothing happens, because the name of the notification does not match the name set on the trigger.

Condition: 5 minutes later (12:10pm)<BR>
Notification Received: `name: "HOME", value: false` <BR>
Action: Nothing changes, because the schedule is already active.

Condition: 5 minutes later (12:15pm)<BR>
Notification Received: `name: "HOME", value: true'`<BR>
Action: This schedule becomes inactive,  because a notification was received with the name `"HOME"` and the value `true`. Since name matches but value does not, this schedule is deactivated.


## Special Cases

- If multiple schedules overlap, the active schedule with the highest maxDim will take precendence.
- If `dimTime` and `brightTime` are the same for any schedule, the screen will always be dimmed. These schedules will not transition, even if transition variables are set.
  - NOTE: These will not be dim if there is a Notification Trigger which is not satisfied.

## Future Improvements / Enhancements

**Have an idea? Start a [discussion](https://github.com/Fifteen15Studios/MMM-AutoDimmer/discussions), and I may implement it.**

**Found a bug? Submit an [issue](https://github.com/Fifteen15Studios/MMM-AutoDimmer/issues) and I'll take a look at it.**