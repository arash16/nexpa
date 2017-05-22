function xhr(method, url, data, callback) {
    var httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            console.log(httpRequest);

            var data = JSON.parse(httpRequest.responseText);

            if (httpRequest.status === 200) {
                callback(null, data);
            } else {
                callback(new Error('There was a problem with the request.'), data);
            }
        }
    };

    httpRequest.open(method, url, true);
    httpRequest.setRequestHeader('Content-Type', 'application/json');
    httpRequest.send(data ? JSON.stringify(data) : null);
}
