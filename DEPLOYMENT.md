# Deployment Guide - Document Verification System

This guide will help you deploy the Document Verification System to a web hosting service.

## 📋 Prerequisites

### Web Hosting Requirements
- **PHP Version**: 7.4 or higher
- **MySQL Database**: 5.7 or higher (or MariaDB equivalent)
- **File Upload Support**: Enabled with at least 10MB limit
- **Apache/Nginx**: With mod_rewrite support
- **HTTPS**: Recommended for production

### Local Development Requirements
- Node.js 16+ and npm
- Code editor (VS Code recommended)
- FTP/SFTP client or hosting control panel access

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Hosting Environment

#### 1.1 Create MySQL Database
1. Log into your hosting control panel (cPanel, Plesk, etc.)
2. Navigate to MySQL Databases
3. Create a new database (e.g., `your_username_docverify`)
4. Create a database user with full privileges
5. Note down the database credentials:
   - Database Host (usually `localhost`)
   - Database Name
   - Username
   - Password

#### 1.2 Import Database Schema
1. Access phpMyAdmin or your database management tool
2. Select your newly created database
3. Import the `backend/database/schema.sql` file
4. Verify that all tables are created with sample data

### Step 2: Upload Backend Files

#### 2.1 Upload PHP Files
Upload the entire `backend/` folder to your web hosting:

```
your-domain.com/
├── public_html/ (or www/, htdocs/)
│   ├── api/
│   │   ├── verify.php
│   │   ├── signers.php
│   │   └── documents.php
│   ├── config/
│   │   └── database.php
│   ├── uploads/
│   │   ├── .htaccess
│   │   └── index.php
│   ├── test/
│   │   └── test_api.php
│   └── .htaccess
```

#### 2.2 Configure Database Connection
Edit `config/database.php` with your hosting database credentials:

```php
<?php
define('DB_HOST', 'localhost'); // Your database host
define('DB_NAME', 'your_db_name'); // Your database name
define('DB_USER', 'your_db_user'); // Your database username
define('DB_PASS', 'your_db_password'); // Your database password
```

#### 2.3 Set File Permissions
Set proper permissions for directories and files:

```bash
# Directories should be 755
chmod 755 api/
chmod 755 config/
chmod 755 uploads/
chmod 755 test/

# PHP files should be 644
chmod 644 api/*.php
chmod 644 config/*.php
chmod 644 test/*.php

# Make uploads directory writable
chmod 755 uploads/
```

### Step 3: Test Backend API

#### 3.1 Run API Test
Visit `https://yourdomain.com/test/test_api.php` in your browser to verify:
- ✅ Database connection works
- ✅ All tables exist with data
- ✅ API endpoints are accessible
- ✅ Upload directory is writable
- ✅ Security files are in place

#### 3.2 Manual API Testing
Test individual endpoints:

**Test Signers API:**
```
GET https://yourdomain.com/api/signers
```

**Test Verify API:**
```
GET https://yourdomain.com/api/verify?nomor_dokumen=DOC001/2024
```

### Step 4: Build and Deploy Frontend

#### 4.1 Update API Configuration
In your React project, update the API base URL:

```typescript
// Create src/config/api.ts
export const API_BASE_URL = 'https://yourdomain.com/api';
```

#### 4.2 Update API Calls
Modify your API calls to use the production URL:

```typescript
// Example in your components
const response = await fetch(`${API_BASE_URL}/verify?nomor_dokumen=${documentNumber}`);
```

#### 4.3 Build Frontend
```bash
# Install dependencies
npm install

# Build for production
npm run build
```

#### 4.4 Upload Frontend Files
Upload the contents of the `dist/` folder to your web hosting:

```
your-domain.com/public_html/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── [backend files from previous steps]
```

### Step 5: Configure Web Server

#### 5.1 Apache Configuration (.htaccess)
The provided `.htaccess` files should handle:
- URL rewriting for API routes
- CORS headers
- Security headers
- File upload restrictions

#### 5.2 Nginx Configuration (if applicable)
If using Nginx, add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/your/public_html;
    index index.html index.php;

    # Frontend routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API routes
    location /api/ {
        try_files $uri $uri/ /api/$uri.php;
    }

    # PHP processing
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

## 🔧 Configuration Options

### Environment-Specific Settings

#### Development
```php
// config/database.php - Development
define('DB_HOST', 'localhost');
define('DB_NAME', 'docverify_dev');
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

#### Production
```php
// config/database.php - Production
define('DB_HOST', 'your-production-host');
define('DB_NAME', 'your-production-db');
error_reporting(0);
ini_set('display_errors', 0);
```

### File Upload Limits
Adjust PHP settings in `.htaccess` or `php.ini`:

```apache
# .htaccess
php_value upload_max_filesize 10M
php_value post_max_size 10M
php_value max_execution_time 300
php_value memory_limit 256M
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Failed
**Problem**: Cannot connect to database
**Solutions**:
- Verify database credentials in `config/database.php`
- Check if database server is running
- Ensure database user has proper privileges
- Test connection using phpMyAdmin

#### 2. API Returns 500 Error
**Problem**: Internal server error on API calls
**Solutions**:
- Check PHP error logs
- Verify file permissions (644 for PHP files)
- Ensure all required PHP extensions are installed
- Test with `test/test_api.php`

#### 3. File Upload Fails
**Problem**: Cannot upload document files
**Solutions**:
- Check `uploads/` directory permissions (755)
- Verify PHP upload settings
- Ensure sufficient disk space
- Check file size limits

#### 4. CORS Errors
**Problem**: Frontend cannot access API
**Solutions**:
- Verify CORS headers in `.htaccess`
- Check API URLs in frontend code
- Ensure proper domain configuration
- Test API endpoints directly

#### 5. Images Not Displaying
**Problem**: Uploaded images don't show
**Solutions**:
- Check file paths and URLs
- Verify upload directory structure
- Ensure proper MIME types
- Check file permissions

### Debug Mode
Enable debug mode for troubleshooting:

```php
// Add to config/database.php for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

## 📊 Performance Optimization

### Database Optimization
- Add indexes for frequently queried columns
- Optimize queries for large datasets
- Consider database connection pooling

### File Optimization
- Implement image compression
- Use CDN for static assets
- Enable gzip compression

### Caching
- Implement API response caching
- Use browser caching for static files
- Consider Redis for session storage

## 🔒 Security Checklist

- [ ] Database credentials are secure
- [ ] File upload restrictions are in place
- [ ] HTTPS is enabled
- [ ] Error reporting is disabled in production
- [ ] Directory browsing is disabled
- [ ] Sensitive files are protected
- [ ] Input validation is implemented
- [ ] SQL injection protection is active

## 📈 Monitoring and Maintenance

### Regular Tasks
- Monitor error logs
- Backup database regularly
- Update PHP and dependencies
- Check disk space usage
- Monitor API performance

### Log Files to Monitor
- PHP error logs
- Apache/Nginx access logs
- Database slow query logs
- Application-specific logs

## 🆘 Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review error logs for specific error messages
3. Test individual components using the provided test scripts
4. Verify all configuration files are correct
5. Ensure all file permissions are set properly

For additional support, refer to your hosting provider's documentation or contact their support team for server-specific issues.

---

**Deployment Checklist:**
- [ ] Database created and schema imported
- [ ] Backend files uploaded and configured
- [ ] File permissions set correctly
- [ ] API endpoints tested and working
- [ ] Frontend built and deployed
- [ ] Domain/subdomain configured
- [ ] HTTPS enabled (recommended)
- [ ] All functionality tested in production environment