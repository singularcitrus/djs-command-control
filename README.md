# djs-command-control
A Library for handling commands in discord.js

## Table of Contents

- [Classes:](#classes-)
  * [Commands](#commands)
- [Types:](#types-)
  * [CommandOptions](#commandoptions)
  * [CustomizablePrefix](#customizableprefix)
  * [DefaultCategory](#defaultcategory)
  * [HelpOptions](#helpoptions)
  * [RateLimiterOptions](#ratelimiteroptions)
  * [Command](#command)

## Classes:
### Commands
The commands class is the main class you will be working with when you are using this library.

#### Contructor
The contstructor automatically searches for files exporting the proper [Command](#command) type in the path you specified

|Name|Type|Description|
|---|---|---|
|`client`|[Client](https://discord.js.org/#/docs/main/stable/class/Client)|Your Discord.js Client|
|`path`|string|The path of the commands folder relative to the root of the project (where package.json lives)|
|`options`|[CommandsOptions](#commandoptions)|The options for creating the Commands object|

#### Functions

|Name|Type|Arguments|Returns|Description|
|---|---|---|---|---|
|`messageEvent`|AsyncFunction|`message` - [Message](https://discord.js.org/#/docs/main/stable/class/Message)|Promise\<void\>|Should always be called in the onMessage event, this does not get registered autmatically, to allow you to do other things in the onMessage event|
|`addCategory`|Function|`name` - **string**; `title` - **string**|[Command](#command)|Adds another category that you can add commands to| 

## Types:
### CommandOptions
* Type: Object - `{}`
* Valid fields: 6

|Name|Type|Description|Optional|
|---|---|---|---|
|`prefix`|string|The prefix to use to invoke commands|no|
|`prefixOnMention`|boolean|Whether to return the prefix when a user mentions the bot with nothing else in the message|yes|
|`customizablePrefix`|[CustomizablePrefix](#customizableprefix)|Options to read a customizable prefix|yes|
|`defaultCategory`|[DefaultCategory](#defaultcategory)|Options the override the default category|yes|
|`help`|[HelpOptions](#helpoptions)|Options for the help command|yes|
|`rateLimiter`|[RateLimiterOptions](#ratelimiteroptions)|Options for adding a rate limiter|yes|

### CustomizablePrefix
* Type: Object - `{}`
* Valid fields: 2

|Name|Type|Description|Optional|
|---|---|---|---|
|`callback`|function|A function that returns a string for the prefix, takes parameter `options` specified below|no|
|`options`|Object|An object that will be directly passed to the above function, use this to pass custom parameters|no|

### DefaultCategory
* Type: Object - `{}`
* Valid fields: 2

|Name|Type|Description|Optional|
|---|---|---|---|
|`name`|string|A name for the default category, default is `general`|yes|
|`title`|string|The title to display in the help command, default is `General`|yes|

### HelpOptions
* Type: Object - `{}`
* Valid fields: 3

|Name|Type|Description|Optional|
|---|---|---|---|
|`include`|boolean|Whether to include the default help command in the list of commands|yes|
|`omitFromHelp`|boolean|Whether to remove the help command from the help command|yes|
|`category`|string|Specify a category to override the category the help command appears in, default is `general`|yes|

### RateLimiterOptions
* Type: Object - `{}`
* Valid fields: 3

|Name|Type|Description|Optional|
|---|---|---|---|
|`enabled`|boolean|Whether to enable the ratelimiter|no, if it is defined, make it true|
|`amount`|number|The amount of commands to allow in a timeframe, default is `1`|yes|
|`interval`|number|The aforementioned timeframe in milliseconds, default is `5000`|yes|


### Command
* Type: Object - `{}`
* Valid fields: 8

|Name|Type|Description|Optional|
|---|---|---|---|
|`name`|string|The name to display in the help command|no|
|`invoke`|string[]|Array of strings that can be user to invoke the command|no|
|`description`|string|Description to display in the help command|no|
|`usage`|string|String containing a short description of a usage for the command, this is automatically appended to the invokes|no, but it can be an empty string|
|`execute`|AsyncFunction|Function taking 2 arguments, the Message object and an options object. Returns Promise\<void\>. This is executed when the commands is invoked|no|
|`category`|string|The category the command should appear in, `general`, or any name added by [addCategory](#functions)|no|
|`permissions`|string[]|Array of valid Discord permissions that **can** execute this command, empty means everyone, fallback to empty|yes|
|`omitHelp`|boolean|Whether to omit this command from help, fallback to false|yes|

