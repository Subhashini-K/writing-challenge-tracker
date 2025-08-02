'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState({
    totalChallenges: 0,
    completedChallenges: 0,
    totalWordsWritten: 0,
    activeChallenges: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    fetchUserData();
  }, [session, status, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/challenges');
      if (response.ok) {
        const challengesData = await response.json();
        setChallenges(challengesData);
        
        const now = new Date();
        const completed = challengesData.filter(c => new Date(c.endDate) < now);
        const active = challengesData.filter(c => new Date(c.endDate) >= now);
        const totalWords = challengesData.reduce((sum, c) => sum + c.currentWordCount, 0);
        
        setStats({
          totalChallenges: challengesData.length,
          completedChallenges: completed.length,
          totalWordsWritten: totalWords,
          activeChallenges: active.length,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getProgressPercentage = (current, target) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-xl font-semibold text-gray-900">User Profile</h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-6">
            <img
              src={session.user.image}
              alt={session.user.name}
              className="w-20 h-20 rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{session.user.name}</h2>
              <p className="text-gray-600">{session.user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {formatDate(new Date())}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.totalChallenges}
            </div>
            <div className="text-sm text-gray-600">Total Challenges</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.activeChallenges}
            </div>
            <div className="text-sm text-gray-600">Active Challenges</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.completedChallenges}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {stats.totalWordsWritten.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Words Written</div>
          </div>
        </div>

        {/* Challenges List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Challenges</h3>
          </div>
          <div className="p-6">
            {challenges.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No challenges created yet</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Create your first challenge
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {challenges.map((challenge) => {
                  const isActive = new Date(challenge.endDate) >= new Date();
                  const progress = getProgressPercentage(challenge.currentWordCount, challenge.targetWordCount);
                  
                  return (
                    <div
                      key={challenge._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{challenge.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {isActive ? 'Active' : 'Completed'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Progress:</span>
                          <div className="mt-1">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 mt-1 block">
                              {challenge.currentWordCount.toLocaleString()} / {challenge.targetWordCount.toLocaleString()} words ({progress}%)
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Start Date:</span>
                          <div className="font-medium">{formatDate(challenge.startDate)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">End Date:</span>
                          <div className="font-medium">{formatDate(challenge.endDate)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
