# GMCC Hospital Token Management System - Project Documentation

## 1. Executive Summary
The **GMCC Hospital Token Management System** is a comprehensive digital solution designed to streamline the Outpatient Department (OPD) queueing and token booking process. It eliminates the need for physical queues by providing a mobile application for patients to book tokens remotely and for doctors to manage their patient flow efficiently. Additionally, it offers a robust web-based administrative dashboard for hospital staff to oversee operations, manage offline bookings, and administer system settings.

## 2. Product Vision & Objectives
**Vision:** To provide a seamless, transparent, and efficient healthcare experience by digitizing queue management, thereby minimizing wait times for patients and optimizing the workflow for medical professionals.

**Objectives:**
- Enable patients to book doctor appointments (tokens) remotely via a mobile app.
- Provide real-time queue visibility for patients to avoid unnecessary crowding in hospital waiting areas.
- Equip doctors with a digital interface to manage their patient queues seamlessly.
- Empower hospital administrators with a centralized dashboard to manage doctors, units, users, and walk-in (offline) appointments.

## 3. Target Users & Roles
The system is built to cater to three primary user roles:
1. **Patients (Users):** Can register, view available doctors/units, book tokens, track live queue status, and receive notifications.
2. **Doctors:** Can log into the mobile app to view their assigned unit's queue, call the next patient, and mark consultations as completed.
3. **Hospital Administrators:** Have access to the web dashboard to oversee all operations, generate offline tokens for walk-in patients, manage user/doctor/unit data, and broadcast notifications.

## 4. Scope of Work
The project encompasses three interconnected subsystems:
1. **Backend REST API (`hospital-token-backend`):** A secure, scalable Laravel application that handles all business logic, database transactions, and authentication.
2. **Mobile Application (`patient_app`):** A cross-platform Flutter application serving both Patients and Doctors with distinct interfaces based on their roles.
3. **Web Dashboard (`hospital-token-frontend`):** A React-based web application tailored exclusively for hospital administrators.

## 5. Functional Requirements
- **Authentication & Authorization:** Secure role-based login for Patients, Doctors, and Admins.
- **Unit & Doctor Management:** Admins can create hospital units (departments/shifts) and assign doctors to them.
- **Token Booking System:** Patients can view unit availability and book tokens for a specific date. Admins can generate offline tokens.
- **Queue Management:** Real-time tracking of token status (Pending, Current, Completed, Cancelled). Doctors can progress the queue by calling the next token.
- **Notification System:** Broadcast important updates to patients via the mobile app.

## 6. End-to-End Workflows
- **Patient Booking Workflow:** Patient logs into the mobile app $\rightarrow$ Selects a unit/doctor $\rightarrow$ Books a token $\rightarrow$ Receives a token number $\rightarrow$ Tracks the live queue to see the currently called token $\rightarrow$ Attends consultation when called.
- **Doctor Consultation Workflow:** Doctor logs into the mobile app $\rightarrow$ Selects their assigned unit $\rightarrow$ Views the list of pending tokens $\rightarrow$ Clicks "Call Next" $\rightarrow$ Conducts consultation $\rightarrow$ Marks as "Completed".
- **Admin Management Workflow:** Admin logs into the web dashboard $\rightarrow$ Monitors daily token statistics $\rightarrow$ Generates offline tokens for walk-in patients $\rightarrow$ Manages doctor schedules and unit timings.

## 7. Used Technology Stack
- **Backend API:** Laravel 11.x, PHP 8.2+, SQLite/MySQL, Laravel Sanctum (Token-based Auth).
- **Mobile Application:** Flutter 3.x (Dart), Riverpod (State Management), Dio (Networking), GoRouter, Drift (Local DB).
- **Web Frontend:** React 19.x, Vite, React Router, Axios, Lucide React (Icons).

## 8. System Architecture
The system follows a standard **Client-Server Architecture**.
- The **Laravel Backend** acts as the central data provider, exposing RESTful JSON APIs.
- The **Flutter Mobile App** and **React Web App** act as independent clients consuming these APIs.
- Data consistency is maintained through relational database constraints, and rate limiting is applied at the API gateway to prevent abuse.

## 9. Database Blueprint
The relational database is structured around the following core entities:
- **`users`**: Stores patient records (`crno`, `name`, `user_age`, `user_gender`, `password`).
- **`doctors`**: Stores doctor profiles (`name`, `qualification`, `department`, `regno`, `unit_id`).
- **`units`**: Represents a specific shift/department (`name`, `day`, `start_time`, `slot_duration`).
- **`bookings`**: The central transactional table for tokens (`user_id`, `unit_id`, `type`, `token_number`, `booking_date`, `status`).
- **`hospitals`**: Admin credentials for the web dashboard (`name`, `email`, `password`).
- **`notifications`**: System-wide announcements (`title`, `message`).

## 10. API Specification Blueprint
- **Authentication (`/api/user/login`, `/api/doctor/login`, `/api/hospital/login`)**: Role-specific login endpoints returning Sanctum bearer tokens.
- **Patient Endpoints (`/api/booking/*`)**: Create booking, view availability, cancel token.
- **Doctor Endpoints (`/api/doctor/*`)**: Get queue, call next patient, mark completed.
- **Admin Endpoints (`/api/hospital/*`)**: Full CRUD operations for Users, Doctors, Units, and Bookings. Includes offline token generation.

## 11. Used Repository Structure
```
Gmcc_hospital_Token_Full_Code_Updated/
├── hospital-token-backend/     # Laravel 11 RESTful API backend
│   ├── app/Models/             # Eloquent Models (User, Doctor, Booking, etc.)
│   ├── app/Http/Controllers/   # API Controllers
│   ├── database/migrations/    # Database Schema Definitions
│   └── routes/api.php          # API Route Definitions
├── hospital-token-frontend/    # React 19 Admin Web Dashboard
│   ├── src/pages/              # Dashboard Views (Home, Login, Dashboard)
│   └── src/components/         # Reusable UI Components
└── patient_app/                # Flutter 3 Cross-Platform Mobile App
    └── lib/screens/            # App Screens (Login, Booking, Doctor Queue)
```

## 12. Non-Functional Requirements
- **Performance:** APIs must respond within 200ms to ensure the mobile app feels real-time.
- **Scalability:** The backend must handle concurrent booking requests gracefully (especially during morning token openings).
- **Usability:** The mobile app must have a highly intuitive UI/UX for elderly patients. The Admin dashboard must be data-dense but readable.

## 13. Security & Privacy
- **Authentication:** All protected API endpoints enforce Laravel Sanctum middleware.
- **Role-Based Access Control (RBAC):** Middleware restrictions ensure Patients cannot access Doctor endpoints, and vice-versa.
- **Data Protection:** Passwords are fully hashed (Bcrypt/Argon2). 
- **Rate Limiting:** API requests are throttled (e.g., 30 requests/min for Auth routes) to prevent brute-force attacks.

## 14. Development Methodology
The project follows a **Component-Based Architecture** and an iterative Agile development approach. The backend was developed API-first, allowing the mobile and web frontend teams to build and test their UI components in parallel. 

## 15. Used MVP Scope
The currently implemented Minimum Viable Product (MVP) covers:
- Complete end-to-end token booking cycle (Online & Offline).
- Real-time queue progression by doctors.
- Web-based management dashboard for hospital administrators.
- Basic notification system.

## 16. Future Scope
- **Online Payments:** Integration with payment gateways for paid consultations.
- **EMR Integration:** Linking patient tokens directly to an Electronic Medical Record (EMR) system.
- **Real-time WebSockets:** Transitioning from polling to WebSocket-based real-time queue updates.
- **Analytics & Reporting:** Advanced data visualization on the Admin dashboard for peak hours, doctor performance, and patient demographics.
- **Multi-language Support:** Adding localization to the mobile app for regional languages.
