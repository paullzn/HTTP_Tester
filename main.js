

function makeRequest() {
    data = collectData();
    console.log(data);
    _loadURL(data.url, this, _onResponse, data.options)
}

function collectData() {
    var ret = {options: {}};
    ret.url = document.getElementById('url').value;
    ret.options.method = document.getElementById('get').checked ? 'GET' : 'POST';
    return ret;
}

function _onResponse(responseText, options) {
    document.getElementById('response_data').innerHTML = responseText;
    if (options) {
        document.getElementById('response_header').innerHTML = options.responseHeaders;
    }
}


function _loadURL(url, receiver, callback, options) {
    var xhr = new XMLHttpRequest();
    xhr.url = url;

    xhr.onreadystatechange = function() {
        _onLoadURLResult(xhr);
    };

    if (options.method != "POST") {
        options.method = "GET";
    }
    xhr.method = options.method;

    options.receiver = receiver;
    options.callback = callback;
    options.reqUrl = url;
    xhr.options = options;

    // Apply basic auth if username/password is in options
    if (options.auth_username && options.auth_password) {
        xhr.open(options.method, url, true, options.auth_username, options.auth_password);
    } else {
        xhr.open(options.method, url, true);
    }

    if (options.headers) {
        for (var key in options.headers) {
            xhr.setRequestHeader(key, options.headers[key]);
        }
    }
        
    if (options.content_type) {
        xhr.setRequestHeader("Content-type", options.content_type);
    }
    if (options.hasOwnProperty("compress") && options.compress) {
        xhr.setRequestHeader("X-Compress", "gzip");
    }

    console.log("loadURL: " + url);

    if (options.method != "POST") {
        xhr.send();
    }
    else {
        if (!options.body) {
            options.body = "";
        }
        xhr.setRequestHeader('Content-length', options.body.length);
        xhr.send(options.body);
    }
}

function _onLoadURLResult(xhr) {
    if (xhr.readyState == 4) { // DONE
        if (xhr.status != 200) {
            console.log("URL request returned status: " + xhr.status + " for URL " + xhr.url + " and method " + xhr.method);
            if (xhr.options.errorCallback) {
                xhr.options.errorCallback.call(xhr.options.receiver, xhr.status, {
                    errorMessage: xhr.statusText,
                    data: xhr.responseText
                });
            } else {
                console.log("loadURL error: " + xhr.status + " msg: " + xhr.statusText);
            }
        } else {
            xhr.options.responseHeaders = xhr.getAllResponseHeaders();
            if (xhr.options.xmlparse) {
                xhr.options.callback.call(xhr.options.receiver, $htv.Platform.XML.stringToXMLDoc(xhr.responseText), xhr.options);
            } else {
                xhr.options.callback.call(xhr.options.receiver, xhr.responseText, xhr.options);
            }
        }
        xhr.options = null;
    }
}
