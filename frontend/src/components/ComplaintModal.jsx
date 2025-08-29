import React, { useState } from 'react';
import { X, MapPin, Calendar, User, Tag, AlertCircle, CheckCircle, Clock, Eye, ThumbsUp, MessageSquare, Image } from 'lucide-react';

const ComplaintModal = ({ complaint, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!complaint) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 2: // Resolved
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 1: // In Progress
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 3: // Rejected
        return <Eye className="w-5 h-5 text-red-500" />;
      default: // Pending (0)
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
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
        return 'bg-red-500 text-white';
      case 'High':
        return 'bg-orange-500 text-white';
      case 'Medium':
        return 'bg-yellow-500 text-white';
      case 'Low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-[#02223a] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#1a2a3a]">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-mono text-gray-500 dark:text-gray-300">#{complaint.id}</span>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(complaint.status)}`}>
              {getStatusIcon(complaint.status)}
              <span className="ml-2">{getStatusText(complaint.status)}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(complaint.priority)}`}>
              {complaint.priority || 'Medium'} Priority
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#1a2a3a] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Title and Basic Info */}
          <div className="p-6 border-b border-gray-200 dark:border-[#1a2a3a]">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {complaint.title}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{complaint.location || 'Location not specified'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Created: {new Date(complaint.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                <span>{complaint.category}</span>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span>Reported by: {complaint.user_name || 'Anonymous'}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-[#1a2a3a]">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['details', 'media', 'activity'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {complaint.description}
                  </p>
                </div>

                {complaint.exact_location && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Exact Location</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Lat: {complaint.latitude}, Long: {complaint.longitude}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-[#1a2a3a] p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Engagement</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <ThumbsUp className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {complaint.upvotes || 0} upvotes
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {complaint.comments_count || 0} comments
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-[#1a2a3a] p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Timeline</h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <div>Created: {new Date(complaint.created_at).toLocaleDateString()}</div>
                      {complaint.updated_at && complaint.updated_at !== complaint.created_at && (
                        <div>Updated: {new Date(complaint.updated_at).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Media Attachments</h3>
                {complaint.media && complaint.media.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {complaint.media.map((media, index) => (
                      <div key={index} className="border border-gray-200 dark:border-[#1a2a3a] rounded-lg overflow-hidden">
                        <img
                          src={media.url}
                          alt={`Complaint media ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-3">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {media.filename || `Image ${index + 1}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No media attachments</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      This complaint doesn't have any images or files attached.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Activity Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Complaint created
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(complaint.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {complaint.updated_at && complaint.updated_at !== complaint.created_at && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Status updated
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(complaint.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-[#1a2a3a] bg-gray-50 dark:bg-[#1a2a3a]">
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
              <ThumbsUp className="w-4 h-4 mr-2" />
              Upvote ({complaint.upvotes || 0})
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <MessageSquare className="w-4 h-4 mr-2" />
              Comment
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintModal;
