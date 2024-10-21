# Full Stack API Project

This project is focused on building a robust and scalable API using Node.js, Express, and MongoDB. The project demonstrates best practices for API development, including error handling, authentication, and CRUD operations with a clean and maintainable codebase.

---

## **Table of Contents**
1. [Environment Setup](#environment-setup)
2. [Express Server Setup](#express-server-setup)
3. [Middleware & Logging](#middleware--logging)
4. [Error Handling & Security](#error-handling--security)
5. [API Features](#api-features)
6. [Authentication & Authorization](#authentication--authorization)
7. [Advanced Features](#advanced-features)
8. [Category & Product CRUD](#category--product-crud)
9. [File Upload & Cloudinary](#file-upload--cloudinary)

---

## **Environment Setup**

1. Install Node.js and MongoDB.
2. Clone the repository and navigate to the project directory.
3. Run `npm install` to install the required dependencies.
4. Create a `.env` file and add environment variables.
5. Add `.gitignore` to exclude sensitive data.

---

## **Express Server Setup**

1. Initialize an Express server:
    ```bash
    npm init -y
    npm install express
    ```
2. Set up the basic server:
    ```javascript
    const express = require('express');
    const app = express();
    const port = process.env.PORT || 5000;

    app.listen(port, () => console.log(`Server running on port ${port}`));
    ```

---

## **Middleware & Logging**

1. **Nodemon**: Install `nodemon` to restart the server automatically after code changes:
   ```bash
   npm install --save-dev nodemon


