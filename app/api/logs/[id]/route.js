import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import WritingLog from '@/models/WritingLog';
import User from '@/models/User';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { date, wordCount, notes } = await request.json();

    if (!date || wordCount === undefined) {
      return NextResponse.json({ error: 'Date and word count are required' }, { status: 400 });
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the log and verify ownership through the challenge
    const log = await WritingLog.findById(id).populate('challengeId');
    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    if (log.challengeId.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the log
    const updatedLog = await WritingLog.findByIdAndUpdate(
      id,
      {
        date: new Date(date),
        wordCount: parseInt(wordCount),
        notes: notes || ''
      },
      { new: true }
    ).populate('challengeId');

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error('Error updating log:', error);
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

    // Find the log and verify ownership through the challenge
    const log = await WritingLog.findById(id).populate('challengeId');
    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    if (log.challengeId.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the log
    await WritingLog.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Error deleting log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
