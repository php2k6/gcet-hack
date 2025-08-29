import React from 'react';
import { MapPin, Calendar, Users, TrendingUp, AlertCircle, CheckCircle, Clock, Eye } from 'lucide-react';

const getStatusIcon = (status) => {
  switch (status) {
    case 'Resolved':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'In Progress':
      return <Clock className="w-4 h-4 text-blue-500" />;
    case 'Under Review':
      return <Eye className="w-4 h-4 text-yellow-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-red-500" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Resolved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Under Review':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-red-100 text-red-800 border-red-200';
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

const ComplaintCard = ({ complaint }) => {
  return (
    <div className="bg-white dark:bg-[#02223a] rounded-lg shadow-sm border border-gray-200 dark:border-[#1a2a3a] hover:shadow-md transition-shadow duration-200">
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
                <span className="ml-1">{complaint.status}</span>
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
                {new Date(complaint.submittedDate).toLocaleDateString()}
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
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{complaint.upvotes}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-300 ml-1">upvotes</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-[#1a2a3a] text-blue-800 dark:text-blue-200">
                  {complaint.category}
                </span>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{complaint.department}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300">Assigned to: {complaint.assignedTo}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 lg:mt-0 lg:ml-6">
            <button className="w-full lg:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-[#1766a3] text-white rounded-lg hover:bg-blue-700 dark:hover:bg-[#1b4d6b] transition-colors">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
