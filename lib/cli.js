var ncouch = require("ncouch");
var sys = require("sys");
var optparse = require("optparse");

var SWITCHES = [
    ["-h", "--help", "Show this help"],
    ["-c", "--config [FILE]", "Configuration file"],
    ["-d", "--debug", "Turn on debugging"]
]

var COMMANDS = [
    ["generate TYPE NAME", "Create a new ncouch asset (e.g. project,design_doc)"],
    ["push [DESIGN_DOC] DB_URL", "Push design doc"]
]

// Create a new OptionParser with defined switches
var parser = new optparse.OptionParser(SWITCHES);
var command = null;
var args = [];

parser.banner = 'Usage: ncouch.js [options]';

var options = {
    command: command,
    args: args,
    config_file: null,
    debug: false
}

// Handle the first argument (switches excluded)
parser.on(2, function(value) {
    command = value;
});

parser.on(3, function(value) {
    args.push(value);
});

parser.on(4, function(value) {
    args.push(value);
});

parser.on('debug', function(value) {
    sys.puts("DEBUG ON");
    options.debug = value;
});

parser.on('help', function(value) {
    sys.puts(parser.toString());
    sys.puts("\nAvailable commands:");
    COMMANDS.forEach(function(item) {
	sys.puts("  "+item[0]+"\t"+item[1]);
    });
    process.exit(0);
});

parser.on("config", function(key,value) {
    options.config_file = value;
});

sys.puts("ncouch "+ncouch.version);
parser.parse(process.ARGV);

if(options.debug) {
    sys.puts("COMMAND: "+command);
    console.dir(args);
}


switch(command) {
case "push": 
    var result = require("ncouch/cli/push").run(options);
    break;
case "generate":
    var result = require("ncouch/cli/generate").run(options);
    break;
default:
    var result = -1;
}

if(result === -1) {
    sys.puts(parser.toString());
    sys.puts("\nAvailable commands:");
    COMMANDS.forEach(function(item) {
	sys.puts("  "+item[0]+"\t"+item[1]);
    });
    process.exit(result);
}

