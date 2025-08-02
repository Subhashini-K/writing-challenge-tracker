'use client';

import { useState, useEffect } from 'react';

export default function WritingLogs({ onEditLog }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.slice(0, 10)); // Show only the latest 10 logs
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Writing Logs</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-gray-100 rounded">
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Writing Logs</h3>
      
      {logs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No writing logs yet</p>
          <p className="text-sm text-gray-400 mt-1">Start logging your daily writing progress!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log._id}
              className="flex justify-between items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">
                    {log.challengeId?.title || 'Unknown Challenge'}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {formatDate(log.date)}
                  </span>
                </div>
                {log.notes && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {log.notes}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-lg font-semibold text-blue-600">
                    {log.wordCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">words</div>
                </div>
                {onEditLog && (
                  <button
                    onClick={() => onEditLog(log.challengeId, log)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {logs.length >= 10 && (
            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                Showing latest 10 logs. View your profile for complete history.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
