# How RoamNest Works: The Tech Stack Explained

This document is a beginner-friendly guide to understand the architecture of the RoamNest application. It's designed to help you explain the project during your presentation.

## 1. The Big Picture

RoamNest is a modern web application separated into two main parts:
1. **Frontend (The Client):** Built with React. This is the visual interface running in the user's web browser.
2. **Backend (The Server):** Built with Java Spring Boot. This runs on a server and handles logic, security, and data.

These two parts are completely independent programs that talk to each other over the internet using **HTTP requests** (just like how your browser talks to google.com).

## 2. The Frontend: React (Vite)

**What it is:** React is a JavaScript library for building user interfaces. We use Vite as a build tool because it is incredibly fast for local development safely.

**How it works:**
*   React builds the page out of reusable pieces called **Components** (like `Login` or `Home`).
*   Instead of the server sending a new HTML page every time you click a link, React swaps out the components dynamically in the browser. This makes the app feel extremely fast (this is called a Single Page Application or SPA).
*   **State:** React remembers information (like "is the user logged in?" or "what is their role?") using *State*. When state changes, React automatically updates the screen.

## 3. The Backend: Java Spring Boot

**What it is:** Spring Boot is a powerful framework for building Java applications. It makes it easy to create robust, secure web servers.

**How it works in RoamNest:**
*   **API Endpoints:** The backend provides specific "URLs" that the frontend can interact with. For example, `POST /api/login`. 
*   **Spring Security:** We use this to protect the application. It acts as a bouncer, checking user credentials (username and password) and determining their **Role** (Admin, Owner, or User).
*   **JSON:** When our React frontend asks for data or logs in, the Spring Boot server responds with text in a format called JSON (JavaScript Object Notation). It looks like this: `{"role": "ADMIN"}`.

## 4. How They Connect (The Flow)

Let's trace what happens when someone logs in to RoamNest:

1.  **User Action:** The user types their username and password on the React login page and clicks "Login".
2.  **The Request (Frontend -> Backend):** React takes that input and sends a special message (an HTTP POST request) to the Spring Boot server at `http://localhost:8080/api/login`.
3.  **The Verification (Backend):** Spring Security inside the Java server checks if the username and password match any users in our records.
4.  **The Response (Backend -> Frontend):** 
    *   If correct: Spring Boot replies with a success code (`200 OK`) and the user's role: `{"role": "OWNER"}`.
    *   If wrong: Spring Boot replies with an error code (`401 Unauthorized`).
5.  **The Update (Frontend):** React receives the response. Because the login was successful and the role is "OWNER", React updates its *State* and automatically swaps the `Login` component for the `Home` component, showing the Owner-specific dashboard!

## 5. What is RBAC?
RBAC stands for **Role-Based Access Control**. 
It simply means that what a user can see or do on the site depends on their assigned label (their role).
- **ADMIN:** Can see everything and manage the whole platform.
- **OWNER:** Can see options to list new properties on RoamNest.
- **USER:** Can only see properties and book them.

By keeping the React frontend and Spring Boot backend separate, the frontend only has to care about *displaying* the UI based on the role it's given, while the backend focuses on securely *verifying* who the user is.
