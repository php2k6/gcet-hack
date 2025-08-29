import React from 'react';
import { MapPin, Calendar, Users, TrendingUp, AlertCircle, CheckCircle, Clock, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getStatusIcon = (status) => {
  switch (status) {
    case 2: // Resolved
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 1: // In Progress
      return <Clock className="w-4 h-4 text-blue-500" />;
    case 3: // Rejected
      return <Eye className="w-4 h-4 text-red-500" />;
    default: // Pending (0)
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 2: // Resolved
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
    case 1: // In Progress
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700';
    case 3: // Rejected
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
    default: // Pending (0)
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 2: return 'Resolved';
    case 1: return 'In Progress';
    case 3: return 'Rejected';
    default: return 'Pending';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Critical':
      return 'bg-red-500';
    case 'High':
      return 'bg-orange-500';
    case 'Medium':
      return 'bg-yellow-500';
    default:
      return 'bg-green-500';
  }
};

const ComplaintCard = ({ complaint, onClick }) => {
  const navigate = useNavigate();

  const handleViewReport = (e) => {
    e.stopPropagation(); // Prevent triggering the card onClick
    navigate(`/report/${complaint.id}`);
  };

  return (
    <div 
      className="bg-white dark:bg-[#02223a] rounded-lg shadow-sm border border-gray-200 dark:border-[#1a2a3a] hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-mono text-gray-500 dark:text-gray-300">#{complaint.id}</span>
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(complaint.priority)}`} title={`${complaint.priority} Priority`}></div>
              </div>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}> 
                {getStatusIcon(complaint.status)}
                <span className="ml-1">{getStatusText(complaint.status)}</span>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{complaint.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{complaint.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-300 mb-4">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {complaint.location}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(complaint.created_at).toLocaleDateString()}
              </div>
              {complaint.images > 0 && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {complaint.images} image{complaint.images > 1 ? 's' : ''}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-400 dark:text-gray-300 mr-1" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{complaint.vote_count || 0}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-300 ml-1">upvotes</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-[#1a2a3a] text-blue-800 dark:text-blue-200">
                  {complaint.category}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{complaint.priority || 'Medium'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">Priority</p>
                </div>
                <button
                  onClick={handleViewReport}
                  className="flex items-center px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  View Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
