import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import WritingLog from '@/models/WritingLog';
import Challenge from '@/models/Challenge';
import User from '@/models/User';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('challengeId');

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const query = { userId: user._id };
    if (challengeId) {
      query.challengeId = challengeId;
    }

    const logs = await WritingLog.find(query)
      .populate('challengeId', 'title')
      .sort({ date: -1 });
    
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { challengeId, date, wordCount, notes } = await request.json();
    
    if (!challengeId || !date || wordCount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if challenge belongs to user
    const challenge = await Challenge.findOne({ _id: challengeId, userId: user._id });
    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Check if log for this date already exists
    const logDate = new Date(date);
    const startOfDay = new Date(logDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(logDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingLog = await WritingLog.findOne({
      challengeId,
      userId: user._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    let log;
    if (existingLog) {
      // Update existing log
      const oldWordCount = existingLog.wordCount;
      existingLog.wordCount = parseInt(wordCount);
      existingLog.notes = notes || '';
      log = await existingLog.save();
      
      // Update challenge's current word count
      challenge.currentWordCount += (parseInt(wordCount) - oldWordCount);
    } else {
      // Create new log
      log = await WritingLog.create({
        challengeId,
        userId: user._id,
        date: new Date(date),
        wordCount: parseInt(wordCount),
        notes: notes || '',
      });
      
      // Update challenge's current word count
      challenge.currentWordCount += parseInt(wordCount);
    }
    
    await challenge.save();

    return NextResponse.json(log, { status: existingLog ? 200 : 201 });
  } catch (error) {
    console.error('Error creating/updating log:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'A writing log for this date already exists. Please edit the existing log or choose a different date.' 
      }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
