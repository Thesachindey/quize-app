# Quiz Application

A modern quiz application built with HTML, JavaScript, and Tailwind CSS.

## Features

- Role-based access (Admin, Teacher, Student)
- Secure authentication system
- Quiz creation and management
- Real-time quiz taking with timer
- User management system
- Responsive design

## Pages

- `index.html` - Landing page
- `login.html` - Login page
- `dashboard.html` - Role-based dashboard
- `admin.html` - User management
- `teacher.html` - Quiz management
- `student.html` - Quiz taking interface

## Deployment

### Deploying to Vercel

1. Create a Vercel account at https://vercel.com
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Login to Vercel:
   ```bash
   vercel login
   ```
4. Deploy the project:
   ```bash
   vercel
   ```

### Manual Deployment

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Configure the following settings:
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: ./
4. Deploy

## Development

1. Clone the repository
2. Open any HTML file in your browser to test locally
3. Make changes and test
4. Deploy to Vercel

## Security Notes

- This is a demo application using localStorage for data persistence
- In a production environment, implement:
  - Backend API
  - Database
  - Proper authentication
  - HTTPS
  - Input validation
  - XSS protection

## License

MIT License 