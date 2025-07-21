# Esprit Teacher Management System

A modern, secure teacher management platform built with Next.js 15, TypeScript, and MySQL, following clean architecture principles.

## 🚀 Features

- **JWT Authentication** - Secure teacher login with JWT tokens
- **MySQL Database** - Production-ready database integration
- **Clean Architecture** - Properly structured domain, application, infrastructure, and presentation layers
- **TypeScript** - Full type safety throughout the application
- **Modern UI** - Beautiful, responsive interface with Tailwind CSS
- **Password Security** - Bcrypt hashing with 12 salt rounds
- **Excel Import** - Bulk student import from Excel files with validation and error handling

## 📊 Excel Import Feature

### Overview
The Excel import feature allows teachers to bulk import student data from Excel files (.xlsx, .xls) with comprehensive validation and error handling.

### Supported File Format
- **File Types**: .xlsx, .xls
- **Max File Size**: 10MB
- **Max Rows**: 1000 students per file
- **Required Columns**:
  - `prenom` - Student first name
  - `nom` - Student last name
  - `email` - Student email address
  - `numeroetudiant` - Student number (format: YYYY + 6 digits)
- **Optional Columns**:
  - `datenaissance` - Birth date (various formats supported)

### Excel Template
Download the template from the import modal or create an Excel file with the following structure:

```
| prenom | nom     | email                    | numeroetudiant | datenaissance |
|--------|---------|--------------------------|----------------|---------------|
| Ahmed  | Ben Ali | ahmed.benali@esprit.tn   | 2021001234     | 15/03/2001    |
| Fatima | Zahra   | fatima.zahra@esprit.tn   | 2022005678     | 22/07/2002    |
```

### Features
- **Drag & Drop Interface** - Modern file upload with drag-and-drop support
- **Real-time Validation** - Validates data format, email addresses, and student numbers
- **Progress Tracking** - Shows import progress with detailed feedback
- **Error Reporting** - Comprehensive error messages for invalid data
- **Duplicate Handling** - Option to skip or overwrite existing students
- **Batch Processing** - Processes large files in batches for optimal performance

## 📄 PDF Schedule Import Feature

### Overview
The PDF import feature allows teachers to extract schedule data from PDF files containing timetable information. The system uses a Python script with pdfplumber to parse PDF tables and extract structured schedule data.

### Supported File Format
- **File Types**: .pdf
- **Max File Size**: 10MB
- **Expected Format**: PDF with tables containing schedule information
- **Table Structure**: 
  - Column 1: Day and Date
  - Column 2+: Time slots with subject, class, and room information

### Features
- **Drag & Drop Interface** - Modern file upload with drag-and-drop support
- **PDF Table Extraction** - Automatically extracts table data from PDF files
- **Data Visualization** - Displays extracted schedule data in a structured format
- **Error Handling** - Graceful fallback to mock data if Python script fails
- **Real-time Processing** - Shows extraction progress and results immediately

### Setup Requirements
1. **Python Dependencies**: Install required Python packages
   ```bash
   pip install -r requirements.txt
   ```

2. **Python Script**: The `extract_schedule.py` script must be in the project root
   - Uses pdfplumber library for PDF processing
   - Extracts table data and converts to JSON format
   - Handles various PDF table structures

3. **API Integration**: The system calls the Python script via Node.js child process
   - Uploads PDF to server
   - Calls Python script to extract data
   - Returns structured JSON response
   - Falls back to mock data if extraction fails

### Expected PDF Structure
The PDF should contain tables with the following structure:
```
| Day/Date    | Morning (8:00-12:00) | Afternoon (14:00-18:00) |
|-------------|----------------------|-------------------------|
| Lundi       | 08:00-10:00          | 14:00-16:00            |
| 15/01/2024  | Mathématiques        | Informatique           |
|             | 3A55                 | 3A55                   |
|             | Salle 101            | Salle Info 1           |
```

### Extracted Data Format
The system extracts and displays:
- **Day**: Day of the week (Lundi, Mardi, etc.)
- **Date**: Date in DD/MM/YYYY format
- **Events**: Array of schedule events containing:
  - **Time**: Time slot (e.g., "08:00-10:00")
  - **Subject**: Course name (e.g., "Mathématiques")
  - **Class**: Class identifier (e.g., "3A55")
  - **Room**: Classroom location (e.g., "Salle 101")

### Usage
1. Navigate to the Student Management page (`/gestion-etudiants`)
2. Select a class from the classroom management page
3. Click the "Importer" button (green button with spreadsheet icon)
4. Drag and drop your Excel file or browse to select it
5. Review the file format requirements and validation results
6. Choose whether to overwrite existing students
7. Click "Import Students" to process the file
8. Review the import results and any errors

### API Endpoints
- `POST /api/students/import-excel` - Import students from Excel file
- `GET /api/students/import-excel` - Get import format information

### Validation Rules
- **Email**: Must be valid email format
- **Student Number**: Must follow format YYYY + 6 digits (e.g., 2021001234)
- **Birth Date**: Must be a valid date, student must be at least 16 years old
- **Names**: Cannot be empty, max 50 characters each
- **Duplicates**: Checked by email and student number

### Error Handling
- Invalid file format or corrupted files
- Missing required columns
- Invalid data formats
- Duplicate student records
- Database connection errors
- File size and row limits

## 🏗️ Architecture

```
src/
├── core/                   # Domain Layer
│   ├── entities/          # Business entities (Teacher, AuthToken, Etudiant)
│   ├── interfaces/        # Repository and service contracts
│   └── value-objects/     # Value objects (Email, Password, StudentNumber)
├── application/           # Application Layer
│   ├── dtos/             # Data transfer objects
│   └── use-cases/        # Business use cases (ImportStudentsFromExcelUseCase)
├── infrastructure/        # Infrastructure Layer
│   ├── config/           # Database configuration
│   ├── repositories/     # Database implementations
│   ├── services/         # External services (JWT, ExcelImportService)
│   └── middleware/       # Authentication middleware
└── presentation/          # Presentation Layer
    ├── components/       # React components (ExcelImportModal)
    ├── hooks/           # Custom React hooks
    └── pages/           # Page components
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd work
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your database credentials:
   ```env
   JWT_SECRET=your-super-secure-secret-key
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_NAME=esprit_db
   ```

4. **Setup MySQL database**
   ```bash
   mysql -u root -p < database-setup.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Application: http://localhost:3000
   - Login: http://localhost:3000/login

## 🔐 Authentication

The system uses JWT-based authentication with the following features:

- **Secure Password Hashing** - Bcrypt with 12 salt rounds
- **JWT Tokens** - 24-hour expiration
- **HTTP-Only Cookies** - Secure token storage
- **Email Validation** - Domain-level validation
- **Last Login Tracking** - Audit trail for security

## 📊 Database Schema

### Teacher Table
- `id` - Auto-increment primary key
- `firstname` - Teacher's first name
- `lastname` - Teacher's last name  
- `email` - Unique email address (login identifier)
- `departement` - Academic department
- `motdepasse` - Bcrypt hashed password
- `is_active` - Soft delete flag
- `last_login` - Last authentication timestamp
- `created_at` - Record creation timestamp
- `updated_at` - Record modification timestamp

### Student Table (Etudiant)
- `id` - Auto-increment primary key
- `firstname` - Student's first name
- `lastname` - Student's last name
- `email` - Unique email address
- `classe_id` - Foreign key to classe table
- `numero_etudiant` - Unique student number
- `date_naissance` - Birth date (optional)
- `is_active` - Soft delete flag
- `created_at` - Record creation timestamp
- `updated_at` - Record modification timestamp

### Class Table (Classe)
- `id` - Auto-increment primary key
- `nom` - Class name
- `niveau` - Academic level
- `specialite` - Specialization
- `bloc` - Building block
- `capacite_max` - Maximum capacity
- `is_active` - Soft delete flag

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Teacher authentication
- `GET/POST /api/auth/validate` - Token validation
- `POST /api/auth/logout` - Logout (clear cookies)

### Students
- `GET /api/students` - Get students by class
- `POST /api/students` - Add new student
- `POST /api/students/import-excel` - Import students from Excel
- `GET /api/students/import-excel` - Get import format info

### Teachers
- `POST /api/teachers/upload-photo` - Upload teacher photo
- `GET /api/teachers/classes` - Get teacher's classes

## 🏃‍♂️ Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔒 Security Features

- **Input Validation** - Email and password value objects
- **SQL Injection Protection** - Parameterized queries
- **Password Requirements** - Minimum 8 characters with letters and numbers
- **Secure Headers** - HTTP-only cookies, secure flags
- **Error Handling** - Generic error messages to prevent information leakage
- **File Upload Security** - File type validation, size limits, virus scanning

## 🌟 Clean Architecture Benefits

- **Testability** - Easy to unit test business logic
- **Maintainability** - Clear separation of concerns
- **Scalability** - Easy to extend and modify
- **Independence** - Database and framework agnostic core
- **Flexibility** - Easy to swap implementations

## 📦 Technologies

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MySQL 8.0+
- **Authentication**: JWT (jose), bcryptjs
- **Icons**: Lucide React
- **Excel Processing**: xlsx library
- **File Upload**: Native HTML5 File API with drag-and-drop

## 🚀 Production Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Use a secure JWT secret (32+ characters)
   - Configure production database credentials
   - Enable HTTPS

2. **Security Checklist**
   - Update JWT secret key
   - Enable secure cookie flags
   - Set up proper CORS policies
   - Configure rate limiting
   - Enable request logging
   - Set up file upload restrictions

## 👥 Contributing

1. Follow clean architecture principles
2. Write tests for business logic
3. Use TypeScript for type safety
4. Follow the existing code structure
5. Update documentation

## 📄 License

This project is proprietary software for Esprit University.
