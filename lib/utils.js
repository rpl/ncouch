exports.merge = function merge(src, defaults) {
    var dst = {};

    if(defaults) {
	for (var i in defaults) {
	    dst[i] = defaults[i];
	}
    }

    for (var i in src) {
	dst[i] = src[i];
    }

    return dst;
}
