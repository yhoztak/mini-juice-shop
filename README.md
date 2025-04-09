# Vulnerable Juice Shop

This project is a deliberately vulnerable application designed for testing and educational purposes. It includes various vulnerabilities in both the front-end and back-end.

## Prerequisites

- Node.js installed on your machine

## Starting the Application

The application consists of multiple backend services running on different ports. Follow the steps below to start each service:

1. **Backend Services**

   Open a terminal and navigate to the project directory. Then, run the following commands in separate terminal windows to start each service:

   - Start the main backend service:
     ```bash
     node backend/app.js
     ```

   - Start the IDOR service:
     ```bash
     node backend/idor.js
     ```

   - Start the Insecure Deserialization service:
     ```bash
     node backend/insecure_deserialization.js
     ```

   - Start the SSRF service:
     ```bash
     node backend/ssrf.js
     ```

   - Start the Business Logic service:
     ```bash
     node backend/business_logic.js
     ```

   - Start the Race Condition service:
     ```bash
     node backend/race_condition.js
     ```

2. **Front-end**

   Open the `frontend/index.html` file in a web browser to interact with the application.

## Interacting with the Application

The front-end provides forms and scripts to interact with the back-end services. You can test various vulnerabilities by submitting forms or observing the console output in the browser.

**Note:** This application is for educational purposes only. Do not deploy it in a production environment.