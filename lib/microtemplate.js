// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
  var cache = {};
 
  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
     
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      var body = "var p=[],print=function(){p.push.apply(p,arguments);};" +
       
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
       
        // Convert the template into pure JavaScript
        str
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t")
          .replace(/\n/g, "\\n")		   
//          .replace(/[\r\t\n]/g, " ") // NOTE: I NEED TO PRESERVE THIS CHARS
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');"
   
    var fn = !/\W/.test(str) ?
	cache[str] = cache[str] ||
        tmpl(str) : new Function("obj", body);

    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();

exports.tmpl = tmpl;

require.extensions[".mtmpl"] = function(module, filename) {
    var content = require("fs").readFileSync(filename).toString();    
    module.exports.tmpl = tmpl(content);
}