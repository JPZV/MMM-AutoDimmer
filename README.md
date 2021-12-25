# Module: MMM-AutoDimmer
Allows you to dim your magic mirror on a schedule. You simply set a time to dim and a time to brighten (and a few other optional settings, if you like) and it does the rest. At the dim time, it will gradually dim the screen until it hits the max threshold you set. When it's time to brighten again, it will gradually brighten the screen to full brightness.

This module was forked from https://github.com/kolbyjack/MMM-Dimmer, which dims the screen based on sunset and sinrise times.

## Installation

In your terminal, go to your MagicMirror's Module folder:
```
cd ~/MagicMirror/modules
```

Clone this repository:
```
git clone https://github.com/Fifteen15Studios/MMM-AutoDimmer.git
```

Configure the module in the `~/MagicMirror/config/config.js` file using the section below.

## Using the module

To use this module, add it to the modules array in the `~/MagicMirror/config/config.js` file.

**\*\* If you are updating, please note the changes to the config file \*\***

You can have as many schedules as you want, which will allow you to dim / brighten the screen multiple times per day if you like.

### Example 1
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

### Example 2
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
          days: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
          dimTime: 800,
          brightTime: 1700
          // defaults are used for values that are not explicitly set
        }  // 8am to 5pm, m-f
      ]
    }
  }
]
```

### Example 3
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
          brightTime: 900,
          dimTime: 1700
          // defaults are used for values that are not explicitly set
        },
        {
          dimTime: 1100,
          brightTime: 1300
          // defaults are used for values that are not explicitly set
        }
      ]
    }
  }
]
```

## Configuration options

### Main config

|Option|Default|Description|
|---|---|---|
|`schedules`||See below table for how to configure schedules.|

### Schedules

|Option|Default|Description|Acceptible Values|
|---|---|---|---|
|`days`|`["Sunday","Monday","Tuesday",`<BR>`"Wednesday","Thursday","Friday","Saturday"]`|An array of days of the week to dim the screen. Default is every day.| See default array. |
|`maxDim`|`0.9`|How much to lower the opacity of the screen when fully dimmed (higher is dimmer, 1.0 will turn the screen completely black).| 0 - 1 |
|`brightTime`|`700`|When to start to brighten the screen. Formatted as 24-hour time with no special characters. Ex: 700 = 7:00 AM| 0 - 2359 |
|`dimTime`|`2000`|When to start to dim the screen. Formatted as 24-hour time with no special characters. Ex: 2000 = 20:00 = 8:00 PM| 0 - 2359 |
|`transitionDuration`|`10 * 60 * 1000`|How long to take (in ms) to gradually dim the screen after dimTime or brighten the screen after brightTime. Default is 10 minutes.| 0 or greater |
|`transitionSteps`|`20`|How many gradual changes to make during transitionDuration. By default, it will gradually change brightness every 30 seconds during the transition time. (20 times in a 10 minute period.)| 1 or greater |

#### Special Cases

- If multiple schedules overlap, dim will take precidence over bright.
- If `dimTime` and `brightTime` are the same for any schedule, the screen will always be dimmed.
- If multiple dim times overlap, the last in the list will take precedence (for `maxDim` and transition settings)

## Future Improvements / Enhancements

**Have an idea? Start a [discussion](https://github.com/Fifteen15Studios/MMM-AutoDimmer/discussions), and I may implement it.**

**Found a bug? Submit an [issue](https://github.com/Fifteen15Studios/MMM-AutoDimmer/issues) and I'll take a look at it.**
