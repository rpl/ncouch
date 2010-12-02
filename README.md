README - n-couch
================

**ncouch** is yet another collection of couchdb node utilities.

It can be used as a command line tools (as in couchapp) or as a commonjs modules.

Getting Started
---------------

### CLI

Create a new project and run a testing couchdb instance
<pre>
$ ncouch generate project hellocouch
ncouch v0.1.0beta
Creating 'hellocouch' ncouch project dir...
Creating 'design' dir...
Creating 'example' design doc...
Creating 'example' design doc resource directories (attachments and libs)...

couchdb -a couchdb-user-test.ini
...
</pre>

In another shell:
<pre>
$ cd hellocouch

hellocouch$ ncouch push http://admin:admin@localhost:5984/hellocouch
ncouch v0.1.0beta
pushing... example.js
	CREATING DESIGN DOC '_design/example'.
</pre>

An **ncouch** design doc is a node commonjs module which exports **design_doc**,
**attachments** and **libs** attributes:

<pre><code>
// design/test1.js
exports.attachments = {
  res_dir: ""test1/attachments", 
  exclude_rx_list: [/.*~/]
};

exports.libs = {
  res_dir: "test1/libs", 
  exclude_rx_list: [/.*~/]
};

exports.design_doc = {
  validate_doc_update: function(newDoc, oldDoc, userCtx) {
    ...
  },
  views: {
    ...
  }
};
</code></pre>

### CommonJS Module

TODO
