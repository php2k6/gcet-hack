import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, AlertCircle } from 'lucide-react';
import { gsap } from 'gsap';
import ComplaintCard from '../components/ComplaintCard';
import { useGetAllIssues } from '../api/issues';

const Complaints = () => {
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const complaintsRef = useRef(null);
  const headerRef = useRef(null);
  const filtersRef = useRef(null);

  // Build query parameters for API
  const queryParams = {
    search: debouncedSearch || undefined,
    district: districtFilter || undefined,
    category: categoryFilter || undefined,
    status: statusFilter !== '' ? parseInt(statusFilter) : undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
    page: page,
    limit: 10,
  };

  // Remove undefined values from params
  const cleanParams = Object.fromEntries(
    Object.entries(queryParams).filter(([_, value]) => value !== undefined)
  );

  const { data: issuesResponse, isLoading, error } = useGetAllIssues(cleanParams);

  // Extract issues from response (assuming pagination structure)
  const issues = issuesResponse?.data || issuesResponse || [];
  const totalCount = issuesResponse?.total || issues.length;

  // GSAP Animations
  useEffect(() => {
    // Header animation
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
    }

    // Filters animation
    if (filtersRef.current) {
      gsap.fromTo(
        filtersRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.6, delay: 0.2, ease: "power2.out" }
      );
    }
  }, []);

  // Complaints cards stagger animation
  useEffect(() => {
    if (complaintsRef.current && issues.length > 0) {
      gsap.fromTo(
        Array.from(complaintsRef.current.children),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.4,
          ease: "power2.out",
        }
      );
    }
  }, [issues]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page when search changes
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [districtFilter, statusFilter, categoryFilter, sortBy, sortOrder]);

  // Helper function to handle sort change
  const handleSortChange = (value) => {
    switch (value) {
      case 'newest':
        setSortBy('created_at');
        setSortOrder('desc');
        break;
      case 'oldest':
        setSortBy('created_at');
        setSortOrder('asc');
        break;
      case 'updated':
        setSortBy('updated_at');
        setSortOrder('desc');
        break;
      case 'title':
        setSortBy('title');
        setSortOrder('asc');
        break;
      default:
        setSortBy('created_at');
        setSortOrder('desc');
    }
  };

  // Helper function to clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setDistrictFilter('');
    setStatusFilter('');
    setCategoryFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
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
                    {isLoading ? "Loading..." : `${issues.length} complaints found`}
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              </button>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-[#1a2a3a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#003049] dark:text-white"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="upvotes">Most Upvoted</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            </div>

            {/* Filter Options */}
            <div className={`${showFilters || 'lg:block'} ${showFilters ? 'block' : 'hidden'} mt-4 pt-4 border-t border-gray-200 dark:border-[#1a2a3a]`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1a2a3a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#003049] dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1a2a3a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#003049] dark:text-white"
                  >
                    <option value="all">All Categories</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Roads">Roads</option>
                    <option value="Public Safety">Public Safety</option>
                    <option value="Encroachment">Encroachment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Priority</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#1a2a3a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#003049] dark:text-white"
                  >
                    <option value="all">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setCategoryFilter('all');
                      setPriorityFilter('all');
                      setSortBy('newest');
                    }}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-[#1a2a3a] text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-[#19304a] transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div ref={complaintsRef} className="space-y-6">
            {filteredComplaints && filteredComplaints.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                {error && (
                  <p className="text-red-500 dark:text-red-400">{error.message}</p>
                )}
                {!error && (<>

                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No complaints found</h3>
                  <p className="text-gray-600 dark:text-gray-300">Try adjusting your search criteria or filters.</p>
                </>
                )}
              </div>
            ) : (
              filteredComplaints.map((complaint) => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))
            )}
          </div>

          {/* Load More */}
          {filteredComplaints.length > 0 && (
            <div className="mt-8 text-center">
              <button className="px-6 py-3 bg-gray-100 dark:bg-[#1a2a3a] text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-[#19304a] transition-colors">
                Load More Complaints
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Complaints;