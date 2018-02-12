function xhrObject() {
    for (var a = 0; a < 4; a++)
        try {
            return a
                ? new ActiveXObject([, "Msxml2", "Msxml3", "Microsoft"][a] + ".XMLHTTP")
                : new XMLHttpRequest
        }
        catch (e) {}
}

var _xhrHeaders = { "Content-Type": "application/json" };
function xhr(method, url, data, callback) {
    var httpRequest = xhrObject(),
    	isJson = _xhrHeaders['Content-Type'] == 'application/json';

    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
        	var code = httpRequest.status,
        		resp = httpRequest.responseText;

			if (code == 0)
				callback(new Error('Connection Error'), null, 0);
        	else {
		        var data = resp && isJson ? JSON.parse(resp) : resp;
		        if (code < 400)
		            callback(null, data, code);
		        else
		            callback(new Error('There was a problem with the request.'), data, code);
            }
        }
    };

    httpRequest.open(method, url, true);
    eachKey(_xhrHeaders, httpRequest.setRequestHeader.bind(httpRequest));
    httpRequest.send(data ? JSON.stringify(data) : null);

    return httpRequest;
}

xhr.setHeader = function(key, value) {
	_xhrHeaders[key] = value;
}

xhr.getHeader = function(key) {
	return _xhrHeaders[key];
}

xhr.unsetHeader = function(key) {
	delete _xhrHeaders[key];
}
