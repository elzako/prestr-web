# Supabase Server-Side Authentication Test Guide

## Test Scenarios

### 1. User Registration Flow

1. Navigate to `/register`
2. Fill out the registration form with:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: testpassword123
   - Select any referral source
3. Submit the form
4. Verify that:
   - Success message appears: "Check your email to continue signing up"
   - User receives email verification link (check email or Supabase Auth logs)

### 2. Email Verification

1. Check email for verification link from Supabase
2. Click the verification link
3. Verify user is redirected to the site with authenticated state

### 3. User Login Flow

1. Navigate to `/login`
2. Enter the registered email and password
3. Submit the form
4. Verify that:
   - User is redirected to the home page
   - Header shows user avatar and dropdown menu instead of "Sign in" button
   - Navigation includes authenticated routes (Dashboard, Presentations, Organizations)

### 4. Protected Route Access

1. While logged in, navigate to `/profile`
2. Verify that:
   - Dashboard page loads successfully
   - User information is displayed correctly
   - Account details show user email, name, ID, and creation date
   - Success message confirms authentication is working

### 5. Middleware Protection

1. Open a new incognito/private browser window
2. Try to navigate directly to `/profile`
3. Verify that:
   - User is redirected to `/login`
   - URL includes `redirectedFrom` parameter
4. After logging in, verify user is redirected back to `/profile`

### 6. Logout Flow

1. While logged in, click on the user avatar in the header
2. Click "Sign out" from the dropdown menu
3. Verify that:
   - User is redirected to `/login`
   - Header shows the unauthenticated state (Sign in button)
   - Attempting to access `/profile` redirects to login

### 7. Auth Route Redirection

1. While logged in, try to navigate to `/login` or `/register`
2. Verify that:
   - User is automatically redirected to the home page
   - Cannot access auth pages while authenticated

### 8. Session Persistence

1. Log in successfully
2. Refresh the page
3. Verify that:
   - User remains logged in
   - All authentication state is maintained
4. Close the browser and reopen
5. Navigate to the site
6. Verify session persistence based on cookie expiration

### 9. User Profile Creation

1. After successful registration and email verification
2. Navigate to `/profile`
3. Verify that:
   - User profile was created in the database
   - First name and last name are displayed correctly
   - Profile metadata is properly stored

### 10. Error Handling

1. Try to log in with incorrect credentials
2. Verify that:
   - Appropriate error message is displayed
   - Form remains functional for retry
3. Try to register with an already used email
4. Verify appropriate error handling

## Environment Variables Required

Ensure these environment variables are set in your `.env.local`:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Requirements

Ensure the following tables exist in your Supabase database:

- `user_profiles` table with the structure defined in `types/database.types.ts`
- Proper RLS (Row Level Security) policies for user data access

## Success Criteria

All test scenarios should pass for a successful implementation of:

- ✅ Secure server-side authentication
- ✅ Proper session management
- ✅ Route protection via middleware
- ✅ User profile management
- ✅ Seamless user experience
- ✅ Error handling and validation
