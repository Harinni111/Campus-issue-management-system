CAMPUS ISSUE MANAGEMENT SYSTEM

A full-stack Campus Issue Management System designed to streamline issue reporting, tracking, and resolution within a campus environment.
The system supports role-based access for Admin, Manager, and Employee, ensuring secure and efficient issue handling.

Features:
Authentication & Authorization
1.Secure JWT-based authentication
2.Role-based access control:
  Admin
  Manager
  Employee
3.Protected routes using middleware

Issue Management:
1.Employees can raise issues
2.Managers can review and update issue status
3.Admins have full control over issues and users
4.Issues stored and retrieved efficiently using CouchDB

Role-Based Dashboards:
Separate dashboards for:
Admin
Manager
Employee

Clean and simple UI using HTML, CSS, JavaScript
Tech Stack:
Backend
Node.js
Express.js
CouchDB
JWT (JSON Web Tokens)

Frontend
HTML
CSS
JavaScript

Tools & Libraries:
bcrypt (password hashing)
nano (CouchDB client)
express-validator
cors
