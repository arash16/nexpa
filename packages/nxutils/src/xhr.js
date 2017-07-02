function xhrObject() {
    for (var a = 0; a < 4; a++)
        try {
            return a
                ? new ActiveXObject([, "Msxml2", "Msxml3", "Microsoft"][a] + ".XMLHTTP")
                : new XMLHttpRequest
        }
        catch (e) {}
}

function xhr(method, url, data, callback) {
    var httpRequest = xhrObject();

    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            var data = JSON.parse(httpRequest.responseText);

            if (httpRequest.status === 200)
                callback(null, data);
            else
                callback(new Error('There was a problem with the request.'), data);
        }
    };

    httpRequest.open(method, url, true);
    httpRequest.setRequestHeader('Content-Type', 'application/json');
    httpRequest.send(data ? JSON.stringify(data) : null);

    return httpRequest;
}
