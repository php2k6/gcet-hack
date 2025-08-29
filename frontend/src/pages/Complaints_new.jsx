import React, { useState, useRef, useCallback } from 'react';
import { Search, Filter, AlertCircle, Calendar, MapPin, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintModal from '../components/ComplaintModal';
import { useGetAllIssues } from '../api/issues';
import { debounce } from '../libs/helpers';

const DISTRICTS = [
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar',
  'Junagadh', 'Gandhinagar', 'Anand', 'Bharuch', 'Mehsana', 'Patan',
  'Porbandar', 'Surendranagar', 'Navsari', 'Valsad', 'Kutch', 'Banaskantha',
  'Sabarkantha', 'Panchmahals', 'Dahod', 'Kheda', 'Narmada', 'Tapi',
  'Dang', 'Aravalli', 'Botad', 'Chhota Udaipur', 'Devbhoomi Dwarka',
  'Gir Somnath', 'Mahisagar', 'Morbi'
];

const CATEGORIES = [
  'Roads', 'Water Supply', 'Sewerage', 'Electricity', 'Garbage',
  'Street Lights', 'Public Transport', 'Healthcare', 'Education',
  'Public Safety', 'Encroachment', 'Environment', 'Other'
];

const Complaints = () => {
  const headerRef = useRef(null);
  const filtersRef = useRef(null);
  const complaintsRef = useRef(null);
  
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [queryParams, setQueryParams] = useState({
    search: '',
    district: '',
    category: '',
    status: '',
    page: 1,
    limit: 12,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  // Debounced search handler
  const debouncedSetSearch = useCallback(
    debounce((searchValue) => {
      setQueryParams(prev => ({ ...prev, search: searchValue, page: 1 }));
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQueryParams(prev => ({ ...prev, search: value })); // Update immediately for UI
    debouncedSetSearch(value); // Debounced API call
  };

  const handleSortChange = (sortValue) => {
    const [sort_by, sort_order] = sortValue.split('_');
    setQueryParams(prev => ({ 
      ...prev, 
      sort_by, 
      sort_order: sort_order || 'desc',
      page: 1 
    }));
  };

  const clearAllFilters = () => {
    setQueryParams({
      search: '',
      district: '',
      category: '',
      status: '',
      page: 1,
      limit: 12,
      sort_by: 'created_at',
      sort_order: 'desc'
    });
  };

  const { data: issuesData, isLoading, error } = useGetAllIssues(queryParams, { 
    enabled: true 
  });
  
  const issues = issuesData?.issues || [];
  const hasMore = issuesData?.has_more || false;
  const totalCount = issuesData?.total || 0;

  const getStatusBadge = (status) => {
    const badges = {
      0: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      1: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      2: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      3: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${badges[status] || badges[0]}`;
  };

  const getStatusText = (status) => {
    const statusMap = {
      0: 'Pending',
      1: 'In Progress',
      2: 'Resolved',
      3: 'Rejected'
    };
    return statusMap[status] || 'Pending';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      'Critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Low': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${badges[priority] || badges['Medium']}`;
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setQueryParams(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  return (
    <>
      <section className="min-h-screen bg-gray-50 dark:bg-[#003049]">
        {/* Header */}
        <div ref={headerRef} className="bg-white dark:bg-[#02223a] shadow-sm border-b border-gray-200 dark:border-[#1a2a3a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Public Complaints</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Track and manage public grievances across districts
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <div className="bg-blue-50 dark:bg-[#1a2a3a] px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {isLoading ? "Loading..." : `${totalCount} complaints found`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div ref={filtersRef} className="bg-white dark:bg-[#02223a] shadow-sm border-b border-gray-200 dark:border-[#1a2a3a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search complaints by title, description, or location..."
                  value={queryParams.search}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#1a2a3a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#003049] dark:text-white"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-[#1a2a3a] text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-[#19304a] transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">Sort by:</label>
                <select
                  value={`${queryParams.sort_by}_${queryParams.sort_order}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-[#1a2a3a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#003049] dark:text-white"
                >
                  <option value="created_at_desc">Newest First</option>
                  <option value="created_at_asc">Oldest First</option>
                  <option value="updated_at_desc">Recently Updated</option>
                  <option value="priority_desc">High Priority First</option>
                </select>
              </div>
            </div>

            {/* Filter Options */}
            <div className={`${showFilters ? 'block' : 'hidden lg:block'} mt-4 pt-4 border-t border-gray-200 dark:border-[#1a2a3a]`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">District</label>
                  <select
                    value={queryParams.district}
                    onChange={(e) => setQueryParams(prev => ({ ...prev, district: e.target.value, page: 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1a2a3a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#003049] dark:text-white"
                  >
                    <option value="">All Districts</option>
                    {DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Category</label>
                  <select
                    value={queryParams.category}
                    onChange={(e) => setQueryParams(prev => ({ ...prev, category: e.target.value, page: 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1a2a3a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#003049] dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
                  <select
                    value={queryParams.status}
                    onChange={(e) => setQueryParams(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1a2a3a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#003049] dark:text-white"
                  >
                    <option value="">All Status</option>
                    <option value="0">Pending</option>
                    <option value="1">In Progress</option>
                    <option value="2">Resolved</option>
                    <option value="3">Rejected</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearAllFilters}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-[#1a2a3a] text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-[#19304a] transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Loading State */}
          {isLoading && queryParams.page === 1 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading complaints...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error loading complaints</h3>
              <p className="text-red-500 dark:text-red-400">{error.message}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && issues.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No complaints found</h3>
              <p className="text-gray-600 dark:text-gray-300">Try adjusting your search criteria or filters.</p>
            </div>
          )}

          {/* Issues Grid */}
          {!error && issues.length > 0 && (
            <div ref={complaintsRef} className="space-y-6">
              {issues.map((issue) => (
                <ComplaintCard 
                  key={issue.id} 
                  complaint={issue}
                  onClick={() => setSelectedComplaint(issue)}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && !isLoading && (
            <div className="mt-8 text-center">
              <button 
                onClick={loadMore}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Load More Complaints
              </button>
            </div>
          )}

          {/* Loading More */}
          {isLoading && queryParams.page > 1 && (
            <div className="mt-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}
        </div>
      </section>

      {/* Complaint Modal */}
      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </>
  );
};

export default Complaints;
