# huectl - A command line utility for the Philips Hue

Manage your Philips Hue directly from the command line. Created with nodejs and
with a patched version of [node-hue-api](https://github.com/peter-murray/node-hue-api) 
library.

## Usage
```
usage: huectl <command> [<arguments>]

commands:
  help
	This help text
  register <hostname>
	Registers your current user to the bridge
	and outputs a config file
  validate
	Tries to connect to the bridge
  users
	Lists registered users
  config
	Prints the device configuration
  lights
	Lists the lights
  schedules
	Read and manipulate schedules.
  state <id>
	Reads the light state by given id
  set <id> <state>
	Sets a state to given light

states:
  on
	Toggle the light on
  off
	Toggle the light off
  brightness <percent>
	Set brightness between 1-100
  alert <longalert>
	Blink the light a few times. Argument is either 0 or 1
  rgb <red> <green> <blue>
	Set the light to an RGB color
  hsl <hue> <saturation> <luminance>
	Set the light to an HSL color
  xy <x> <y>
	Set the light to an XY color
  transition <time>

Change transition duration in seconds

Multiple states may be set at once:
	on rgb 255 0 0 brightness 100 transition 10

schedules:
  read <scheduleId>
	Read a schedule by id
  delete <scheduleId>
	Delete a schedule by id
  set <lightId> <name> <when> <state>
	Create a schedule for given light with given name
	triggered at UTC when specified to set given state
  Without arguments output all schedules.

Every command will output arguments usage if needed when given none.

Return values will always be valid JSON.
```
