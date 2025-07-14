# Password Change Functionality

This document describes the implementation of the password change functionality for the NearSpots portal.

## Overview

The password change functionality allows authenticated users to update their passwords securely with comprehensive validation both on the client-side and server-side.

## Features

- **Client-side validation** with real-time feedback
- **Server-side validation** for security
- **Password strength indicator** with visual feedback
- **AJAX form submission** for smooth user experience
- **Popup notifications** for success/error messages
- **Automatic logout** after successful password change
- **Responsive design** for mobile devices

## Implementation Details

### 1. URL Configuration

**File:** `nearspots/portal/urls.py`

```python
path('change-password/', home.ChangePasswordView.as_view(), name='change_password'),
```

### 2. View Function

**File:** `nearspots/portal/views/home.py`

**Class:** `ChangePasswordView`

#### Features:
- Login required (LoginRequiredMixin)
- Comprehensive validation
- Password strength requirements
- Current password verification
- Automatic logout after password change

#### Validation Rules:
- Current password is required
- New password must be 8-128 characters
- New password must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&)
- Confirm password must match new password
- New password must be different from current password

### 3. JavaScript Implementation

**File:** `nearspots/static/portal/js/profile.js`

#### Key Functions:

1. **Form Handling:**
   - AJAX form submission
   - Real-time validation
   - Loading states
   - Error handling

2. **Password Validation:**
   - Client-side validation
   - Password strength checker
   - Confirm password matching

3. **Password Strength Indicator:**
   - Visual strength bar
   - Color-coded feedback
   - Score-based rating (1-5)

4. **Notification System:**
   - Success/error popups
   - Auto-dismiss after 5 seconds
   - Click to dismiss
   - Smooth animations

### 4. CSS Styling

**File:** `nearspots/static/portal/css/style.css`

#### Styles Include:
- Form validation error states
- Password strength indicator
- Button loading states
- Notification popups
- Responsive design

## Usage

### For Users:

1. Navigate to Profile page
2. Scroll to "Change Password" section
3. Enter current password
4. Enter new password (with strength indicator)
5. Confirm new password
6. Click "Update" button
7. User will be automatically logged out and redirected to login page

### For Developers:

#### Testing the Functionality:

```bash
# Run the test script
python test_password_change.py
```

#### Manual Testing:

1. Start the development server:
   ```bash
   python manage.py runserver
   ```

2. Navigate to `/portal/profile/`

3. Test various scenarios:
   - Valid password change
   - Invalid current password
   - Weak new password
   - Mismatched confirm password
   - Same as current password

## Security Features

1. **CSRF Protection:** All forms include CSRF tokens
2. **Login Required:** Only authenticated users can access
3. **Password Hashing:** Passwords are properly hashed using Django's built-in hashing
4. **Session Invalidation:** User is logged out after password change
5. **Input Validation:** Both client and server-side validation
6. **Rate Limiting:** Can be easily added if needed

## Error Handling

### Client-side Errors:
- Real-time validation feedback
- Field-specific error messages
- Visual error indicators

### Server-side Errors:
- JSON response with error details
- Field-specific error mapping
- Generic error messages for security

### Common Error Scenarios:
- Invalid current password
- Weak new password
- Mismatched confirm password
- Same as current password
- Network/server errors

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers
- Progressive enhancement (works without JavaScript for basic functionality)

## Dependencies

- jQuery 3.6.0+
- Django 3.2+
- Django's built-in authentication system

## Future Enhancements

1. **Rate Limiting:** Prevent brute force attacks
2. **Password History:** Prevent reuse of recent passwords
3. **Two-Factor Authentication:** Additional security layer
4. **Email Notification:** Notify user of password change
5. **Password Expiry:** Force periodic password changes

## Troubleshooting

### Common Issues:

1. **jQuery not loaded:**
   - Ensure jQuery is included before profile.js
   - Check browser console for errors

2. **CSRF token missing:**
   - Ensure {% csrf_token %} is in the form
   - Check Django settings for CSRF configuration

3. **Validation not working:**
   - Check browser console for JavaScript errors
   - Verify form field IDs match JavaScript selectors

4. **Styling issues:**
   - Ensure CSS file is properly loaded
   - Check for CSS conflicts

### Debug Mode:

Enable Django debug mode to see detailed error messages:

```python
DEBUG = True
```

## API Reference

### ChangePasswordView

**URL:** `/portal/change-password/`

**Method:** POST

**Required Fields:**
- `currentPassword`: Current user password
- `newPassword`: New password (8-128 chars, complex)
- `confirmPassword`: Password confirmation

**Response Format:**
```json
{
    "status": "success|error",
    "message": "Success/error message",
    "errors": {
        "field_name": "field-specific error"
    },
    "redirect_url": "URL to redirect to (on success)"
}
```

**Status Codes:**
- 200: Success
- 400: Validation error
- 401: Unauthorized
- 500: Server error 