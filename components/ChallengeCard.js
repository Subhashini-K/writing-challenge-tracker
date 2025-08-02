export default function ChallengeCard({ challenge, onLogWriting, onEditChallenge, onDeleteChallenge, isCompleted = false }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getProgressPercentage = () => {
    return Math.min(Math.round((challenge.currentWordCount / challenge.targetWordCount) * 100), 100);
  };

  const getDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(challenge.endDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const progress = getProgressPercentage();
  const daysRemaining = getDaysRemaining();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg text-gray-900 truncate">{challenge.title}</h3>
        {!isCompleted && (
          <span className={`px-2 py-1 text-xs rounded-full ${
            daysRemaining > 7 
              ? 'bg-green-100 text-green-800' 
              : daysRemaining > 0 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Ended'}
          </span>
        )}
        {isCompleted && (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            Completed
          </span>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{challenge.description}</p>

      <div className="space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {challenge.currentWordCount.toLocaleString()} / {challenge.targetWordCount.toLocaleString()} words
          </div>
        </div>

        {/* Date Range */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatDate(challenge.startDate)}</span>
          <span>{formatDate(challenge.endDate)}</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mt-4">
          {!isCompleted && daysRemaining >= 0 && onLogWriting && (
            <button
              onClick={() => onLogWriting(challenge)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Log Writing
            </button>
          )}
          
          {(onEditChallenge || onDeleteChallenge) && (
            <div className="flex space-x-2">
              {onEditChallenge && (
                <button
                  onClick={() => onEditChallenge(challenge)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Edit
                </button>
              )}
              {onDeleteChallenge && (
                <button
                  onClick={() => onDeleteChallenge(challenge)}
                  className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
