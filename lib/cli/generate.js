var sys = require("sys");
var fs = require("fs");

exports.run = function run(options) {
    var args = options.args;
    var valid_args = validate_command_args(args);

    if(valid_args < 0) return valid_args;

    var type = args[0]
    var name = args[1];

    if(type === "project") {
	options.project_name = name;
	options.project_root_dir = name;
	options.design_doc_name = "example";

	var sequence = [
	    create_project_dir,
	    create_design_dir,
	    create_design_doc
	];

	return run_sequence(sequence, options);
    }

    if(type === "design_doc") {
	options.project_root_dir = ".";
	options.design_doc_name = name;

	var sequence = [
	    create_design_doc
	];

	return run_sequence(sequence, options);
    }
}

function validate_command_args(args) {
    if(args.length < 2) {
	sys.puts("\nError: generate needs 2 argument.");
	return -1
    }

    return 0;
}

function run_sequence(sequence, options) {
    try {
	sequence.forEach(run_action);
    }
    catch (e) {
	if(e.reported) return -2;
	
	sys.puts("\n"+e);
	if(options.debug) {
	    console.dir(e);
	    console.log(e.stack);
	}
	return -2
    }
    
    return 0;
    
    function run_action(action) {
	if(typeof action === "function") 
	    action(options);
    }
}

function create_project_dir(options) {
    var project_name = options.project_name;

    sys.puts("Creating '"+project_name+"' ncouch project dir...");

    try {
	fs.mkdirSync(project_name, 0755);	
    }
    catch(e) {
	if(e.errno && e.errno === 17) {
	    sys.puts("\nError: directory '"+project_name+"' already exists.");
	    e.reported = true;
	    throw e;
	} else {
	    throw e;
	}
    }
}

function create_design_dir(options) {
    var project_name = options.project_name;
    
    sys.puts("Creating 'design' dir...");

    fs.mkdirSync(project_name+"/design", 0755);
}

function create_design_doc(options) {
    var project_root_dir = options.project_root_dir;
    var ddoc_name = options.design_doc_name;
    
    sys.puts("Creating '"+ddoc_name+"' design doc...");

    var ddoc_file = fs.openSync(project_root_dir+"/design/"+ddoc_name+".js", "w", 0644);

    require("ncouch/microtemplate");

    var ddoc_tmpl = require("../templates/design/example.mtmpl").tmpl;

    var ddoc_content = ddoc_tmpl({name: ddoc_name});

    fs.writeSync(ddoc_file, ddoc_content, 0);

    fs.closeSync(ddoc_file);

    sys.puts("Creating '"+ddoc_name+"' design doc resource directories (attachments and libs)...");
    fs.mkdirSync(project_root_dir+"/design/"+ddoc_name, 0755);	
    fs.mkdirSync(project_root_dir+"/design/"+ddoc_name+"/attachments", 0755);	
    fs.mkdirSync(project_root_dir+"/design/"+ddoc_name+"/libs", 0755);	
}