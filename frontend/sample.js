// CWE-20: Improper Input Validation
function validateInput(input) {
    // Using jQuery to validate input
    if (/^[a-zA-Z0-9]+$/.test(input)) {
        console.log("Valid input");
    } else {
        console.log("Invalid input");
    }
}

// CWE-79: Cross-site Scripting (XSS)
function renderContent(content) {
    // Safely rendering content
    const div = document.createElement('div');
    div.textContent = content; // Using textContent to prevent XSS
    document.body.appendChild(div);
}

// CWE-352: Cross-Site Request Forgery (CSRF)
function sendRequestWithCSRFToken(url, data, csrfToken) {
    // Sending request with CSRF token
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': csrfToken // Including CSRF token in headers
        },
        body: JSON.stringify(data)
    }).then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
}

// CWE-601: URL Redirection to Untrusted Site ('Open Redirect')
function redirectToUrl(url) {
    // Validating URL before redirecting
    const trustedDomains = ['example.com', 'trusted.com'];
    const urlObj = new URL(url);
    if (trustedDomains.includes(urlObj.hostname)) {
        window.location.href = url;
    } else {
        console.log('Untrusted URL');
    }
}