import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    
    return NextResponse.json({
      status: 'success',
      message: 'Writing Challenge Tracker API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
