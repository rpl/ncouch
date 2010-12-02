var sys = require("sys");
var fs = require("fs");
var path = require("path");

function LOG_ERROR(err) {
    if(exports.debug === 0) return; // QUIET MODE

    if(typeof err === "string")
	console.log("ncouch ERROR: "+err);
    else {
	console.log("ncouch ERROR: ");
	console.dir(err);
	console.log(err.stack);
    }
}


exports.run = function run(options) {
    var args = options.args;
    var valid_args = validate_command_args(args);

    if(valid_args < 0) return valid_args;

    if(args.length === 1) {
	options.database_url = args[0];
    }
    if(args.length === 2) {
	options.design_doc_name = args[0];
	options.database_url = args[1];
    }

    try {
	var db_opts = parse_database_url(options.database_url);
    }
    catch(e) {
	if(e.reported) return -2;
	
	sys.puts("\n"+e);
	if(options.debug) {
	    console.dir(e);
	    console.log(e.stack);
	}
	return -1
    }

    var db = require("ncouch").db(db_opts);

    db.ready(function() {
	if(!options.design_doc_name ||
	   options.design_doc_name === "all")
	    db.ddoc_push_all();
	else
	    db.ddoc_push(options.design_doc_name);
    });

    return 0;
}

function validate_command_args(args) {
    if(args.length < 1) {
	sys.puts("\nError: push needs 1 or 2 argument.\n");
	return -1
    }

    return 0;
}

function parse_port(port) {
    var port_int = parseInt(port);

    if(port_int.toString() == 'NaN')
	throw "Error: unable to parse port number from database url\n"

    return port_int;
}

function parse_database_url(arg) {
    var match;
    var res = {
	username: null,
	password: null,
	host: null,
	port: null,
	db: null
    }

    if(match = arg.match(/^http:\/\/(.*):(.*)@(.*):(.*)\/(.*)/)) {
	res.username = match[1];
	res.password = match[2];
	res.host = match[3];
	res.port = parse_port(match[4]);
	res.db = match[5];

	return res;
    }

    if(match = arg.match(/^http:\/\/(.*):(.*)@(.*)\/(.*)/)) {
	res.username = match[1];
	res.password = match[2];
	res.host = match[3];
	res.db = match[4];
	res.port = 5984;

	return res;
    }

    if(match = arg.match(/^http:\/\/(.*):(.*)\/(.*)/)) {
	res.host = match[1];
	res.port = parse_port(match[2]);
	res.db = match[3];

	return res;
    }

    if(match = arg.match(/^http:\/\/(.*)\/(.*)/)) {
	res.host = match[1];
	res.db = match[2];
	res.port = 5984;

	return res;
    }

    // DEFAULTS
    if(arg.match(/^http:/)) {
	console.log("ERROR");
	throw "Error: unable to parse database url\n";
    }

    res.host = "localhost";
    res.port = 5984;
    res.db = arg;

    return res;
}