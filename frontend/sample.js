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
// True positive: Only allows redirect to trusted domains
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

// False positive 1: Only allows redirect to internal paths (not external URLs)
function redirectToInternalPath(path) {
    // Only allow redirect to internal paths, not full URLs
    if (typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')) {
        window.location.pathname = path;
    } else {
        console.log('Invalid path');
    }
}

// False positive 2: Redirect target is set by the server, not user input
function redirectToServerSetUrl() {
    // The redirect URL is hardcoded or set by the server, not user-controlled
    const serverUrl = '/dashboard';
    window.location.pathname = serverUrl;
}

// False positive 3: Using a fixed set of allowed values
function redirectToFixedPage(page) {
    // Only allow redirect to a fixed set of pages
    const allowedPages = {
        home: '/home',
        profile: '/profile',
        settings: '/settings'
    };
    if (allowedPages[page]) {
        window.location.pathname = allowedPages[page];
    } else {
        console.log('Page not allowed');
    }
}

// False positive 4: Using a client-side router that restricts navigation
function clientSideRouterRedirect(route) {
    // Simulate a client-side router that only allows internal navigation
    const allowedRoutes = ['/home', '/about', '/contact'];
    if (allowedRoutes.includes(route)) {
        // e.g., React Router's history.push(route)
        console.log(`Navigating to ${route}`);
    } else {
        console.log('Route not allowed');
    }
}