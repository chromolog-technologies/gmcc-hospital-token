# GMCC Hospital Patient Portal — Complete Project Documentation

> **Version:** 2.0.0 | **Last Updated:** October 2026  
> **Maintained by:** Chromolog Technologies

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Database Schema](#4-database-schema)
5. [Backend API Reference](#5-backend-api-reference)
6. [Admin Web Portal (Frontend)](#6-admin-web-portal-frontend)
7. [Patient Mobile App](#7-patient-mobile-app)
8. [Token Assignment Engine](#8-token-assignment-engine)
9. [Firebase Push Notification System](#9-firebase-push-notification-system)
10. [Deployment & CI/CD](#10-deployment--cicd)
11. [New Features Added (v2.0)](#11-new-features-added-v20)
12. [Old Version vs New Version — Comparison](#12-old-version-vs-new-version--comparison)
13. [Known Rules & Business Logic](#13-known-rules--business-logic)
14. [User Roles & Access Control](#14-user-roles--access-control)

---

## 1. Project Overview

The **GMCC Hospital Patient Portal** is a multi-platform token management system built for **Government Medical College and Cooperative Hospital (GMCC)**. It replaces the traditional physical queuing process with a fully digital token booking and queue management solution.

### What this system does:
- Allows **cancer patients** (Chemo/Radiation/Oncology) to book appointment tokens via a mobile app
- Provides **hospital admin staff** a web dashboard to manage all users, doctors, units, bookings, and notifications
- Provides **doctors** a dedicated mobile interface to view their daily patient queue and call patients one by one
- Issues **real-time push notifications** to patients (e.g., when their token is called)

### Who uses this system:

| Role | Platform | Access Level |
|------|----------|-------------|
| **Patient / User** | Flutter Mobile App (Android) | Book tokens, cancel bookings, view notifications |
| **Doctor** | Flutter Mobile App (Android) | View assigned unit queue, call next patient, mark completed |
| **Hospital Admin** | React Web Dashboard | Full control over all data and operations |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   GMCC TOKEN SYSTEM                         │
│                                                             │
│  ┌──────────────┐    ┌─────────────────┐    ┌───────────┐  │
│  │  Patient App  │    │  Admin Web       │    │ Doctor    │  │
│  │  (Flutter)    │    │  (React/Vite)    │    │ App       │  │
│  │              │    │                 │    │ (Flutter) │  │
│  └──────┬───────┘    └────────┬────────┘    └─────┬─────┘  │
│         │                    │                    │         │
│         └────────────────────┴────────────────────┘         │
│                              │                              │
│                    ┌─────────▼──────────┐                  │
│                    │  Laravel REST API  │                   │
│                    │  (PHP / Sanctum)   │                   │
│                    └─────────┬──────────┘                  │
│                              │                              │
│              ┌───────────────┴───────────────┐             │
│              │                               │             │
│    ┌─────────▼──────────┐    ┌───────────────▼──────────┐  │
│    │  MySQL Database    │    │  Firebase Cloud           │  │
│    │  (Hostinger VPS)   │    │  Messaging (FCM)          │  │
│    └────────────────────┘    └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Backend
| Component | Technology |
|-----------|-----------|
| Framework | Laravel 11 (PHP) |
| Authentication | Laravel Sanctum (token-based) |
| Database | MySQL |
| Push Notifications | Firebase Cloud Messaging (FCM) v1 API |
| Hosting | Hostinger VPS (Port 65002) |
| Rate Limiting | Laravel throttle middleware |

### Admin Web Frontend
| Component | Technology |
|-----------|-----------|
| Framework | React 18 with Vite |
| Styling | Vanilla CSS (custom design system) |
| Icons | Lucide React |
| HTTP Client | Axios |
| Build | Vite production build |

### Patient & Doctor Mobile App
| Component | Technology |
|-----------|-----------|
| Framework | Flutter / Dart |
| State Management | Flutter Riverpod |
| Navigation | go_router |
| HTTP | Dio |
| Offline Storage | Drift (SQLite) |
| Secure Storage | flutter_secure_storage |
| Push Notifications | firebase_messaging |
| App Version | 2.0.0+12 |

---

## 4. Database Schema

### `users` table (Patients)
| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `name` | varchar | Patient full name |
| `crno` | varchar | Hospital CR (Case Record) number, unique identifier |
| `user_age` | int | Patient age |
| `user_gender` | varchar | Patient gender |
| `password` | varchar | Hashed password |
| `fcm_token` | varchar | Firebase device token for push notifications |
| `created_at` | timestamp | Registration date |

### `doctors` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `name` | varchar | Doctor full name |
| `regno` | varchar | Medical registration number (login username) |
| `unit_id` | int | Assigned unit/department |
| `password` | varchar | Hashed password |

### `units` table (Departments)
| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `name` | varchar | Unit/Department name (e.g., "Radiation Oncology - Unit2") |
| `day` | varchar | Operating days (comma-separated, e.g., "Monday,Wednesday,Friday") |
| `time` | varchar | Operating time display string |
| `start_time` | time | Formal start time |
| `slot_duration` | int | Minutes per patient slot |

### `bookings` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `user_id` | int | FK → users |
| `unit_id` | int | FK → units |
| `token_number` | int | Assigned token number |
| `booking_date` | date | The date of the appointment |
| `status` | enum | `pending`, `active`, `completed`, `cancelled` |
| `source` | varchar | `online`, `offline-walkin`, `offline-staff` |
| `type` | enum | `chemo`, `followup` |
| `created_at` | timestamp | When the booking was made |

### `hospitals` table (Admin account)
| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `name` | varchar | Hospital name |
| `email` | varchar | Admin login email |
| `password` | varchar | Hashed password |
| `auto_approve_bookings_until` | timestamp | Controls when auto-approval is active until |

### `notifications` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `title` | varchar | Notification headline |
| `message` | text | Notification body content |
| `created_at` | timestamp | When the notification was published |

---

## 5. Backend API Reference

**Base URL:** `https://[hostinger-domain]/api`
**Authentication:** Bearer token via Laravel Sanctum

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/user/login` | Patient login with CR number + password |
| `POST` | `/doctor/login` | Doctor login with regno + password |
| `POST` | `/hospital/login` | Admin login with email + password |
| `GET` | `/units` | List all available departments/units |

### Patient Endpoints (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/booking/availability` | Get available token slots for a unit |
| `POST` | `/booking/create` | Book a token (online, for next day) |
| `GET` | `/booking/my-bookings` | Get all bookings for logged-in user |
| `POST` | `/booking/cancel` | Cancel a booking (within allowed window) |
| `GET` | `/notifications` | Fetch all hospital notifications |
| `POST` | `/logout` | Logout (invalidate token) |

### Doctor Endpoints (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/doctor/queue/{unit_id}` | Get today's patient queue for a unit |
| `GET` | `/doctor/current/{unit_id}` | Get the current active token being served |
| `POST` | `/doctor/call-next` | Mark current patient complete and advance queue |
| `POST` | `/doctor/complete` | Mark a specific booking as completed |

### Admin Endpoints (Auth Required)

#### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/hospital/dashboard/summary` | Today + tomorrow booking stats |
| `GET` | `/hospital/dashboard/units` | Per-unit booking breakdown |
| `GET` | `/hospital/dashboard/doctors` | Per-doctor patient stats |

#### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/hospital/users` | List all patients (searchable by CR#) |
| `POST` | `/hospital/users` | Register a single patient |
| `POST` | `/hospital/users/bulk` | Bulk import patients via CSV/JSON |
| `GET` | `/hospital/users/{id}` | Get patient details |
| `PUT` | `/hospital/users/{id}` | Update patient information |
| `DELETE` | `/hospital/users/{id}` | Delete a patient |

#### Doctor Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/hospital/doctors` | List all doctors |
| `POST` | `/hospital/doctors` | Add a new doctor |
| `GET` | `/hospital/doctors/{id}` | Get doctor details |
| `PUT` | `/hospital/doctors/{id}` | Update doctor information |
| `DELETE` | `/hospital/doctors/{id}` | Remove a doctor |

#### Unit Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/hospital/units` | Create a new unit/department |
| `PUT` | `/hospital/units/{id}` | Update unit details |
| `DELETE` | `/hospital/units/{id}` | Remove a unit |

#### Booking Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/hospital/bookings` | List today's bookings |
| `GET` | `/hospital/bookings/availability` | Get slot availability |
| `POST` | `/hospital/bookings/offline` | Book an offline token (walk-in or staff) |
| `PUT` | `/hospital/bookings/{id}/status` | Update booking status (approve/cancel) |
| `GET` | `/hospital/bookings/settings` | Get auto-approve settings |
| `PUT` | `/hospital/bookings/auto-approve` | Toggle/set auto-approve window |

#### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/hospital/notifications` | List all notifications |
| `POST` | `/hospital/notifications` | Create & push a new notification |
| `PUT` | `/hospital/notifications/{id}` | Edit a notification |
| `DELETE` | `/hospital/notifications/{id}` | Delete a notification |

---

## 6. Admin Web Portal (Frontend)

A single-page React application deployed to Hostinger alongside the backend.

### Dashboard Tabs

#### Overview Tab
- Displays today's date and a live summary card
- Shows total bookings for today and tomorrow
- Stats breakdown: Pending, Active/Approved, Completed, Cancelled counts
- Per-unit booking stats (Chemo / Follow-up count per department)
- Per-doctor activity (patients seen vs. waiting today)

#### Users Tab
- Full CRUD for patient management
- Search by CR Number
- Register individual patients with: Name, CR Number, Age, Gender, Password
- Bulk import via JSON upload
- Edit and delete existing patients
- Date display formatted as `dd-MM-yyyy`

#### Doctors Tab
- Full CRUD for doctor accounts
- Assign doctors to specific units
- View doctor profile with their assigned unit
- Manage login credentials (registration number + password)

#### Units Tab
- Create and manage hospital departments/units
- Set operating days (checkboxes for Mon-Sun)
- Configure time slots and appointment duration

#### Bookings Tab
- View all bookings for today in a table
- Columns: Patient name, CR#, Unit, Date (dd-MM-yyyy), Token#, Source badge (ONLINE / WALK-IN / STAFF), Type badge (CHEMO / FOLLOWUP), Status badge
- Approve or Cancel individual pending bookings
- **Offline Token Booking form:** Select patient, unit, type (Chemo/Followup), source (Walk-in or Staff)
- **Auto-Approve toggle:** Automatically approves pending online bookings after 1 hour

#### Notifications Tab
- Create new hospital-wide announcements
- Edit existing notifications
- Delete notifications
- All created notifications are simultaneously pushed to all patients via Firebase FCM

---

## 7. Patient Mobile App

A Flutter Android app for patients to self-manage their hospital appointments.

### Screens

| Screen | Purpose |
|--------|---------|
| Splash Screen | Hospital branding, auto-navigate on auth state |
| Login | CR Number + password authentication |
| Home | View units, upcoming bookings, announcements |
| Booking | Select type, check availability, confirm booking |
| My Token | View active token, cancel booking |
| My Bookings | Full booking history |
| Notifications | Hospital announcements list |
| Doctor Login | Separate login for doctors (regno + password) |
| Doctor Dashboard | Queue summary for assigned unit |
| Doctor Queue | Patient queue, Call Next, Mark Completed |
| Department Doctors | Public doctor listing per department |

---

## 8. Token Assignment Engine

The core of the system, implemented in `BookingService.php`.

### Token Pools (per unit per day)

| Range | Type | Source | Slots |
|-------|------|--------|-------|
| 1–150 | Chemo | Online | ~64 tokens (even-tens, non-5/0 endings) |
| 1–150 | Chemo | Staff (offline-staff) | 30 tokens (multiples of 5) |
| 1–150 | Chemo | Walk-in (offline-walkin) | ~56 tokens (remaining) |
| 151–300 | Followup | Any source | 150 tokens (sequential) |

### Token Number Rules

**Online Chemo:** Alternating block pattern — tens digit must be even (0, 2, 4, 6, 8) and units digit cannot be 0 or 5. Examples: 1, 2, 3, 4, 6, 7, 8, 9, 21, 22...

**Staff tokens:** Multiples of 5 within 1–150 (5, 10, 15... 150) — exactly **30 slots**

**Walk-in tokens:** All remaining numbers in 1–150 not claimed by online or staff rules

**Followup tokens:** Sequential 151–300, shared by all sources

### Key Rules

- **One token per patient per day** — enforced for both online and offline bookings
- **Booking date:** Online → Next clinic day | Offline → Today
- **Cancelled tokens are reused** — freed numbers are reassigned to the next patient
- **Concurrency:** DB transactions with `lockForUpdate()`, up to 5 retries on deadlock

### Booking Status Flow

```
Online:   [pending] --1hr auto-approve--> [active] --> [completed]
                    \-> [cancelled]
Offline:  [active] --> [completed]
          \-> [cancelled]
```

### Auto-Approval
When enabled by admin, pending online bookings older than 1 hour are automatically promoted to `active` status on every API call.

---

## 9. Firebase Push Notification System

Implemented in `FirebaseService.php` using the **FCM v1 HTTP API**.

### Flow
1. Backend reads Service Account JSON from `storage/app/firebase_credentials.json`
2. Generates OAuth2 JWT using RSA private key
3. Exchanges JWT for Bearer access token
4. Posts notification to FCM v1 endpoint

### Topics

| Topic | Triggered By |
|-------|-------------|
| `all_patients` | Admin creates a notification |
| `unit_{unit_id}` | Doctor calls the next token |

### Flutter App Side
- Subscribes to `all_patients` on login
- Subscribes to unit topic when a token is active
- Shows in-app notification list AND system tray alerts

---

## 10. Deployment & CI/CD

**Pipeline:** GitHub Actions (triggered on `push` to `main`)
1. Code pushed to GitHub
2. GitHub Actions transfers files to **Hostinger VPS** via `appleboy/scp-action`
3. Server runs `composer install` and/or `npm run build`

**Server:** Hostinger VPS | **API Port:** 65002

---

## 11. New Features Added (v2.0)

| Feature | Description |
|---------|-------------|
| **Firebase Push Notifications** | FCM v1 integration — admin broadcasts + doctor call-next alerts |
| **Admin Web Portal** | Complete React dashboard (responsive, premium UI) |
| **Walk-in vs Staff Offline Booking** | Admin selects source type; staff gets multiples-of-5 tokens |
| **Cancelled Token Re-use** | Freed tokens are reclaimed by next patient in sequence |
| **Global Duplicate Booking Guard** | One token per patient per day, enforced for ALL sources |
| **Date Format Standardization** | All dates shown as `dd-MM-yyyy` throughout the web portal |
| **Bookings Table Cleanup** | Removed doctor name and timestamp; shows unit and date only |
| **Custom App Icon & Splash** | Hospital "T" logo used as app icon; native Android splash screen |
| **Auto-Approve Setting** | Admin-controlled automatic approval after 1-hour pending window |
| **Doctor Call-Next Notification** | Push alert sent to patient when their token is called |
| **CI/CD Pipeline** | Automated deployment via GitHub Actions → Hostinger |

---

## 12. Old Version vs New Version — Comparison

| Feature | Old Version (v1.x) | New Version (v2.0) |
|---------|-------------------|-------------------|
| **Admin Interface** | Basic/minimal | Full React dashboard, responsive design |
| **Push Notifications** | Not implemented | FCM v1 — broadcast + targeted |
| **Offline Booking Types** | Single `offline` source | `offline-walkin` and `offline-staff` |
| **Staff Token Pool** | No concept | Multiples of 5 (30 slots max) |
| **Duplicate Booking Guard** | Online bookings only | All sources (online + offline) |
| **Cancelled Token Re-use** | Cancelled slots wasted | Freed tokens assigned to next patient |
| **Date Format** | ISO timestamp (raw) | `dd-MM-yyyy` everywhere |
| **Bookings Table** | Doctor name + timestamp shown | Unit name + date only |
| **Mobile Responsive UI** | Desktop only | Fully responsive with mobile navbar |
| **Doctor Call Next** | View queue only | Call Next + Complete + Firebase alert |
| **App Icon** | Generic icon | Hospital "T" logo |
| **Splash Screen** | Flutter secondary splash | Native Android splash with branding |
| **App Version** | 1.x | 2.0.0+12 |
| **Notification Tab** | None | Full CRUD + push delivery |
| **Auto-Approve** | Not available | Toggle in admin portal |
| **CI/CD** | Manual deployment | GitHub Actions → Hostinger auto-deploy |
| **Concurrency Safety** | Basic | DB transactions + lockForUpdate() + 5 retries |
| **Token Overwrite on Cancel** | Throws duplicate error | Safely overwrites cancelled record |

---

## 13. Known Rules & Business Logic

### Booking Day Shift
The "current booking day" shifts at **6:00 AM IST** (not midnight). Before 6 AM → still the previous booking day.

### Unit Operating Days
Each unit has specific days. Patients and admins cannot book for a unit on a non-operating day.

### Token Capacity (Per Unit Per Day)
| Type | Slots |
|------|-------|
| Chemo — Online | ~64 |
| Chemo — Staff | 30 |
| Chemo — Walk-in | ~56 |
| Followup — All | 150 |
| **Total** | **~300** |

### Cancellation
- Patients can cancel `pending` or `active` bookings
- Admin can cancel any `pending` or `active` booking
- App enforces a 1-hour grace window in the UI (within 1 hour of booking)
- Backend does not enforce time restriction (enforced at app level)

---

## 14. User Roles & Access Control

| Role | Model | Login Field | Can Access |
|------|-------|-------------|------------|
| `patient` | `User` | CR Number | Own bookings, notifications |
| `doctor` | `Doctor` | Registration Number | Assigned unit queue only |
| `admin` | `Hospital` | Email | All endpoints |

- All routes use **Laravel Sanctum** bearer token authentication
- Role middleware enforces access at route-group level
- Doctor unit check: each doctor endpoint validates `doctor.unit_id == requested unit_id`
- Rate limiting: 60 req/min globally, 30 req/min on login endpoints
- Passwords stored as **bcrypt hashes**

---

*Documentation generated: October 2026 — GMCC Hospital Token System v2.0*
