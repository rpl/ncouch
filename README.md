README - n-couch
================

**ncouch** is yet another collection of couchdb node utilities.

It can be used as a command line tools (as in couchapp) or as a commonjs modules.

Getting Started
---------------

### CLI

<pre>
$ ncouch push design/*.js http://admin:pass@localhost:5984/databasename

or

$ ncouch push design/*.js databasename

or 

$ ncouch push --config=ncouch_config.json
</pre>

An **ncouch** design doc is a node commonjs module which exports **design_doc**,
**attachments** and **libs** attributes:

<pre><code>
// design/test1.js
exports.attachments = {
  res\_dir: ""test1/attachments", 
  exclude\_rx\_list: [/.*~/]
};

exports.libs = {
  res\_dir: "test1/libs", 
  exclude\_rx\_list: [/.*~/]
};

exports.design\_doc = {
  validate\_doc\_update: function(newDoc, oldDoc, userCtx) {
    ...
  },
  views: {
    ...
  }
};
</code></pre>

### CommonJS Module


