import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Challenge from '@/models/Challenge';
import User from '@/models/User';
import WritingLog from '@/models/WritingLog';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const challenges = await Challenge.find({ userId: user._id }).sort({ createdAt: -1 });
    
    // Calculate current word count for each challenge
    const challengesWithProgress = await Promise.all(challenges.map(async (challenge) => {
      const logs = await WritingLog.find({ challengeId: challenge._id });
      const currentWordCount = logs.reduce((total, log) => total + (log.wordCount || 0), 0);
      
      return {
        ...challenge.toObject(),
        currentWordCount
      };
    }));
    
    return NextResponse.json(challengesWithProgress);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, targetWordCount, startDate, endDate } = await request.json();
    
    if (!title || !description || !targetWordCount || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const challenge = await Challenge.create({
      title,
      description,
      targetWordCount: parseInt(targetWordCount),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      userId: user._id,
    });

    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
