
function fetch_some_data() { 
    // Example of making a request to the SSRF endpoint with additional logging
    const targetUrl = 'http://example.com';
    console.log(`Attempting to fetch data from: ${targetUrl}`);
    fetch(`http://localhost:3003/fetch?url=${encodeURIComponent(targetUrl)}`)
    .then(response => {
        console.log(`Response status: ${response.status}`);
        return response.text();
    })
    .then(data => {
        console.log('Fetched data:', data);
    })
    .catch(error => {
        console.error('Error during fetch operation:', error);
    });
}

function vulnerable_localStorage() { 
    // Example of insecurely storing sensitive data with a warning
    const sensitiveData = '12345';
    console.warn('Storing sensitive data in localStorage is insecure!');
    localStorage.setItem('userToken', sensitiveData);
    console.log('Sensitive data stored in localStorage:', sensitiveData);
}

function insecure_eval() { 
    // Example of using eval with user input and additional explanation
    const userInput = prompt("Enter some JavaScript code:");
    console.log('User input received for eval:', userInput);
    try {
        eval(userInput); // Using eval on user input is dangerous and can lead to XSS
    } catch (error) {
        console.error('Error executing user input with eval:', error);
    }
}

function open_redirect() { 
    // Example of open redirect vulnerability with additional checks
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');
    console.log('Redirect URL received:', redirectUrl);
    if (redirectUrl) {
        if (isValidUrl(redirectUrl)) {
            console.log('Redirecting to:', redirectUrl);
            window.location.href = redirectUrl; // Redirecting based on user input can lead to phishing attacks
        } else {
            console.warn('Invalid redirect URL detected:', redirectUrl);
        }
    }
}

function isValidUrl(url) {
    // Basic validation to check if the URL is safe
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

function subtle_vulnerability() {
    const userInput = prompt("Enter a URL to fetch data from:");
    console.log('User input received for URL fetch:', userInput);
    if (userInput && isValidUrl(userInput)) {
        fetch(userInput) // This can lead to SSRF if the input is not properly validated
        .then(response => response.text())
        .then(data => {
            console.log('Data fetched from user-provided URL:', data);
        })
        .catch(error => {
            console.error('Error fetching data from user-provided URL:', error);
        });
    } else {
        console.warn('Invalid URL provided by user:', userInput);
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    console.log('Document fully loaded and parsed.');
    fetch_some_data();
    vulnerable_localStorage();
    insecure_eval();
    open_redirect();
    subtle_vulnerability();
});