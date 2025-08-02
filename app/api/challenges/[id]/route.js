import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Challenge from '@/models/Challenge';
import WritingLog from '@/models/WritingLog';
import User from '@/models/User';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { title, description, targetWordCount, startDate, endDate } = await request.json();

    if (!title || !description || !targetWordCount || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the challenge and verify ownership
    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    if (challenge.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the challenge
    const updatedChallenge = await Challenge.findByIdAndUpdate(
      id,
      {
        title,
        description,
        targetWordCount: parseInt(targetWordCount),
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      },
      { new: true }
    );

    // Calculate current word count
    const logs = await WritingLog.find({ challengeId: updatedChallenge._id });
    const currentWordCount = logs.reduce((total, log) => total + (log.wordCount || 0), 0);

    return NextResponse.json({
      ...updatedChallenge.toObject(),
      currentWordCount
    });
  } catch (error) {
    console.error('Error updating challenge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the challenge and verify ownership
    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    if (challenge.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete all associated writing logs first
    await WritingLog.deleteMany({ challengeId: id });

    // Delete the challenge
    await Challenge.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Challenge and associated logs deleted successfully' });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
