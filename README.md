# Esprit Education Management System

A comprehensive education management system built with Next.js, TypeScript, and Supabase, featuring role-based access control for teachers and administrators.

## 🚀 Features

### Core Functionality
- **Classroom Management** - Manage classrooms and class assignments
- **Schedule Management** - Handle class schedules and timetables
- **Student Management** - Comprehensive student information system
- **Grade Management** - Track and manage student grades
- **Teacher Management** - Manage teacher profiles and assignments

### Role-Based Access Control
- **Teacher Role** - Basic access to classroom and schedule management
- **Admin Role** - Full access including student and teacher management
- **Secure Authentication** - JWT-based authentication with role validation
- **Protected Routes** - Role-based route protection and middleware

### Advanced Features
- **Excel Import/Export** - Bulk data operations for students and grades
- **PDF Schedule Import** - Automated schedule processing from PDF files
- **Real-time Updates** - Live data synchronization
- **Responsive Design** - Mobile-friendly interface
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
- `role` - User role ('teacher' or 'admin')
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

### Students (Admin Only)
- `GET /api/students` - Get students by class
- `POST /api/students` - Add new student
- `POST /api/students/import-excel` - Import students from Excel
- `GET /api/students/import-excel` - Get import format info

### Teachers
- `GET /api/teachers` - Get all teachers (with roles)
- `POST /api/teachers` - Create new teacher
- `POST /api/teachers/upload-photo` - Upload teacher photo
- `POST /api/teachers/update-role` - Update teacher role (Admin only)
- `GET /api/teachers/classes` - Get teacher's classes

### Notes (Admin Only)
- `GET /api/notes/subjects` - Get subjects
- `GET /api/notes/students` - Get students for notes
- `POST /api/notes/update` - Update student notes
- `POST /api/notes/import-excel` - Import notes from Excel
- `GET /api/notes/export` - Export notes to CSV

## 🔒 Security Features

- **Role-Based Access Control** - Teacher and Admin roles with different permissions
- **JWT Authentication** - Secure token-based authentication
- **Route Protection** - Middleware-based route protection
- **Input Validation** - Email and password value objects
- **SQL Injection Protection** - Parameterized queries
- **Password Hashing** - Bcrypt password hashing

## 🏃‍♂️ Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📋 Database Migration

To add role-based functionality to an existing database, run the following SQL migration:

```sql
-- Add role column to teacher table
ALTER TABLE teacher 
ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'teacher' 
CHECK (role IN ('teacher', 'admin'));

-- Update existing teachers to have 'teacher' role by default
UPDATE teacher 
SET role = 'teacher' 
WHERE role IS NULL OR role = '';

-- Create an index on the role column for better performance
CREATE INDEX idx_teacher_role ON teacher(role);
```

## 🎯 Role Permissions

### Teacher Role
- View and manage assigned classrooms
- View and manage class schedules
- View and manage class timetables
- Update personal profile and photo

### Admin Role
- All Teacher permissions
- Manage all students (add, edit, delete, import/export)
- Manage all teachers (view, update roles)
- Manage all grades and notes
- Access to system-wide statistics and reports
- Import/export functionality for all data

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd esprit-app-V0.1-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Run database migration**
   ```bash
   # Execute the database_migration.sql script in your Supabase database
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Create an admin user**
   - Register a new teacher account
   - Use the database migration script to set the role to 'admin'
   - Or use the teacher management interface (if you have admin access)

## 📱 Usage

1. **Login** - Use your email and password to access the system
2. **Role-based Navigation** - The sidebar will show different options based on your role
3. **Teacher Features** - Manage classrooms, schedules, and personal profile
4. **Admin Features** - Access to all features including student and teacher management

## 🔧 Architecture

The application follows a clean architecture pattern with:

- **Domain Layer** - Core business entities and value objects
- **Application Layer** - Use cases and DTOs
- **Infrastructure Layer** - Repositories, services, and external integrations
- **Presentation Layer** - React components and hooks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
