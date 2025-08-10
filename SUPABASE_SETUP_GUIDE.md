# Supabase Server-Side Authentication Setup Guide

## 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project dashboard under Settings > API.

## 2. Supabase Project Configuration

### Authentication Settings

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure the following settings:

#### Site URL

- Set your Site URL to: `http://localhost:3000` (for development)
- For production, use your actual domain

#### Additional Redirect URLs

Add these URLs for development and production:

- `http://localhost:3000/**`
- `https://yourdomain.com/**` (replace with your actual domain)

#### Email Auth

- Enable email authentication
- Configure email templates as needed
- Set up SMTP settings for production email delivery

### Database Schema

The authentication system expects a `user_profiles` table with the following structure:

```sql
-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES user_profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Row Level Security (RLS)

Ensure RLS is enabled on all user-related tables to secure data access.

## 3. Authentication Flow

### Server-Side Components

- `src/lib/supabase/server.ts` - Server-side Supabase client
- `src/lib/auth-actions.ts` - Server actions for auth operations
- `middleware.ts` - Route protection and session management

### Client-Side Components

- `src/lib/supabase/client.ts` - Client-side Supabase client
- `src/app/(auth)/login/LoginForm.tsx` - Login form component
- `src/app/(auth)/register/RegisterForm.tsx` - Registration form component

### Session Management

- Sessions are managed server-side using secure HTTP-only cookies
- Middleware automatically refreshes sessions
- Protected routes redirect unauthenticated users to login

## 4. Security Features

### CSRF Protection

- Server actions provide built-in CSRF protection
- Forms submit to server actions, not API endpoints

### Cookie Security

- HTTP-only cookies prevent XSS attacks
- Secure flag enabled in production
- SameSite attribute set to 'lax'
- 7-day expiration for session cookies

### Route Protection

- Middleware protects all organization routes
- Dashboard and settings routes require authentication
- Auth pages redirect authenticated users away

## 5. User Profile Management

### Profile Creation

- User profiles are automatically created upon successful registration
- Profile includes first name, last name, and email in metadata
- Links to Supabase Auth user via UUID

### Profile Updates

- Users can update their profile information
- Changes are stored in the metadata JSONB field
- RLS ensures users can only modify their own profiles

## 6. Error Handling

### Authentication Errors

- Login failures show appropriate error messages
- Registration conflicts are handled gracefully
- Network errors are caught and displayed to users

### Session Errors

- Invalid sessions redirect to login
- Expired sessions are automatically refreshed
- Server errors are logged for debugging

## 7. Development vs Production

### Development

- Use localhost URLs for redirects
- Enable Supabase local development if needed
- Use test email providers for verification

### Production

- Update Site URL and redirect URLs
- Configure production SMTP settings
- Enable email rate limiting
- Set up monitoring and logging

## 8. Testing

Follow the test scenarios in `AUTHENTICATION_TEST_GUIDE.md` to verify:

- Registration and email verification
- Login and logout flows
- Route protection
- Session persistence
- Error handling

## 9. Troubleshooting

### Common Issues

#### "Invalid login credentials"

- Check email and password are correct
- Verify user has confirmed their email
- Check Supabase Auth logs

#### "Not authorized"

- Verify RLS policies are set up correctly
- Check user has proper permissions
- Review Supabase logs for policy violations

#### Redirect loops

- Check middleware configuration
- Verify auth route definitions
- Review protected route patterns

#### Session not persisting

- Check cookie settings in server.ts
- Verify middleware is running
- Check browser cookie settings

### Debug Steps

1. Check Supabase Auth logs in dashboard
2. Review browser network tab for failed requests
3. Check server logs for error messages
4. Verify environment variables are loaded
5. Test with incognito/private browsing

## 10. Next Steps

After authentication is working:

- Set up organization-based access control
- Implement user role management
- Add social authentication providers
- Configure production email settings
- Set up monitoring and analytics
