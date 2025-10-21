# Student Dashboard Implementation

## Overview
This implementation provides a comprehensive Student Dashboard that matches the provided screenshot design with the following features:

### Features Implemented:
1. **Student Profile Display**
   - Student photo (with fallback placeholder)
   - Name, Student ID, Email, Contact Number
   - Dynamic data fetching from database

2. **Overview Cards**
   - Student Details card with profile information
   - QR Code display (generated during registration)
   - Enrolled Classes count
   - Payment History (newest 3 entries)

3. **Mobile-Friendly Responsive Design**
   - Grid layout that adapts to different screen sizes
   - Cards stack vertically on mobile devices
   - Clean, modern UI with proper spacing

4. **Dynamic Data Integration**
   - Real-time API calls to fetch student data
   - Payment history from database
   - Error handling and loading states

## Database Setup

### 1. Payment Table
Use your existing payment table with the following structure:
```sql
CREATE TABLE payment (
 PaymentID INT AUTO_INCREMENT PRIMARY KEY,
 ClassID VARCHAR(50),
 StudentID VARCHAR(50),
 Payment INT,
 Year VARCHAR(4),
 Month VARCHAR(100),
 PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP
) AUTO_INCREMENT = 1001;
```

### 2. Add Sample Data (Optional)
To test payment history functionality:
```sql
-- Run backend/sample_payment_data.sql
```

## API Endpoints Created

### 1. `get_student_profile.php`
- **Method**: GET
- **Purpose**: Fetches student profile data and enrolled classes count
- **Authentication**: Required (session-based)
- **Response**: Student profile info and enrollment count

### 2. `get_payment_history.php`
- **Method**: GET
- **Purpose**: Fetches latest 3 payment records for the student
- **Authentication**: Required (session-based)
- **Response**: Array of payment history records

### 3. `uploads.php`
- **Method**: GET
- **Purpose**: Serves uploaded images (photos, QR codes)
- **Security**: Only serves files from uploads/ directory

## File Structure
```
backend/api/
├── get_student_profile.php    # Student profile API
├── get_payment_history.php    # Payment history API
├── uploads.php               # File serving endpoint
└── uploads/                  # Upload directory
    ├── [student_photos]
    └── [qr_codes]

frontend/src/pages/HomePage/Student/
└── StudentDashboard.jsx      # Main dashboard component
```

## Usage
1. Ensure the student is logged in with proper session
2. Navigate to Student Dashboard from the sidebar
3. The dashboard will automatically load student data and payment history
4. All data is fetched dynamically from the database

## Error Handling
- Loading states while fetching data
- Error messages for failed API calls
- Fallback UI for missing data (photos, QR codes)
- Graceful handling of empty payment history

## Responsive Design
- **Desktop**: 2x2 grid layout
- **Tablet**: 2x2 grid with adjusted spacing
- **Mobile**: Single column stacked layout
- Cards maintain proper proportions across all screen sizes
