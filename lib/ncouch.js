var couchdb = require("cradle");
var fs = require("fs");
var mime = require("mime");
var path = require("path");

var merge = require("ncouch/utils");

exports.version = "v0.1.0beta";

exports.debug = 0;

function LOG_ERROR(err) {
    if(exports.debug === 0) return; // QUIET MODE

    if(typeof err === "string")
	console.log("ncouch ERROR: "+err);
    else {
	console.log("ncouch ERROR: ");
	console.dir(err);
    }
}

exports.db = function(database_options) {
    return new CouchDB(database_options);
}

function CouchDB(database_options) {
    this._db_opts = database_options;
    var opts = this._db_opts;

    this._cradle = (new couchdb.Connection({
	cache: true, 
	auth: { user: opts.username, pass: opts.password },
	host: opts.host,
	port: opts.port
    })).database(opts.db);
}

CouchDB.prototype = {
    ready: initDatabase,
    ddoc_push_all: ddoc_push_all,
    ddoc_push: ddoc_push
}


function ddoc_push(name) {
    var db = this._cradle;
    
    push_ddoc(db, name);
}

function ddoc_push_all() {
    var db = this._cradle;
 
    foreach_design_doc(function (err, name) {
	if(err) {
	    LOG_ERROR(err);
	    return;
	}

	push_ddoc(db, name);
    });
}

function push_ddoc(db, name) {
    console.log("pushing... "+name);

    try {
	var ddoc = require(process.cwd()+"/design/"+name);

	var design_doc_name = path.basename(name, ".js");

	if(ddoc.libs) {
	    ddoc.design_doc.libs = collectCommonJSLibs(
		collectFilesSync("./design/"+ddoc.libs.res_dir, ddoc.libs.exclude_rx_list)
	    );
	}
	
	uploadDesignDoc(db, '_design/'+design_doc_name, ddoc.design_doc, 
			true, next);
	
	function next(design_doc) {
	    if(ddoc.attachments) {
		var res_dir = ddoc.attachments.res_dir;
		var rx_list = ddoc.attachments.exclude_rx_list;
		uploadAttachments(db, design_doc, 
				  collectFilesSync("./design/"+res_dir, rx_list));
	    }
	}	
    }
    catch(err) {
	LOG_ERROR(err);
    }

}

function foreach_design_doc(callback) {
    try {
	var design_docs = fs.readdirSync("./design").filter(function (filename) {	
	    return (fs.statSync("./design/"+filename).isFile() &&
		    filename.match(/.js$/))
	})

	if(design_docs.length == 0)
	    callback({error: "no_design_doc", message: "No Design Doc found"}, null);

	design_docs.forEach(function (i) { 
	    callback(null, i,require(process.cwd()+"/design/"+i)) 
	});
    }
    catch(e) {
	LOG_ERROR(e);
    }
}

function uploadAttachments(db, doc, filetree) {
    var files = [];

    filetree.forEach(function (i) {
	if(i.type == "file") 
	    push_file("/"+i.name, i.mime, i.data);
	if(i.type == "dir")
	    iterate_dir("/"+i.name,i);
    });

    (function next(doc, i) {
	if(i<files.length)
	    upload_file(doc, files[i], i, next)
    })(doc, 0);

    function upload_file(doc, file, i, next) {
	console.log("\tUPLOADING ATTACHMENT: "+doc._id+file.name);
	db.saveAttachment(doc, file.name, file.mime, file.data, function(err, res) {
	    if(err) LOG_ERROR(err);
	    else {
		res._rev = res.rev;
		res._id = doc._id;
		next(res, i+1);
	    }
	});
    }
    function push_file(filename, mime, data) {
	files.push({name: filename, mime: mime, data: data});
    }
    function iterate_dir(basedir, dir) {
	var dirname = dir.name;

	dir.data.forEach(function (i) {
	    if(i.type == "file") {
		console.log("DEBUG: "+basedir+"/"+i.name);
		push_file(basedir+"/"+i.name, i.mime, i.data);
	    }
	    if(i.type == "dir") {
		iterate_dir(basedir+"/"+i.name, i);
	    }
	});
    }
}		

function uploadDesignDoc(db, design_doc_name, design_doc_body, overwrite, next) {
    db.get(design_doc_name, function(err, doc) {
	if(err && err.error === "not_found") {
	    console.log("\tCREATING DESIGN DOC '"+design_doc_name+"'.");
	    db.put(design_doc_name, design_doc_body,
		   function (err,doc) {
		       if(err) {
			   LOG_ERROR(err);
		       }
		       else
			   next(doc);
		   });
	} else if(overwrite) {
	    console.log("\tUPDATING DESIGN DOC '"+design_doc_name+"'.");
	    db.save(design_doc_name, doc._rev, design_doc_body,
		    function (err, doc) {
			if(err) {
			    LOG_ERROR(err);
			}
			else
			    next(doc);
		    });
	}
    });
}

function initDatabase(callback) {
    var db = this._cradle;

    db.exists(function(err, db_exists) {
	if(err && err.error !== "not_found") {
	    LOG_ERROR(err);
	    return;
	}
	if(!db_exists) {
	    db.create(function(err, res) {
		if(err)
		    LOG_ERROR(err);
		else
		    callback(db);
	    });
	}
	else {
	    callback(db);
	}
    });	     
}

exports.DesignDoc = function DesignDoc(options) {
    this._options = merge(options, {
	design_doc: null,
	libs: null,
	attachments: null,
    });
}

function collectFilesSync(path, exclude_rx_list) {
    return fs.readdirSync(path).filter(function (filename) {
	var excluded = exclude_rx_list.some(function (rx) {
	    return filename.match(rx)
	});     

	return !excluded && 
	    (fs.statSync(path+'/'+filename).isFile() || 
	     fs.statSync(path+'/'+filename).isDirectory());

    }).map(function (filename) {
	var file_stat = fs.statSync(path+'/'+filename);
	if(file_stat.isFile())
	    return {name: filename, type: "file", mime: mime.lookup(filename),
		    data: fs.readFileSync(path+'/'+filename)};
	if(file_stat.isDirectory())
	    return {name: filename, type: "dir", data: collectFilesSync(path+'/'+filename, 
								   exclude_rx_list)};
    });
}

function collectCommonJSLibs(filetree) {
  
    return iterate_filetree(filetree);
    
    function iterate_filetree(dir) {
	var data = {};

	dir.forEach(function (i) {
	    var key = path.basename(i.name, ".js");
	    if(i.type == "file") {
		data[key] = i.data.toString();
	    }
	    if(i.type == "dir") {
		data[key] = iterate_filetree(i.data);
	    }
	});

	return data;
    }    
}

