# NEXUS Admin Dashboard

A multi-page admin dashboard web application built with HTML, CSS (Tailwind), and JavaScript.

## Features

- **Landing Page**: Hero section, features, navigation.
- **Authentication**: Signup and Login with localStorage simulation.
- **Dashboard**: Overview with metrics and chart.
- **Users Management**: CRUD operations for users.
- **Products Management**: CRUD operations for products.
- **Analytics**: Charts for traffic and conversions.
- **Notifications**: Inbox with mark as read and delete.
- **Settings**: Profile update, password change, dark mode toggle.
- **Responsive Design**: Works on desktop and mobile.
- **Dark Mode**: Toggle between light and dark themes.

## Technologies Used

- HTML5
- CSS3 (Tailwind CSS)
- JavaScript (ES6)
- Chart.js for charts
- Iconify for icons
- localStorage for data persistence

## File Structure

- `index.html` - Landing page
- `login.html` - Login page
- `signup.html` - Signup page
- `dashboard.html` - Dashboard
- `users.html` - Users management
- `products.html` - Products management
- `analytics.html` - Analytics page
- `notifications.html` - Notifications page
- `settings.html` - Settings page
- `script.js` - Main JavaScript logic
- `styles.css` - Additional styles

## How to Run Locally

1. Clone or download the files.
2. Open `index.html` in a web browser.
3. Navigate through the app.

For a local server (if Python is installed):
```
python -m http.server 8000
```
Then open `http://localhost:8000/index.html`

## Deployment

Deploy to Netlify, Vercel, or GitHub Pages by uploading the files.

## Authentication

- Default admin: email `admin@nexus.com`, password `admin`
- Or signup new users.

Data is stored in browser's localStorage.

## Notes

- No backend; all data is mock and stored locally.
- For production, a real backend would be needed.
- Responsive and accessible design.