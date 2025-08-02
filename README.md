# Writing Challenge Tracker

A full-stack web application built with Next.js to help writers track their daily writing progress and achieve their writing goals.

## Features

- **GitHub OAuth Authentication**: Secure login using GitHub
- **Create Writing Challenges**: Set up challenges with target word counts and deadlines
- **Daily Progress Tracking**: Log daily writing sessions with word counts and notes
- **Dashboard**: View all active challenges and progress overview
- **User Profile**: Comprehensive view of all challenges and statistics
- **Responsive Design**: Clean, mobile-friendly interface using Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Authentication**: NextAuth.js with GitHub OAuth
- **Database**: MongoDB with Mongoose ODM



## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth configuration
│   │   ├── challenges/             # Challenge CRUD operations
│   │   └── logs/                   # Writing log operations
│   ├── auth/signin/                # Custom sign-in page
│   ├── dashboard/                  # Main dashboard
│   ├── profile/                    # User profile page
│   ├── providers/                  # Auth provider wrapper
│   ├── globals.css                 # Global styles
│   ├── layout.js                   # Root layout
│   └── page.js                     # Home page (redirects)
├── components/
│   ├── ChallengeCard.js           # Challenge display component
│   ├── CreateChallengeModal.js    # Challenge creation modal
│   ├── LogWritingModal.js         # Writing log modal
│   └── WritingLogs.js             # Recent logs display
├── lib/
│   └── mongodb.js                 # MongoDB connection utility
├── models/
│   ├── User.js                    # User schema
│   ├── Challenge.js               # Challenge schema
│   └── WritingLog.js              # Writing log schema
└── public/                        # Static assets
```

## Usage

1. **Sign in** with your GitHub account
2. **Create a challenge** by clicking "Create New Challenge"
3. **Log daily writing** by clicking "Log Writing" on any active challenge
4. **Track progress** on your dashboard
5. **View statistics** and challenge history in your profile

## API Endpoints

- `GET/POST /api/challenges` - Fetch/create challenges
- `GET/POST /api/logs` - Fetch/create writing logs
- `GET/POST /api/auth/[...nextauth]` - Authentication endpoints

## Database Schema

### User
- name, email, image, githubId, timestamps

### Challenge
- title, description, targetWordCount, startDate, endDate, userId, currentWordCount, timestamps

### WritingLog
- challengeId, userId, date, wordCount, notes, timestamps

