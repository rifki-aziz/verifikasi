# Document Verification System - Pondok Pesantren Lirboyo

A modern, responsive document verification system built with React frontend and PHP backend for Pondok Pesantren Lirboyo Kediri.

## 🚀 Features

### User Features
- **Document Verification**: Verify document authenticity by entering document number
- **Document Viewing**: View original document images (JPG format)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations

### Admin Features
- **Document Management**: Add new documents to the system
- **Multi-Signer Selection**: Choose multiple signers with searchable dropdown
- **File Upload**: Upload document images (JPG/PNG format)
- **Real-time Validation**: Form validation with user feedback

### Technical Features
- **Secure Backend**: PHP-based REST API with input validation
- **Database Integration**: MySQL database with proper relationships
- **File Management**: Secure file upload and storage system
- **CORS Support**: Cross-origin resource sharing for frontend integration

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

### Backend
- **PHP 7.4+** with PDO
- **MySQL 5.7+** database
- **RESTful API** architecture
- **JSON** data format

## 📋 Prerequisites

### For Development
- Node.js 16+ and npm
- PHP 7.4+ with PDO extension
- MySQL 5.7+ or MariaDB
- Web server (Apache/Nginx) or local development server

### For Production
- Web hosting with PHP 7.4+ support
- MySQL database access
- File upload permissions
- HTTPS recommended

## 🚀 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd document-verification-system
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### 3. Backend Setup

#### Database Configuration
1. Create a MySQL database
2. Import the database schema:
```sql
-- Run the SQL commands in backend/database/schema.sql
```

3. Configure database connection in `backend/config/database.php`

#### File Permissions
```bash
# Set proper permissions for upload directory
chmod 755 backend/uploads/
chmod 644 backend/uploads/.htaccess
```

#### Web Server Configuration
- Upload all `backend/` files to your web hosting
- Ensure `uploads/` directory is writable
- Configure virtual host to point to backend directory

### 4. Configuration

#### Frontend Configuration
Update API endpoints in your frontend code:
```javascript
// Replace localhost with your domain
const API_BASE_URL = 'https://yourdomain.com/api';
```

#### Backend Configuration
Update `backend/config/database.php`:
```php
<?php
define('DB_HOST', 'your-database-host');
define('DB_NAME', 'your-database-name');
define('DB_USER', 'your-database-username');
define('DB_PASS', 'your-database-password');
?>
```

## 📊 Database Schema

### Tables Structure

#### `documents`
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `nomor_dokumen` (VARCHAR(50), UNIQUE)
- `judul` (TEXT)
- `file_jpg` (VARCHAR(255))
- `created_at` (TIMESTAMP)

#### `signers`
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `nama` (VARCHAR(100))
- `jabatan` (VARCHAR(100))

#### `document_signers`
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `document_id` (INT, FOREIGN KEY)
- `signer_id` (INT, FOREIGN KEY)

## 🔌 API Endpoints

### Document Verification
```
GET /api/verify.php?nomor_dokumen={document_number}
```

### Get All Signers
```
GET /api/signers.php
```

### Create Document
```
POST /api/documents.php
Content-Type: multipart/form-data

Fields:
- nomor_dokumen: string
- judul: string
- signers: array of signer IDs
- file: image file (JPG/PNG)
```

### Get Document Image
```
GET /api/uploads/{filename}
```

## 🎨 Design System

### Color Palette
- **Primary Green**: #22c55e
- **Secondary Emerald**: #10b981
- **Accent Orange**: #f97316
- **Success**: #16a34a
- **Error**: #dc2626
- **Warning**: #ca8a04

### Typography
- **Headings**: Inter font family, 120% line height
- **Body Text**: Inter font family, 150% line height
- **Font Weights**: Regular (400), Medium (500), Bold (700)

### Spacing System
- Based on 8px grid system
- Consistent margins and padding
- Responsive breakpoints: 640px, 768px, 1024px, 1280px

## 🔒 Security Features

### Input Validation
- Server-side validation for all inputs
- File type and size restrictions
- SQL injection prevention with prepared statements
- XSS protection with output escaping

### File Upload Security
- Restricted file types (JPG, PNG only)
- File size limits (10MB maximum)
- Secure file naming and storage
- Directory traversal prevention

### Database Security
- Prepared statements for all queries
- Proper error handling without information disclosure
- Database connection security

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Features
- Fluid layouts with CSS Grid and Flexbox
- Responsive typography scaling
- Touch-friendly interface elements
- Optimized images and assets

## 🚀 Deployment

### Frontend Deployment
1. Build the project: `npm run build`
2. Upload `dist/` contents to your web server
3. Configure web server for SPA routing

### Backend Deployment
1. Upload all `backend/` files to your hosting
2. Create MySQL database and import schema
3. Configure database connection
4. Set proper file permissions
5. Test API endpoints

### Production Checklist
- [ ] Database connection configured
- [ ] File upload directory writable
- [ ] HTTPS enabled
- [ ] Error reporting disabled in production
- [ ] API endpoints accessible
- [ ] CORS headers configured
- [ ] File size limits set appropriately

## 🧪 Testing

### Manual Testing
1. **Document Verification**
   - Test with valid document numbers
   - Test with invalid document numbers
   - Verify error handling

2. **Admin Panel**
   - Test document creation
   - Test file upload functionality
   - Test signer selection

3. **Responsive Design**
   - Test on different screen sizes
   - Verify mobile usability
   - Check touch interactions

## 🐛 Troubleshooting

### Common Issues

#### "Database connection failed"
- Check database credentials in `config/database.php`
- Verify database server is running
- Ensure database exists and is accessible

#### "File upload failed"
- Check directory permissions (755 for directories, 644 for files)
- Verify PHP upload settings (`upload_max_filesize`, `post_max_size`)
- Ensure sufficient disk space

#### "CORS errors"
- Configure proper CORS headers in PHP files
- Check API endpoint URLs
- Verify server configuration

#### "Images not displaying"
- Check file paths and URLs
- Verify upload directory permissions
- Ensure files were uploaded successfully

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Pondok Pesantren Lirboyo Kediri
- React and PHP communities
- Contributors and testers

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintained by**: Development Team