# GMCC Hospital Token System

A comprehensive hospital token booking system consisting of a web-based admin panel and an Android mobile application for managing and booking medical appointments at Medical College Chest Hospital, Thrissur.

## Overview

This system allows patients to book tokens for doctor consultations through a mobile app, while doctors can view their appointment schedules. Hospital administrators can manage doctors, units, users, and bookings through a web interface.

## Workspace Folder Mapping

In this repository, the actual folder names are:

- `hospital-token-backend/`: PHP-based admin panel and API backend for the hospital token system.
- `hospital-token-frontend/`: Web frontend project.
- `patient_app/`: Android mobile application for patients and doctors.
- `sample_patients_import.csv`: Example CSV file for bulk user import.

The README refers to `project-web/` for the backend and `Token_App/` for the Android app; in this workspace those correspond to `hospital-token-backend/` and `patient_app/` respectively.

## Components

### 1. Web Admin Panel (project-web/)

A PHP-based web application for hospital administration.

#### Tech Stack

##### Frontend
- **Language**: PHP, HTML, CSS, JavaScript
- **Framework**: Bootstrap
- **Libraries**: jQuery, Owl Carousel, Font Awesome

##### Backend
- **Server**: PHP
- **Database**: MySQL
- **PDF Generation**: dompdf

#### Features

##### Admin Features
- **Admin Login**: Secure login for hospital administrators
- **Unit Management**: Add, view, edit, and delete hospital units
- **Doctor Management**: Add, view, edit, and delete doctors with their qualifications, departments, and schedules
- **User Management**: Add users via CSV upload or individual entry, view user details
- **Booking Management**: View all bookings, approve/reject bookings, view bookings by date, export data
- **Dashboard**: Overview of hospital operations with navigation menus

##### General Features
- **Responsive Design**: Mobile-friendly interface
- **Session Management**: Secure admin sessions
- **Data Export**: CSV and PDF export functionality
- **Public Homepage**: Information about the hospital with contact details

#### Project Structure

```
project-web/
├── index.php                 # Public homepage
├── Home.php                  # Admin dashboard
├── Signin.php                # Admin login
├── Signout.php               # Logout
├── connect.php               # Database connection
├── Header.php                # Common header
├── Footer.php                # Common footer
├── Login_Header.php          # Login page header
├── Add_unit.php              # Add hospital unit
├── View_unit.php             # View/edit units
├── edit_unit.php             # Edit unit
├── delete_unit.php           # Delete unit
├── Add_doctors.php           # Add doctor
├── View_doctors.php          # View doctors
├── edit_doctors.php          # Edit doctor
├── delete_doctors.php        # Delete doctor
├── Add_UsersCSV.php          # Bulk user import
├── Add_users.php             # Add single user
├── View_users.php            # View users
├── edit_users.php            # Edit user
├── delete_users.php          # Delete user
├── View_users_bookings.php   # Approve bookings
├── View_booking_all.php      # View all bookings
├── View_booking_bydate.php   # View bookings by date
├── Approve_bookings.php      # Approve bookings
├── Reject_bookings.php       # Reject bookings
├── export.php                # Data export
├── Android/                  # API endpoints for mobile app
│   ├── User_login.php
│   ├── Doctor_login.php
│   ├── view_units.php
│   ├── User_doctor_view.php
│   ├── doctor_view.php
│   ├── changestatus.php
│   ├── Booking.php
│   ├── cancel.php
│   └── Your_current_booking.php
├── css/                      # Stylesheets
├── js/                       # JavaScript files
├── images/                   # Images
├── fonts/                    # Fonts
└── db/
    └── db_hospital.sql       # Database schema
```

#### API Endpoints

The web panel serves as the backend API for the Android app:

- `Android/User_login.php` - User authentication
- `Android/Doctor_login.php` - Doctor authentication
- `Android/view_units.php` - Get hospital units
- `Android/User_doctor_view.php` - View doctors
- `Android/doctor_view.php` - Doctor's booking view
- `Android/changestatus.php` - Update booking status
- `Android/Booking.php` - Create new booking
- `Android/cancel.php` - Cancel booking
- `Android/Your_current_booking.php` - Get user's bookings

#### Build and Run

1. **Prerequisites**:
   - Web server (Apache/Nginx)
   - PHP 7.0+
   - MySQL 5.7+
   - phpMyAdmin (optional, for database management)

2. **Setup Database**:
   ```bash
   # Import database schema
   mysql -u username -p database_name < db/db_hospital.sql
   ```

3. **Configure Database Connection**:
   - Edit `connect.php` with your database credentials
   - Default: Remote database at gmcchtsrtoken.com

4. **Deploy to Web Server**:
   - Upload all files to web root
   - Ensure PHP and MySQL are running
   - Access admin panel at `your-domain.com/Signin.php`

5. **Default Admin Credentials**:
   - Email: hospital@gmail.com
   - Password: hospital

### 2. Android Application (Token_App/)

An Android application for booking appointment tokens at Thrissur Govt. Medical College Chest Hospital (GMCCH).

#### Tech Stack

##### Frontend
- **Language**: Java
- **Framework**: Android SDK
- **Build Tool**: Gradle 8.9.3
- **Minimum SDK**: API 26 (Android 8.0)
- **Target SDK**: API 35 (Android 15)
- **Compile SDK**: API 36

##### Libraries and Dependencies
- **UI Components**: AndroidX AppCompat, Material Design, ConstraintLayout, RecyclerView, CardView
- **Navigation**: AndroidX Navigation Component
- **Networking**: Volley
- **Image Loading**: Picasso
- **JSON Parsing**: Gson
- **Lifecycle Management**: AndroidX Lifecycle (ViewModel, LiveData)
- **Testing**: JUnit, Espresso

##### Backend
- **Server**: PHP-based API hosted at https://gmcchtsrtoken.com/
- **Database**: MySQL

#### Features

##### User Features
- **User Registration/Login**: Secure login using CR number and credentials
- **View Doctors and Units**: Browse available doctors and hospital units
- **Book Appointments**: Schedule tokens for next day's consultations based on unit numbers
- **View Current Bookings**: Check upcoming appointments
- **Cancel Bookings**: Cancel existing appointments
- **Profile Management**: View and manage user profile

##### Doctor Features
- **Doctor Login**: Secure authentication for medical staff
- **View Patient Bookings**: See scheduled appointments for their unit
- **Manage Appointment Status**: Update booking statuses (e.g., confirm, complete)

##### General Features
- **Splash Screen**: App launch screen
- **Bottom Navigation**: Easy navigation between home and bookings
- **About Section**: Information about the app and hospital
- **Privacy Policy**: Terms and conditions dialog
- **Offline Support**: Basic offline functionality (limited)

#### Project Structure

```
app/src/main/java/gmcch/vast/token/
├── MainActivity.java          # Main app activity with navigation
├── SplashScreen.java          # Launch screen
├── About.java                 # About page
├── Config.java                # API endpoints configuration
├── SharedPrefManager.java     # Shared preferences for user data
├── UserSharedPrefManager.java # User-specific preferences
├── Adapter/                   # RecyclerView adapters
│   ├── CustomDoctorListAdapter.java
│   ├── DoctorUserViewAdapter.java
│   └── MybookingviewAdapter.java
├── Doctor/                    # Doctor-related activities
│   ├── DoctorHomePage.java
│   └── DoctorLogin.java
├── ModelClass/                # Data models
│   ├── DoctorUserView.java
│   ├── DoctorlistModelclass.java
│   ├── MyBookingModelClass.java
│   ├── UnitModelclass.java
│   └── Users.java
├── User/                      # User-related activities
│   ├── UserHomePage.java
│   ├── UserLogin.java
│   └── ViewCurentBooking.java
└── ui/                        # Navigation fragments
    ├── home/
    └── notifications/
```

#### API Endpoints

- `User_login.php` - User authentication
- `Doctor_login.php` - Doctor authentication
- `view_units.php` - Get hospital units
- `User_doctor_view.php` - View doctors
- `doctor_view.php` - Doctor's booking view
- `changestatus.php` - Update booking status
- `Booking.php` - Create new booking
- `cancel.php` - Cancel booking
- `Your_current_booking.php` - Get user's bookings

#### Build and Run

1. **Prerequisites**:
   - Android Studio (latest version recommended)
   - JDK 8 or higher
   - Android SDK API 36

2. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Token_App
   ```

3. **Open in Android Studio**:
   - Open Android Studio
   - Select "Open an existing Android Studio project"
   - Navigate to the Token_App directory

4. **Build the project**:
   - Sync Gradle files
   - Build > Make Project

5. **Run on device/emulator**:
   - Connect Android device or start emulator
   - Run > Run 'app'

#### Release Build

The project includes release configuration with:
- ProGuard enabled for code obfuscation
- Resource shrinking
- Signed APK generation

Release keystore: `upload-key.jks` (password: 12345678, alias: gectoken)

## Database Schema

### Tables:
- `tbl_hospital`: Admin credentials
- `tbl_units`: Hospital units/departments
- `tbl_doctor`: Doctor information
- `tbl_user`: Patient information
- `tbl_booking`: Appointment bookings with tokens

## System Architecture

- **Frontend (Web)**: Responsive Bootstrap-based interface
- **Backend**: PHP with MySQL database
- **Mobile App**: Android app connecting to PHP APIs
- **Communication**: RESTful API calls using Volley

## Security Features

- Secure login for admins, doctors, and users
- Session management
- Input validation
- Password hashing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## License

This project is proprietary software for GMCCH. All rights reserved.

## Contact

For support or inquiries, contact the development team at GMCCH.

Medical College Chest Hospital Thrissur  
Phone: 0487-2200610  
Website: https://gmcchtsrtoken.com/

## License

Creative Commons Attribution 3.0 Unported