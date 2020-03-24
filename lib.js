// @ref https://stackoverflow.com/questions/1714786/query-string-encoding-of-a-javascript-object
function http_build_query(obj) {
    let str = [];
    for(let p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}

function getBaseUrl() {
    return 'http://localhost:5000';
}

function call_api(method, _uri, params, cookie=null, timeout = 60000) {
    return new Promise((resolve, reject) => {

        let request = new XMLHttpRequest();

        let uri = getBaseUrl() + _uri;
        if(method === 'GET') uri += '?' + http_build_query(params);

        request.open(method, uri, true);

        request.timeout = timeout; // 60 seconds
        request.ontimeout = () => {
            reject('Hệ thống đang quá tải, xin vui lòng chờ trong giây lát');
        };

        request.onerror = () => {
            reject('Không thể kết nối với máy chủ');
        };

        request.onload = () => {
            if(request.status === 200) {
                resolve(request.responseText);
            } else {
                reject(request.responseText);
            }
        };

        if(cookie !== null) request.setRequestHeader('Cookie', cookie);

        if(method === 'POST') {
            let data = new FormData();
            for(let key in params) data.append(key, params[key]);
            request.send(data);
        } else {
            request.send();
        }
    });
}

let number_of_requests = 0;

async function myexec(command) {

    if(number_of_requests > 50) {
        console.log('Cancel request myexec', command);
        throw 'Server is too busy';
    }

    try {
        number_of_requests++;
        let text = await call_api('GET', '/myexec', {command});
        number_of_requests--;
        return JSON.parse(text);
    } catch(e) {
        number_of_requests--;
        if(e) showAlert(e);
        throw e;
    }
}

function trigger(name, params) {
    var event = new CustomEvent(name, {detail: params});
    document.dispatchEvent(event);
}

function bind(name, fn) {
    document.addEventListener(name,e => fn(e.detail));
}

function showMessage(message, title = '') {
    trigger('show-message', {message, title});
}

function hideMessage() {
    trigger('hide-message');
}

function showWindow(message, title = '', fn = null, min_width = 0, min_height = 'auto') {
    trigger('show-window', {message, title, fn, min_width, min_height});
}

function hideWindow() {
    trigger('hide-window');
}

function showCustom(message, title = '') {
    trigger('show-message', {message, title});
}

function hideCustom() {
    trigger('hide-message');
}

function showYamlEditor(type, name) {
    showWindow(<YamlEditor type={type} name={name} />, 'Yaml Editor')
}

function showAlert(message) {
    message = message || '(No response from server)';
    trigger('show-alert', {message});
}

function joinForDisplay(arr) {
    // @ref https://stackoverflow.com/questions/18749591/encode-html-entities-in-javascript
    return arr.map(item => {
        return item.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
            return '&#'+i.charCodeAt(0)+';';
        }).replace(/ /g,'&nbsp');
    }).join('<br/>');
}

async function describe(type, name) {
    let cmd = `kubectl describe ${type} ${name}`;
    showWindow('', cmd, async () => {
        let json = await myexec(cmd);
        return joinForDisplay(json);
    });
}

async function detectDefaultContextAndNamespace() {
    let json = await myexec('kubectl config get-contexts');
    let text = json.join('<br/>').replace(/ /g,'&nbsp');
    let contexts = json.map(item => {
        item = item.replace(/\s\s+/g, ' ');
        let pieces = item.split(' ');
        return {
            current: pieces[0],
            name: pieces[1],
            cluster: pieces[2],
            authinfo: pieces[3],
            namespace: pieces[4],
        }
    });
    contexts = contexts.slice(1);
    let selected = '';
    contexts.forEach(item => selected = item.current === '*' ? item : selected);
    if(selected === '') return ['', ''];
    return [selected.name, selected.namespace];
}

function ajaxSubmitFiles(file, url, additional_params) {
    return new Promise((resolve, reject) => {

        // Create a new FormData object.
        let formData = new FormData();

        // Add the file to the request.
        formData.append('file', file, file.name);

        if(additional_params)
            for(let key in additional_params)
                formData.append(key, additional_params[key]);

        // Set up the request.
        let request = new XMLHttpRequest();

        // Open the connection.
        request.open('POST', url, true);

        // Set up a handler for when the request finishes.
        request.onload = function () {
            if (request.status === 200)
                resolve();
            else
                reject('An error occurred!');
        };

        // Send the Data.
        request.send(formData);
    });
}
