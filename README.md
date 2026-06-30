# Art Museum Management Web Application

A full-stack web application for managing art museum catalogs and online ticket reservations.

## Features
* **Role-Based Access Control:** JWT-based authentication with distinct permissions for Guests, Visitors, and Admins.
* **Concurrent-Safe Booking:** Prevents race conditions and double bookings using PostgreSQL `SERIALIZABLE` transactions and `FOR UPDATE` row-level locks.
* **Catalog Management:** CRUD operations, text search, and advanced filtering for exhibitions and artworks.
* **Automated Testing:** E2E UI coverage for critical workflows using Python and Selenium WebDriver.

## Tech Stack
* **Frontend:** TypeScript, React, Next.js
* **Backend:** TypeScript, Node.js, NestJS
* **Database & ORM:** PostgreSQL, Sequelize
* **Infrastructure:** Docker, Docker Compose, Nginx
