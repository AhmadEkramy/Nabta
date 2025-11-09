# Firebase Setup Guide

This project is now integrated with Firebase for authentication, database, and storage.

## Firebase Services Used

- **Authentication**: User registration, login, and session management
- **Firestore**: NoSQL database for storing user data, posts, circles, etc.
- **Storage**: File uploads (images, documents)
- **Analytics**: User behavior tracking

## Project Structure

```
src/
├── firebase/
│   ├── config.ts          # Firebase configuration and initialization
│   ├── auth.ts            # Authentication utilities
│   ├── firestore.ts       # Generic Firestore operations
│   ├── storage.ts         # Storage utilities
│   ├── posts.ts           # Post-specific operations
│   ├── circles.ts         # Circle-specific operations
│   ├── userProfile.ts     # User profile operations
│   └── index.ts           # Export all Firebase functions
├── hooks/
│   └── useFirestore.ts    # React hooks for Firestore
└── contexts/
    └── AuthContext.tsx    # Updated to use Firebase Auth
```

## Firebase Configuration

The Firebase configuration is located in `src/firebase/config.ts`. The current configuration uses your project credentials:

- Project ID: `nabta-89a5b`
- Auth Domain: `nabta-89a5b.firebaseapp.com`
- Storage Bucket: `nabta-89a5b.firebasestorage.app`

## Security Rules

Firestore security rules are defined in `firestore.rules`. Key rules:

- Users can read/write their own data
- Posts are readable by all authenticated users
- Users can only create posts with their own userId
- Circle membership is required for certain operations

## Environment Variables

For production, consider moving sensitive configuration to environment variables:

1. Copy `.env.example` to `.env`
2. Fill in your Firebase configuration values
3. Update `config.ts` to use environment variables

## Usage Examples

### Authentication

```typescript
import { useAuth } from '../contexts/AuthContext';

const { user, login, signup, logout } = useAuth();

// Login
await login('user@example.com', 'password');

// Signup
await signup('user@example.com', 'password', 'User Name');

// Logout
await logout();
```

### Firestore Operations

```typescript
import { createPost, togglePostLike } from '../firebase';

// Create a post
const postId = await createPost({
  userId: user.id,
  userName: user.name,
  userAvatar: user.avatar,
  content: 'Hello, world!',
});

// Like a post
await togglePostLike(postId, user.id, false);
```

### Real-time Data

```typescript
import { useCollection } from '../hooks/useFirestore';

// Listen to user's posts
const { data: posts, loading, error } = useCollection(
  'posts',
  [{ field: 'userId', operator: '==', value: user.id }],
  'createdAt',
  'desc'
);
```

## Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `nabta-89a5b`
3. Set up Authentication providers (Email/Password is already configured)
4. Deploy Firestore security rules from `firestore.rules`
5. Configure Storage rules if needed

## Next Steps

1. **Deploy Security Rules**: Upload the `firestore.rules` to your Firebase project
2. **Set up Indexes**: Create composite indexes as needed for complex queries
3. **Configure Storage Rules**: Set up security rules for file uploads
4. **Add More Providers**: Configure Google, Facebook, or other auth providers
5. **Set up Cloud Functions**: Add server-side logic if needed

## Troubleshooting

- **Permission Denied**: Check Firestore security rules
- **Network Errors**: Verify Firebase configuration
- **Auth Errors**: Check if user is properly authenticated
- **Missing Data**: Ensure proper error handling in components

## Data Models

### User Document
```typescript
{
  id: string;
  name: string;
  email: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  isAdmin: boolean;
  joinedAt: string;
  circles: string[];
  completedTasks: number;
  readVerses: number;
  focusHours: number;
}
```

### Post Document
```typescript
{
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  circleId?: string;
  circleName?: string;
  createdAt: Timestamp;
  likes: number;
  comments: number;
  likedBy: string[];
}
```

This setup provides a solid foundation for your app's backend needs with Firebase.