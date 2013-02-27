var fs = require('fs')

var configfile = process.env["HOME"] + "/.huectl"

if (configfile == "/.huectl") {
    console.error("HOME not set in environment! Can not read or write config!")
    return 1
}

var config

if (!fs.existsSync(configfile)) {
    console.error("Configuration file does not exist! Have you registered..?")
    return 1
}


var hue = require("node-hue-api").hue
var lightState = require("node-hue-api").lightState

var api = null

function _displayResult(result) {
    console.log(JSON.stringify(result, null, 2))
}

function registerUser(hostname) {
    
    
    var newUserName = process.env["USER"],
        userDescription = "huectl"
        
    if (!newuserName) {
        console.error("USER not set in environment! Can not register...")
        process.exit(1)
    }

    hue.registerUser(hostname, newUserName, userDescription)
        .then(function (uname) {
            var config = {
                username: uname,
                hostname: hostname
            }
            fs.writeFile(configfile, "module.exports = " + JSON.stringify(config), function (err) {
                if (err) {
                    console.error("Unable to write configuration file to", configfile)
                    console.error(err)
                    process.exit(1)
                }
                console.log("Configuration saved to", configfile)
            })
        })
        .fail(function (err) {
            console.error("Registering failed!")
            console.error(err)
        })
        .done()
}



function validate() {
    api.connect().then(_displayResult).done()
}

function registeredUsers() {
    api.registeredUsers().then(_displayResult).done()
}

function lights() {
    api.lights().then(_displayResult).done()
}

function getLightState(id) {
    api.lightStatus(id).then(_displayResult).done()
}

function setLightState(id, state) {
    api.setLightState(id, state).then(_displayResult).done()
}

function getSchedules() {
    api.schedules().then(_displayResult).done()
}

function getSchedule(id) {
    api.getSchedule(id).then(_displayResult).done()
}

function setSchedule(id, name, when, state) {
    api.setSchedule(id, name, when, state).then(_displayResult).done()
}

function deleteSchedule(id) {
    api.deleteSchedule(id).then(_displayResult).done()
}

function getConfig() {
    api.config().then(_displayResult).done()
}

function createState(stateargs) {
    var s = lightState.create()
    for (var i = 0; i < stateargs.length; i++)
        switch (stateargs[i]) {
            case "on":
                s.on()
                break
            case "off":
                s.off()
                break
            case "brightness":
                s.brightness(stateargs[++i])
                break
            case "alert":
                s.alert(stateargs[++i] == "1")
                break
            case "rgb":
                s.rgb(stateargs[++i], stateargs[++i], stateargs[++i])
                break
            case "hsl":
                s.hsl(stateargs[++i], stateargs[++i], stateargs[++i])
                break
            case "xy":
                s.xy(stateargs[++i], stateargs[++i])
                break
            case "transition":
                s.transition(stateargs[++i])
                break
            default:
                throw Error("Unknown state: " + stateargs[i])
        }
    return s;
}

var args = process.argv.slice(2)

if (args.length == 0 || args[1] == "help") {
    console.error("usage: huectl <command> [<arguments>]")
    console.error("")
    console.error("commands:\n"
        + "  help\n\tThis help text\n"
        + "  register <hostname>\n\tRegisters your current user to the bridge\n" 
        + "\tand outputs a config file\n"
        + "  validate\n\tTries to connect to the bridge\n"
        + "  users\n\tLists registered users\n"
        + "  config\n\tPrints the device configuration\n"
        + "  lights\n\tLists the lights\n"
        + "  schedules\n\tRead and manipulate schedules.\n"
        + "  state <id>\n\tReads the light state by given id\n"
        + "  set <id> <state>\n\tSets a state to given light\n"
        + "\n"
        + "states:\n"
        + "  on\n\tToggle the light on\n"
        + "  off\n\tToggle the light off\n"
        + "  brightness <percent>\n\tSet brightness between 1-100\n"
        + "  alert <longalert>\n\tBlink the light a few times. Argument is either 0 or 1\n"
        + "  rgb <red> <green> <blue>\n\tSet the light to an RGB color\n"
        + "  hsl <hue> <saturation> <luminance>\n\tSet the light to an HSL color\n"
        + "  xy <x> <y>\n\tSet the light to an XY color\n"
        + "  transition <time>\n\nChange transition duration in seconds\n"
        + "\n"
        + "Multiple states may be set at once:\n" 
        + "\ton rgb 255 0 0 brightness 100 transition 10\n"
        + "\n"
        + "schedules:\n"
        + "  read <scheduleId>\n\tRead a schedule by id\n"
        + "  delete <scheduleId>\n\tDelete a schedule by id\n"
        + "  set <lightId> <name> <when> <state>\n"
        + "\tCreate a schedule for given light with given name\n" 
        + "\ttriggered at UTC when specified to set given state\n"
        + "  Without arguments output all schedules.\n"
        + "\n"
        + "Every command will output arguments usage if needed when given none.\n"
        + "\n"
        + "Return values will always be valid JSON.\n")
    
    return 1
}

if (args[1] == "register") {
    if (args.length != 2) {
        console.error("Error: hostname required!")
        console.error("usage: huectl register <hostname>")
        return 1
    }
    
    console.log("Write the following to config:")
    
    registerUser(args[1])
    return 0;
}

var config = require(configfile)

api = new hue.HueApi(config.hostname, config.username)

switch (args[0]) {
    case "validate":
        validate()
        break
    case "users":
        registeredUsers()
        break
    case "config":
        getConfig()
        break
    case "lights":
        lights()
        break
    case "schedules":
        if (args.length > 2)
            switch (args[1]) {
                case "read":
                    if (args.length != 3) {
                        console.error("Schedule id required!")
                        console.error("usage: huectl schedule read <id>")
                        return 1
                    }
                    var id = parseInt(args[2], 10)
                    if (!id) {
                        console.error("Invalid schedule id ", args[2])
                        return 1
                    }
                    
                    getSchedule(id)
                    break
                case "set":
                    if (args.length < 6) {
                        console.error("Lamp id, name, time and state info required!")
                        console.error("usage: huectl schedules set <id> <name> <when> <state>")
                        return 1
                    }
                    
                    var id = parseInt(args[2], 10)
                    if (!id) {
                        console.error("Invalid lamp id ", args[2])
                        return 1
                    }
                    var name = args[3]
                    var when = new Date(args[4])
                    
                    var s = createState(args.slice(5))
                    
                    setSchedule(id, name, when, s)
                    break
                case "delete":
                    if (args.length < 3) {
                        console.error("Schedule id required!")
                        console.error("usage: huectl schedules delete <id>")
                        return 1
                    }
                    
                    var id = parseInt(args[2], 10)
                    if (!id) {
                        console.error("Invalid schedule id ", args[2])
                        return 1
                    }
                    
                    deleteSchedule(id)
                    break 
                default:
                    console.error("Invalid schedule operation!")
                    console.log("usage: huectl schedules [read|set|delete] <arguments>")
                    return 1
            }
        else
            getSchedules()
        break
    case "state":
        if (args.length != 2) {
            console.error("Lamp id required!")
            console.error("usage: huectl state <id>")
            return 1
        }
        
        var id = parseInt(args[1], 10)
        if (!id) {
            console.log("Invalid lamp id ", args[1])
            return 1
        }
        
        getLightState(id)
        break
    case "set":
        if (args.length < 3) {
            console.error("Lamp id and state info required!")
            console.error("usage: huectl set <id> <state>")
            return 1
        }
        
        var id = parseInt(args[1], 10)
        if (!id) {
            console.error("Invalid lamp id ", args[1])
            return 1
        }
        
        // Create state
        var s = createState(args.slice(2))
        
        setLightState(id, s)
        break
    default:
        console.log("unknown command", args[0])
}
