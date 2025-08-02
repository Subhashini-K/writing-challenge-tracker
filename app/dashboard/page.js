'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChallengeCard from '@/components/ChallengeCard';
import CreateChallengeModal from '@/components/CreateChallengeModal';
import LogWritingModal from '@/components/LogWritingModal';
import WritingLogs from '@/components/WritingLogs';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [editingChallenge, setEditingChallenge] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    fetchChallenges();
  }, [session, status, router]);

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/challenges');
      if (response.ok) {
        const data = await response.json();
        setChallenges(data);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (action, challengeData) => {
    try {
      if (action === 'create') {
        const response = await fetch('/api/challenges', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(challengeData),
        });

        if (response.ok) {
          setShowCreateModal(false);
          setEditingChallenge(null);
          fetchChallenges();
        } else {
          console.error('Failed to create challenge');
        }
      } else if (action === 'update') {
        const response = await fetch(`/api/challenges/${challengeData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(challengeData),
        });

        if (response.ok) {
          setShowCreateModal(false);
          setEditingChallenge(null);
          fetchChallenges();
        } else {
          console.error('Failed to update challenge');
        }
      }
    } catch (error) {
      console.error('Error handling challenge:', error);
    }
  };

  const handleLogWriting = (challenge) => {
    setSelectedChallenge(challenge);
    setShowLogModal(true);
  };

  const handleLogSubmit = async (action, data) => {
    try {
      if (action === 'create') {
        const response = await fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            challengeId: selectedChallenge._id,
          }),
        });

        if (response.ok) {
          setShowLogModal(false);
          setSelectedChallenge(null);
          setSelectedLog(null);
          // Refresh challenges to update progress
          await fetchChallenges();
        } else {
          const errorData = await response.json();
          console.error('Failed to create log:', errorData);
          alert(errorData.error || 'Failed to create log');
        }
      } else if (action === 'update') {
        const response = await fetch(`/api/logs/${data.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          setShowLogModal(false);
          setSelectedChallenge(null);
          setSelectedLog(null);
          // Refresh challenges to update progress
          await fetchChallenges();
        } else {
          const errorData = await response.json();
          console.error('Failed to update log:', errorData);
          alert(errorData.error || 'Failed to update log');
        }
      } else if (action === 'delete') {
        const response = await fetch(`/api/logs/${data.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setShowLogModal(false);
          setSelectedChallenge(null);
          setSelectedLog(null);
          // Refresh challenges to update progress
          await fetchChallenges();
        } else {
          const errorData = await response.json();
          console.error('Failed to delete log:', errorData);
          alert(errorData.error || 'Failed to delete log');
        }
      }
    } catch (error) {
      console.error('Error handling log:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleEditLog = (challenge, log) => {
    setSelectedChallenge(challenge);
    setSelectedLog(log);
    setShowLogModal(true);
  };

  const handleEditChallenge = (challenge) => {
    setEditingChallenge(challenge);
    setShowCreateModal(true);
  };

  const handleDeleteChallenge = async (challenge) => {
    if (!window.confirm(`Are you sure you want to delete "${challenge.title}"? This will also delete all associated writing logs.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/challenges/${challenge._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchChallenges();
      } else {
        console.error('Failed to delete challenge');
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
    }
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

  const activeChallenges = challenges.filter(challenge => {
    const now = new Date();
    const endDate = new Date(challenge.endDate);
    return endDate >= now;
  });

  const completedChallenges = challenges.filter(challenge => {
    const now = new Date();
    const endDate = new Date(challenge.endDate);
    return endDate < now;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Writing Challenge Tracker
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={session.user.image}
                  alt={session.user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-gray-700">{session.user.name}</span>
              </div>
              <button
                onClick={() => router.push('/profile')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Profile
              </button>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Challenge
            </button>
          </div>
        </div>

        {/* Active Challenges */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Active Challenges ({activeChallenges.length})
          </h3>
          {activeChallenges.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 mb-4">No active challenges yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                Create your first challenge
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge._id}
                  challenge={challenge}
                  onLogWriting={handleLogWriting}
                  onEditChallenge={handleEditChallenge}
                  onDeleteChallenge={handleDeleteChallenge}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Writing Logs */}
        <WritingLogs onEditLog={handleEditLog} />

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Completed Challenges ({completedChallenges.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge._id}
                  challenge={challenge}
                  isCompleted={true}
                  onEditChallenge={handleEditChallenge}
                  onDeleteChallenge={handleDeleteChallenge}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateChallengeModal
          existingChallenge={editingChallenge}
          onClose={() => {
            setShowCreateModal(false);
            setEditingChallenge(null);
          }}
          onSubmit={handleCreateChallenge}
        />
      )}

      {showLogModal && selectedChallenge && (
        <LogWritingModal
          challenge={selectedChallenge}
          existingLog={selectedLog}
          onClose={() => {
            setShowLogModal(false);
            setSelectedChallenge(null);
            setSelectedLog(null);
          }}
          onSubmit={handleLogSubmit}
        />
      )}
    </div>
  );
}
