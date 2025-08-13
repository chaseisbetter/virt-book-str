# Eternal Ink Books - A Fantasy & Romance Bookstore

Welcome to Eternal Ink Books, a full-featured web application for a boutique bookstore specializing in fantasy and romance novels. This project was built to be a modern, user-friendly, and visually stunning online experience.

## Features Implemented

- **Full User Authentication:** Secure user registration and login system.
- **Protected User Profile Page:** A dedicated page for logged-in users.
- **Dynamic Homepage:** Features sections for featured books and collections.
- **Advanced Book Catalog:**
    - Displays all books in a grid layout.
    - **Live Search:** Full-text search across titles and authors.
    - **Fuzzy Search:** The search is tolerant of typos and partial matches.
    - **Filtering:** Filter books by genre, price, and minimum rating.
    - **Sorting:** Sort the catalog by popularity (default), price, and rating.
    - **Pagination:** A "Load More" button to handle large catalogs.
- **Detailed Book Page:**
    - A unique page for each book with a two-column layout.
    - Displays extended description, author bio, and other details.
    - **Customer Reviews System:** Users can view existing reviews and submit their own.
    - **Related Books Section:** Shows other books from the same genre.
- **Dark Mode:** A site-wide dark/light mode toggle that persists user preference.
- **Responsive Design:** The layout adapts smoothly to all screen sizes, from mobile to desktop.

## Project Structure

```
.
├── api/
│   ├── controllers/  // Holds the logic for API routes
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── searchController.js
│   │   └── userController.js
│   └── routes/         // Defines the API routes
│       ├── auth.js
│       ├── books.js
│       ├── search.js
│       └── users.js
├── data/
│   ├── books.json      // A simple file-based database for books
│   └── users.json      // A simple file-based database for users
├── public/             // All static frontend files
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── book.js
│   │   ├── profile.js
│   │   ├── search.js
│   │   └── script.js
│   ├── images/
│   ├── book.html
│   ├── index.html
│   ├── login.html
│   ├── profile.html
│   ├── search.html
│   └── signup.html
├── .gitignore
├── package.json
├── package-lock.json
└── server.js           // The main Express server entry point
```

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Install dependencies:**
    You will need to have Node.js and npm installed. Run the following command in the root directory to install all required packages.
    ```bash
    npm install
    ```

## Running the Application

To start the web server, run the following command from the root directory:

```bash
npm start
```

This will start the server on `http://localhost:3000`. You can then open your web browser and navigate to this address to view the application.

### Development Mode

For development, you can use `nodemon` to automatically restart the server when files are changed:

```bash
npm run dev
```

### Known Issues & Environment Notes

-   **Server Environment:** The application was developed in a sandboxed environment that had issues running the Node.js server and the Playwright test runner simultaneously. The `npm start` command is the most reliable way to run the server and should work as expected in a standard local Node.js environment.
-   **User Authentication in Reviews:** The "user" for a new review is currently hardcoded as 'BookWyrm' in `public/book.js`. In a full implementation, this should be replaced with the currently logged-in user's information.
