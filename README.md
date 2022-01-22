# Module: MMM-AutoDimmer
Allows you to dim your magic mirror on a schedule. You simply set a time to dim and a time to brighten (and a few other optional settings, if you like) and it does the rest. At the dim time, it will gradually dim the screen until it hits the max threshold you set. When it's time to brighten again, it will gradually brighten the screen to full brightness.

This module was forked from https://github.com/kolbyjack/MMM-Dimmer, which dims the screen based on sunset and sinrise times.

## Installation

In your terminal, go to your MagicMirror's Module folder:
````
cd ~/MagicMirror/modules
````

Clone this repository:
````
git clone https://github.com/Fifteen15Studios/MMM-AutoDimmer.git
````

Configure the module in the `~/MagicMirror/config/config.js` file.

## Using the module

To use this module, add it to the modules array in the `~/MagicMirror/config/config.js` file:
````javascript
modules: [
    {
      module: 'MMM-AutoDimmer',
      position: 'fullscreen_above',
      header: '',
      // Don't change anything above this line
      config: {
        maxDim: 0.9,
        brightTime: 700,
        dimTime: 2000,
        transitionDuration: 10 * 60 * 1000,
        transitionSteps: 20
      }
    }
]
````

## Configuration options

The following properties can be configured:

|Option|Default|Description|
|---|---|---|
|`maxDim`|`0.9`|How much to lower the opacity of the screen when fully dimmed (higher is dimmer, 1.0 will turn the screen completely black).|
|`brightTime`|`700`|When to start to brighten the screen. Formatted as 24-hour time with no special characters. Ex: 700 = 7:00 AM|
|`dimTime`|`2000`|When to start to dim the screen. Formatted as 24-hour time with no special characters. Ex: 2000 = 8:00 PM|
|`transitionDuration`|`10 * 60 * 1000`|How long to take (in ms) to gradually dim the screen after dimTime or brighten the screen after brightTime.|
|`transitionSteps`|`20`|How many gradual changes to make during transitionDuration. By default, it will gradually change brightness every 30 seconds during the transition time. (20 times in a 10 minute period.)|
