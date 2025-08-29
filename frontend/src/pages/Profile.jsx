import React, { useState } from 'react'
import { useGetMe, useUpdateMe, useGetUserIssues } from '../api/user';
import Toast from '../components/Toast';
import { getUserProfileImage } from '../utils/googleUtils';

const Profile = () => {
    const accessToken = localStorage.getItem("access_token");
    const googleIdToken = localStorage.getItem("google_id_token");
    
    console.log('Profile component - localStorage debug:');
    console.log('  google_id_token exists:', !!googleIdToken);
    console.log('  google_id_token length:', googleIdToken?.length);
    console.log('  profile_photo exists:', !!localStorage.getItem("profile_photo"));

    // get user details from usegetme hook
    const { data: user, isLoading } = useGetMe();
    const updateMutation = useUpdateMe();
    
    // get user issues
    const { data: userIssues, isLoading: isIssuesLoading, error: issuesError } = useGetUserIssues(user?.id);
    
    console.log('Profile component - user debug:');
    console.log('  user loaded:', !!user);
    console.log('  user.is_google:', user?.is_google);
    console.log('  user.name:', user?.name);
    
    // Get profile image with Google fallback
    const profileImage = user ? getUserProfileImage(user, googleIdToken) : null;
    
    // State for profile image to force re-render when it changes
    const [currentProfileImage, setCurrentProfileImage] = useState(profileImage);
    
    // Update profile image when user data or tokens change
    React.useEffect(() => {
        if (user) {
            const newProfileImage = getUserProfileImage(user, googleIdToken);
            setCurrentProfileImage(newProfileImage);
        }
    }, [user, googleIdToken]);
    
    // Listen for profile image updates
    React.useEffect(() => {
        const handleProfileImageUpdate = (event) => {
            setCurrentProfileImage(event.detail);
        };
        
        window.addEventListener('profileImageUpdated', handleProfileImageUpdate);
        
        return () => {
            window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
        };
    }, []);
    
    // Form state for editing user details
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        district: ''
    });
    const [errors, setErrors] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    // Update form data when user data is loaded
    React.useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                district: user.district || ''
            });
        }
    }, [user]);
    
    const createdAt = user?.created_at;
    const district = user?.district;
    const email = user?.email;
    const googleId = user?.google_id;
    const id = user?.id;
    const isGoogle = user?.is_google;
    const name = user?.name;
    const phone = user?.phone;
    const role = user?.role;

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate form data
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters long';
        }
        
        if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsUpdating(true);
        
        try {
            // Only send fields that have changed
            const updateData = {};
            if (formData.name !== user.name) updateData.name = formData.name;
            if (formData.phone !== user.phone) updateData.phone = formData.phone;
            if (formData.district !== user.district) updateData.district = formData.district;
            
            if (Object.keys(updateData).length > 0) {
                await updateMutation.mutateAsync(updateData);
                setIsModalOpen(false);
                setToast({ show: true, message: 'Profile updated successfully!', type: 'success' });
            } else {
                setIsModalOpen(false);
                setToast({ show: true, message: 'No changes were made.', type: 'info' });
            }
        } catch (error) {
            console.error('Update failed:', error);
            setToast({ show: true, message: 'Failed to update profile. Please try again.', type: 'error' });
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle modal open
    const openEditModal = () => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                district: user.district || ''
            });
            setErrors({});
            setIsModalOpen(true);
        }
    };

    // Handle modal close
    const closeEditModal = () => {
        setIsModalOpen(false);
        setErrors({});
    };

    console.log(user);

    // Helper functions for issues
    const getStatusBadge = (status) => {
        switch (status) {
            case 0:
                return {
                    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                    text: 'Open'
                };
            case 1:
                return {
                    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                    text: 'In Progress'
                };
            case 2:
                return {
                    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                    text: 'Resolved'
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
                    text: 'Unknown'
                };
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 0:
                return {
                    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                    text: 'Low'
                };
            case 1:
                return {
                    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                    text: 'Medium'
                };
            case 2:
                return {
                    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
                    text: 'High'
                };
            case 3:
                return {
                    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                    text: 'Critical'
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
                    text: 'Unknown'
                };
        }
    };

    if (isLoading) {
        return (
            <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-8">
                <div className="mx-auto max-w-screen-lg px-4 2xl:px-0">
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading profile...</span>
                    </div>
                </div>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-8">
                <div className="mx-auto max-w-screen-lg px-4 2xl:px-0">
                    <div className="flex justify-center items-center py-8">
                        <span className="text-gray-600 dark:text-gray-400">Unable to load profile data.</span>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-8">
            <div className="mx-auto max-w-screen-md px-4 2xl:px-0">
                {/* User Details */}
                <div className="py-4 md:py-8">
                    <div className="mb-4 grid gap-4 sm:grid-cols-2 sm:gap-8 lg:gap-16">
                        <div className="space-y-4">
                            <div className="flex space-x-4">
                                
                                <h2 className="flex items-center text-xl font-bold leading-none text-gray-900 dark:text-white sm:text-2xl">{name || 'User'}</h2>
                            </div>
                            <dl className="">
                                <dt className="font-semibold text-gray-900 dark:text-white">Email Address</dt>
                                <dd className="text-gray-500 dark:text-gray-400">{email}</dd>
                            </dl>
                            <dl>
                                <dt className="font-semibold text-gray-900 dark:text-white">District</dt>
                                <dd className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                    <svg className="hidden h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500 lg:inline" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5" />
                                    </svg>
                                    {district || 'Not specified'}
                                </dd>
                            </dl>
                            <dl>
                                <dt className="font-semibold text-gray-900 dark:text-white">Account Type</dt>
                                <dd className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                    <svg className="hidden h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500 lg:inline" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" d="M13 7h6l2 4m-8-4v8m0-8V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v9h2m8 0H9m4 0h2m4 0h2v-4m0 0h-5m3.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-10 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
                                    </svg>
                                    {isGoogle ? 'Google Account' : 'Regular Account'}
                                </dd>
                            </dl>
                        </div>
                        <div className="space-y-4">
                            <dl>
                                <dt className="font-semibold text-gray-900 dark:text-white">Phone Number</dt>
                                <dd className="text-gray-500 dark:text-gray-400">{phone || 'Not provided'}</dd>
                            </dl>
                            <dl>
                                <dt className="font-semibold text-gray-900 dark:text-white">Member Since</dt>
                                <dd className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                    <svg className="hidden h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500 lg:inline" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path
                                            stroke="currentColor"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            strokeWidth="2"
                                            d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"
                                        />
                                    </svg>
                                    {createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown'}
                                </dd>
                            </dl>
                            <dl>
                                <dt className="font-semibold text-gray-900 dark:text-white">User Role</dt>
                                <dd className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                    <svg className="hidden h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500 lg:inline" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" strokeWidth="2" d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                                    </svg>
                                    {role === 0 ? 'Citizen' : role === 1 ? 'Authority' : 'Admin'}
                                </dd>
                            </dl>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        onClick={openEditModal}
                        className="inline-flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 sm:w-auto"
                    >
                        <svg className="-ms-0.5 me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"></path>
                        </svg>
                        Edit your data
                    </button>
                </div>
                
                
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 md:p-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">My Issues</h3>
                        {userIssues && userIssues.length > 0 && (
                            <div className="flex gap-4 text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Total: <span className="font-semibold">{userIssues.length}</span>
                                </span>
                                <span className="text-red-600 dark:text-red-400">
                                    Open: <span className="font-semibold">{userIssues.filter(issue => issue.status === 0).length}</span>
                                </span>
                                <span className="text-yellow-600 dark:text-yellow-400">
                                    In Progress: <span className="font-semibold">{userIssues.filter(issue => issue.status === 1).length}</span>
                                </span>
                                <span className="text-green-600 dark:text-green-400">
                                    Resolved: <span className="font-semibold">{userIssues.filter(issue => issue.status === 2).length}</span>
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {isIssuesLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading issues...</span>
                        </div>
                    ) : issuesError ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="text-center">
                                <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">Failed to load issues</p>
                            </div>
                        </div>
                    ) : !userIssues || userIssues.length === 0 ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">No issues reported yet</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">Your reported issues will appear here</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {userIssues.map((issue, index) => {
                                const statusBadge = getStatusBadge(issue.status);
                                const priorityBadge = getPriorityBadge(issue.priority);
                                
                                return (
                                    <div key={issue.id} className="flex flex-wrap items-center gap-y-4 border-b border-gray-200 pb-4 dark:border-gray-700 md:pb-5 last:border-b-0">
                                        <dl className="w-1/2 sm:w-48">
                                            <dt className="text-base font-medium text-gray-500 dark:text-gray-400">Issue #{index + 1}:</dt>
                                            <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
                                                <span className="hover:underline cursor-pointer" title={issue.description}>
                                                    {issue.title.length > 30 ? `${issue.title.substring(0, 30)}...` : issue.title}
                                                </span>
                                            </dd>
                                        </dl>

                                        <dl className="w-1/2 sm:w-1/4 md:flex-1 lg:w-auto">
                                            <dt className="text-base font-medium text-gray-500 dark:text-gray-400">Date:</dt>
                                            <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
                                                {new Date(issue.created_at).toLocaleDateString()}
                                            </dd>
                                        </dl>

                                        <dl className="w-1/2 sm:w-1/5 md:flex-1 lg:w-auto">
                                            <dt className="text-base font-medium text-gray-500 dark:text-gray-400">Category:</dt>
                                            <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
                                                {issue.category || 'General'}
                                            </dd>
                                        </dl>

                                        <dl className="w-1/2 sm:w-1/4 md:flex-1 lg:w-auto">
                                            <dt className="text-base font-medium text-gray-500 dark:text-gray-400">Priority:</dt>
                                            <dd className="mt-1.5">
                                                <span className={`inline-flex shrink-0 items-center rounded px-2.5 py-0.5 text-xs font-medium ${priorityBadge.color}`}>
                                                    {priorityBadge.text}
                                                </span>
                                            </dd>
                                        </dl>

                                        <dl className="w-1/2 sm:w-1/4 sm:flex-1 lg:w-auto">
                                            <dt className="text-base font-medium text-gray-500 dark:text-gray-400">Status:</dt>
                                            <dd className="mt-1.5">
                                                <span className={`inline-flex shrink-0 items-center rounded px-2.5 py-0.5 text-xs font-medium ${statusBadge.color}`}>
                                                    <svg className="me-1 h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5"></path>
                                                    </svg>
                                                    {statusBadge.text}
                                                </span>
                                            </dd>
                                        </dl>

                                        <dl className="w-1/2 sm:w-1/4 md:flex-1 lg:w-auto">
                                            <dt className="text-base font-medium text-gray-500 dark:text-gray-400">Votes:</dt>
                                            <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
                                                {issue.vote_count || 0}
                                            </dd>
                                        </dl>

                                        <div className="w-full sm:flex sm:w-32 sm:items-center sm:justify-end sm:gap-4">
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Last updated: {new Date(issue.updated_at).toLocaleDateString()}
                                                </p>
                                                {issue.authority && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Assigned to: {issue.authority.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            {/* <!-- Account Information Modal --> */}
            <div id="accountInformationModal2" tabindex="-1" aria-hidden="true" className="max-h-auto fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden antialiased md:inset-0">
                <div className="max-h-auto relative max-h-full w-full max-w-lg p-4">
                    {/* <!-- Modal content --> */}
                    <div className="relative rounded-lg bg-white shadow dark:bg-gray-800">
                        {/* <!-- Modal header --> */}
                        <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4 dark:border-gray-700 md:p-5">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Information</h3>
                            <button type="button" className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="accountInformationModal2">
                                <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* <!-- Modal body --> */}
                        <form className="p-4 md:p-5">
                            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="col-span-2">
                                    <label htmlFor="pick-up-point-input" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> Pick-up point* </label>
                                    <input type="text" id="pick-up-point-input" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="Enter the pick-up point name" required />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label htmlFor="full_name_info_modal" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> Your Full Name* </label>
                                    <input type="text" id="full_name_info_modal" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="Enter your first name" required />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label htmlFor="email_info_modal" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> Your Email* </label>
                                    <input type="text" id="email_info_modal" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="Enter your email here" required />
                                </div>

                                <div className="col-span-2">
                                    <label htmlFor="phone-input_billing_modal" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> Phone Number* </label>
                                    <div className="flex items-center">
                                        <button id="dropdown_phone_input__button_billing_modal" data-dropdown-toggle="dropdown_phone_input_billing_modal" className="z-10 inline-flex shrink-0 items-center rounded-s-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-700" type="button">
                                            <svg fill="none" aria-hidden="true" className="me-2 h-4 w-4" viewBox="0 0 20 15">
                                                <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                                                <mask id="a"  width="20" height="15" x="0" y="0" maskUnits="userSpaceOnUse">
                                                    <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                                                </mask>
                                                <g mask="url(#a)">
                                                    <path fill="#D02F44" fill-rule="evenodd" d="M19.6.5H0v.933h19.6V.5zm0 1.867H0V3.3h19.6v-.933zM0 4.233h19.6v.934H0v-.934zM19.6 6.1H0v.933h19.6V6.1zM0 7.967h19.6V8.9H0v-.933zm19.6 1.866H0v.934h19.6v-.934zM0 11.7h19.6v.933H0V11.7zm19.6 1.867H0v.933h19.6v-.933z" clip-rule="evenodd" />
                                                    <path fill="#46467F" d="M0 .5h8.4v6.533H0z" />
                                                    <g filter="url(#filter0_d_343_121520)">
                                                        <path
                                                            fill="url(#paint0_linear_343_121520)"
                                                            fill-rule="evenodd"
                                                            d="M1.867 1.9a.467.467 0 11-.934 0 .467.467 0 01.934 0zm1.866 0a.467.467 0 11-.933 0 .467.467 0 01.933 0zm1.4.467a.467.467 0 100-.934.467.467 0 000 .934zM7.467 1.9a.467.467 0 11-.934 0 .467.467 0 01.934 0zM2.333 3.3a.467.467 0 100-.933.467.467 0 000 .933zm2.334-.467a.467.467 0 11-.934 0 .467.467 0 01.934 0zm1.4.467a.467.467 0 100-.933.467.467 0 000 .933zm1.4.467a.467.467 0 11-.934 0 .467.467 0 01.934 0zm-2.334.466a.467.467 0 100-.933.467.467 0 000 .933zm-1.4-.466a.467.467 0 11-.933 0 .467.467 0 01.933 0zM1.4 4.233a.467.467 0 100-.933.467.467 0 000 .933zm1.4.467a.467.467 0 11-.933 0 .467.467 0 01.933 0zm1.4.467a.467.467 0 100-.934.467.467 0 000 .934zM6.533 4.7a.467.467 0 11-.933 0 .467.467 0 01.933 0zM7 6.1a.467.467 0 100-.933.467.467 0 000 .933zm-1.4-.467a.467.467 0 11-.933 0 .467.467 0 01.933 0zM3.267 6.1a.467.467 0 100-.933.467.467 0 000 .933zm-1.4-.467a.467.467 0 11-.934 0 .467.467 0 01.934 0z"
                                                            clip-rule="evenodd"
                                                        />
                                                    </g>
                                                </g>
                                                <defs>
                                                    <linearGradient id="paint0_linear_343_121520" x1=".933" x2=".933" y1="1.433" y2="6.1" gradientUnits="userSpaceOnUse">
                                                        <stop stop-color="#fff" />
                                                        <stop offset="1" stop-color="#F0F0F0" />
                                                    </linearGradient>
                                                    <filter id="filter0_d_343_121520" width="6.533" height="5.667" x=".933" y="1.433" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
                                                        <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                                        <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                                                        <feOffset dy="1" />
                                                        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
                                                        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_343_121520" />
                                                        <feBlend in="SourceGraphic" in2="effect1_dropShadow_343_121520" result="shape" />
                                                    </filter>
                                                </defs>
                                            </svg>
                                            +1
                                            <svg className="-me-0.5 ms-2 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                                            </svg>
                                        </button>
                                        <div id="dropdown_phone_input_billing_modal" className="z-10 hidden w-56 divide-y divide-gray-100 rounded-lg bg-white shadow dark:bg-gray-700">
                                            <ul className="p-2 text-sm font-medium text-gray-700 dark:text-gray-200" aria-labelledby="dropdown_phone_input__button_billing_modal">
                                                <li>
                                                    <button type="button" className="inline-flex w-full rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">
                                                        <span className="inline-flex items-center">
                                                            <svg fill="none" aria-hidden="true" className="me-2 h-4 w-4" viewBox="0 0 20 15">
                                                                <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                                                                <mask id="a"  width="20" height="15" x="0" y="0" maskUnits="userSpaceOnUse">
                                                                    <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                                                                </mask>
                                                                <g mask="url(#a)">
                                                                    <path fill="#D02F44" fill-rule="evenodd" d="M19.6.5H0v.933h19.6V.5zm0 1.867H0V3.3h19.6v-.933zM0 4.233h19.6v.934H0v-.934zM19.6 6.1H0v.933h19.6V6.1zM0 7.967h19.6V8.9H0v-.933zm19.6 1.866H0v.934h19.6v-.934zM0 11.7h19.6v.933H0V11.7zm19.6 1.867H0v.933h19.6v-.933z" clip-rule="evenodd" />
                                                                    <path fill="#46467F" d="M0 .5h8.4v6.533H0z" />
                                                                    <g filter="url(#filter0_d_343_121520)">
                                                                        <path
                                                                            fill="url(#paint0_linear_343_121520)"
                                                                            fill-rule="evenodd"
                                                                            d="M1.867 1.9a.467.467 0 11-.934 0 .467.467 0 01.934 0zm1.866 0a.467.467 0 11-.933 0 .467.467 0 01.933 0zm1.4.467a.467.467 0 100-.934.467.467 0 000 .934zM7.467 1.9a.467.467 0 11-.934 0 .467.467 0 01.934 0zM2.333 3.3a.467.467 0 100-.933.467.467 0 000 .933zm2.334-.467a.467.467 0 11-.934 0 .467.467 0 01.934 0zm1.4.467a.467.467 0 100-.933.467.467 0 000 .933zm1.4.467a.467.467 0 11-.934 0 .467.467 0 01.934 0zm-2.334.466a.467.467 0 100-.933.467.467 0 000 .933zm-1.4-.466a.467.467 0 11-.933 0 .467.467 0 01.933 0zM1.4 4.233a.467.467 0 100-.933.467.467 0 000 .933zm1.4.467a.467.467 0 11-.933 0 .467.467 0 01.933 0zm1.4.467a.467.467 0 100-.934.467.467 0 000 .934zM6.533 4.7a.467.467 0 11-.933 0 .467.467 0 01.933 0zM7 6.1a.467.467 0 100-.933.467.467 0 000 .933zm-1.4-.467a.467.467 0 11-.933 0 .467.467 0 01.933 0zM3.267 6.1a.467.467 0 100-.933.467.467 0 000 .933zm-1.4-.467a.467.467 0 11-.934 0 .467.467 0 01.934 0z"
                                                                            clip-rule="evenodd"
                                                                        />
                                                                    </g>
                                                                </g>
                                                                <defs>
                                                                    <linearGradient id="paint0_linear_343_121520" x1=".933" x2=".933" y1="1.433" y2="6.1" gradientUnits="userSpaceOnUse">
                                                                        <stop stop-color="#fff" />
                                                                        <stop offset="1" stop-color="#F0F0F0" />
                                                                    </linearGradient>
                                                                    <filter id="filter0_d_343_121520" width="6.533" height="5.667" x=".933" y="1.433" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
                                                                        <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                                                        <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                                                                        <feOffset dy="1" />
                                                                        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
                                                                        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_343_121520" />
                                                                        <feBlend in="SourceGraphic" in2="effect1_dropShadow_343_121520" result="shape" />
                                                                    </filter>
                                                                </defs>
                                                            </svg>
                                                            United States (+1)
                                                        </span>
                                                    </button>
                                                </li>
                                                <li>
                                                    <button type="button" className="inline-flex w-full rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">
                                                        <span className="inline-flex items-center">
                                                            <svg className="me-2 h-4 w-4" fill="none" viewBox="0 0 20 15">
                                                                <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                                                                <mask id="a"  width="20" height="15" x="0" y="0" maskUnits="userSpaceOnUse">
                                                                    <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                                                                </mask>
                                                                <g mask="url(#a)">
                                                                    <path fill="#0A17A7" d="M0 .5h19.6v14H0z" />
                                                                    <path fill="#fff" fill-rule="evenodd" d="M-.898-.842L7.467 4.8V-.433h4.667V4.8l8.364-5.642L21.542.706l-6.614 4.46H19.6v4.667h-4.672l6.614 4.46-1.044 1.549-8.365-5.642v5.233H7.467V10.2l-8.365 5.642-1.043-1.548 6.613-4.46H0V5.166h4.672L-1.941.706-.898-.842z" clip-rule="evenodd" />
                                                                    <path stroke="#DB1F35" stroke-linecap="round" strokeWidth=".667" d="M13.067 4.933L21.933-.9M14.009 10.088l7.947 5.357M5.604 4.917L-2.686-.67M6.503 10.024l-9.189 6.093" />
                                                                    <path fill="#E6273E" fill-rule="evenodd" d="M0 8.9h8.4v5.6h2.8V8.9h8.4V6.1h-8.4V.5H8.4v5.6H0v2.8z" clip-rule="evenodd" />
                                                                </g>
                                                            </svg>
                                                            United Kingdom (+44)
                                                        </span>
                                                    </button>
                                                </li>
                                                <li>
                                                    <button type="button" className="inline-flex w-full rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">
                                                        <span className="inline-flex items-center">
                                                            <svg className="me-2 h-4 w-4" fill="none" viewBox="0 0 20 15" xmlns="http://www.w3.org/2000/svg">
                                                                <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                                                                <mask id="a"  width="20" height="15" x="0" y="0" maskUnits="userSpaceOnUse">
                                                                    <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                                                                </mask>
                                                                <g mask="url(#a)">
                                                                    <path fill="#0A17A7" d="M0 .5h19.6v14H0z" />
                                                                    <path fill="#fff" stroke="#fff" strokeWidth=".667" d="M0 .167h-.901l.684.586 3.15 2.7v.609L-.194 6.295l-.14.1v1.24l.51-.319L3.83 5.033h.73L7.7 7.276a.488.488 0 00.601-.767L5.467 4.08v-.608l2.987-2.134a.667.667 0 00.28-.543V-.1l-.51.318L4.57 2.5h-.73L.66.229.572.167H0z" />
                                                                    <path fill="url(#paint0_linear_374_135177)" fill-rule="evenodd" d="M0 2.833V4.7h3.267v2.133c0 .369.298.667.666.667h.534a.667.667 0 00.666-.667V4.7H8.2a.667.667 0 00.667-.667V3.5a.667.667 0 00-.667-.667H5.133V.5H3.267v2.333H0z" clip-rule="evenodd" />
                                                                    <path fill="url(#paint1_linear_374_135177)" fill-rule="evenodd" d="M0 3.3h3.733V.5h.934v2.8H8.4v.933H4.667v2.8h-.934v-2.8H0V3.3z" clip-rule="evenodd" />
                                                                    <path
                                                                        fill="#fff"
                                                                        fill-rule="evenodd"
                                                                        d="M4.2 11.933l-.823.433.157-.916-.666-.65.92-.133.412-.834.411.834.92.134-.665.649.157.916-.823-.433zm9.8.7l-.66.194.194-.66-.194-.66.66.193.66-.193-.193.66.193.66-.66-.194zm0-8.866l-.66.193.194-.66-.194-.66.66.193.66-.193-.193.66.193.66-.66-.193zm2.8 2.8l-.66.193.193-.66-.193-.66.66.193.66-.193-.193.66.193.66-.66-.193zm-5.6.933l-.66.193.193-.66-.193-.66.66.194.66-.194-.193.66.193.66-.66-.193zm4.2 1.167l-.33.096.096-.33-.096-.33.33.097.33-.097-.097.33.097.33-.33-.096z"
                                                                        clip-rule="evenodd"
                                                                    />
                                                                </g>
                                                                <defs>
                                                                    <linearGradient id="paint0_linear_374_135177" x1="0" x2="0" y1=".5" y2="7.5" gradientUnits="userSpaceOnUse">
                                                                        <stop stop-color="#fff" />
                                                                        <stop offset="1" stop-color="#F0F0F0" />
                                                                    </linearGradient>
                                                                    <linearGradient id="paint1_linear_374_135177" x1="0" x2="0" y1=".5" y2="7.033" gradientUnits="userSpaceOnUse">
                                                                        <stop stop-color="#FF2E3B" />
                                                                        <stop offset="1" stop-color="#FC0D1B" />
                                                                    </linearGradient>
                                                                </defs>
                                                            </svg>
                                                            Australia (+61)
                                                        </span>
                                                    </button>
                                                </li>
                                                <li>
                                                    <button type="button" className="inline-flex w-full rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">
                                                        <span className="inline-flex items-center">
                                                            <svg className="me-2 h-4 w-4" fill="none" viewBox="0 0 20 15">
                                                                <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                                                                <mask id="a"  width="20" height="15" x="0" y="0" maskUnits="userSpaceOnUse">
                                                                    <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                                                                </mask>
                                                                <g mask="url(#a)">
                                                                    <path fill="#262626" fill-rule="evenodd" d="M0 5.167h19.6V.5H0v4.667z" clip-rule="evenodd" />
                                                                    <g filter="url(#filter0_d_374_135180)">
                                                                        <path fill="#F01515" fill-rule="evenodd" d="M0 9.833h19.6V5.167H0v4.666z" clip-rule="evenodd" />
                                                                    </g>
                                                                    <g filter="url(#filter1_d_374_135180)">
                                                                        <path fill="#FFD521" fill-rule="evenodd" d="M0 14.5h19.6V9.833H0V14.5z" clip-rule="evenodd" />
                                                                    </g>
                                                                </g>
                                                                <defs>
                                                                    <filter id="filter0_d_374_135180" width="19.6" height="4.667" x="0" y="5.167" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
                                                                        <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                                                        <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                                                                        <feOffset />
                                                                        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
                                                                        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_374_135180" />
                                                                        <feBlend in="SourceGraphic" in2="effect1_dropShadow_374_135180" result="shape" />
                                                                    </filter>
                                                                    <filter id="filter1_d_374_135180" width="19.6" height="4.667" x="0" y="9.833" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
                                                                        <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                                                        <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                                                                        <feOffset />
                                                                        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
                                                                        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_374_135180" />
                                                                        <feBlend in="SourceGraphic" in2="effect1_dropShadow_374_135180" result="shape" />
                                                                    </filter>
                                                                </defs>
                                                            </svg>
                                                            Germany (+49)
                                                        </span>
                                                    </button>
                                                </li>
                                                <li>
                                                    <button type="button" className="inline-flex w-full rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">
                                                        <span className="inline-flex items-center">
                                                            <svg className="me-2 h-4 w-4" fill="none" viewBox="0 0 20 15">
                                                                <rect width="19.1" height="13.5" x=".25" y=".75" fill="#fff" stroke="#F5F5F5" strokeWidth=".5" rx="1.75" />
                                                                <mask id="a"  width="20" height="15" x="0" y="0" maskUnits="userSpaceOnUse">
                                                                    <rect width="19.1" height="13.5" x=".25" y=".75" fill="#fff" stroke="#fff" strokeWidth=".5" rx="1.75" />
                                                                </mask>
                                                                <g mask="url(#a)">
                                                                    <path fill="#F44653" d="M13.067.5H19.6v14h-6.533z" />
                                                                    <path fill="#1035BB" fill-rule="evenodd" d="M0 14.5h6.533V.5H0v14z" clip-rule="evenodd" />
                                                                </g>
                                                            </svg>
                                                            France (+33)
                                                        </span>
                                                    </button>
                                                </li>
                                                <li>
                                                    <button type="button" className="inline-flex w-full rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">
                                                        <span className="inline-flex items-center">
                                                            <svg className="me-2 h-4 w-4" fill="none" viewBox="0 0 20 15">
                                                                <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                                                                <mask id="a"  width="20" height="15" x="0" y="0" maskUnits="userSpaceOnUse">
                                                                    <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                                                                </mask>
                                                                <g mask="url(#a)">
                                                                    <path fill="#262626" fill-rule="evenodd" d="M0 5.167h19.6V.5H0v4.667z" clip-rule="evenodd" />
                                                                    <g filter="url(#filter0_d_374_135180)">
                                                                        <path fill="#F01515" fill-rule="evenodd" d="M0 9.833h19.6V5.167H0v4.666z" clip-rule="evenodd" />
                                                                    </g>
                                                                    <g filter="url(#filter1_d_374_135180)">
                                                                        <path fill="#FFD521" fill-rule="evenodd" d="M0 14.5h19.6V9.833H0V14.5z" clip-rule="evenodd" />
                                                                    </g>
                                                                </g>
                                                                <defs>
                                                                    <filter id="filter0_d_374_135180" width="19.6" height="4.667" x="0" y="5.167" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
                                                                        <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                                                        <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                                                                        <feOffset />
                                                                        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
                                                                        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_374_135180" />
                                                                        <feBlend in="SourceGraphic" in2="effect1_dropShadow_374_135180" result="shape" />
                                                                    </filter>
                                                                    <filter id="filter1_d_374_135180" width="19.6" height="4.667" x="0" y="9.833" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
                                                                        <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                                                        <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                                                                        <feOffset />
                                                                        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
                                                                        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_374_135180" />
                                                                        <feBlend in="SourceGraphic" in2="effect1_dropShadow_374_135180" result="shape" />
                                                                    </filter>
                                                                </defs>
                                                            </svg>
                                                            Germany (+49)
                                                        </span>
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="relative w-full">
                                            <input type="text" id="phone-input" className="z-20 block w-full rounded-e-lg border border-s-0 border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:border-s-gray-700  dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" placeholder="123-456-7890" required />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <div className="mb-2 flex items-center gap-2">
                                        <label htmlFor="select_country_input_billing_modal" className="block text-sm font-medium text-gray-900 dark:text-white"> Country* </label>
                                    </div>
                                    <select id="select_country_input_billing_modal" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500">
                                        <option selected>United States</option>
                                        <option value="AS">Australia</option>
                                        <option value="FR">France</option>
                                        <option value="ES">Spain</option>
                                        <option value="UK">United Kingdom</option>
                                    </select>
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <div className="mb-2 flex items-center gap-2">
                                        <label htmlFor="select_city_input_billing_modal" className="block text-sm font-medium text-gray-900 dark:text-white"> City* </label>
                                    </div>
                                    <select id="select_city_input_billing_modal" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500">
                                        <option selected>San Francisco</option>
                                        <option value="NY">New York</option>
                                        <option value="LA">Los Angeles</option>
                                        <option value="CH">Chicago</option>
                                        <option value="HU">Houston</option>
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label htmlFor="address_billing_modal" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> Delivery Address* </label>
                                    <textarea id="address_billing_modal" rows="4" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="Enter here your address"></textarea>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label htmlFor="company_name" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> Company name </label>
                                    <input type="text" id="company_name" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="Flowbite LLC" />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label htmlFor="vat_number" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> VAT number </label>
                                    <input type="text" id="vat_number" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="DE42313253" />
                                </div>
                            </div>
                            <div className="border-t border-gray-200 pt-4 dark:border-gray-700 md:pt-5">
                                <button type="submit" className="me-2 inline-flex items-center rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Save information</button>
                                <button type="button" data-modal-toggle="accountInformationModal2" className="me-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            
            {/* Edit User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50">
                    <div className="relative max-h-full w-full max-w-md p-4">
                        {/* Modal content */}
                        <div className="relative rounded-lg bg-white shadow dark:bg-gray-800">
                            {/* Modal header */}
                            <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4 dark:border-gray-700 md:p-5">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Edit Profile Information
                                </h3>
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                                >
                                    <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            
                            {/* Modal body */}
                            <form onSubmit={handleSubmit} className="p-4 md:p-5">
                                <div className="mb-5 space-y-4">
                                    {/* Name Field */}
                                    <div>
                                        <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`block w-full rounded-lg border p-2.5 text-sm focus:ring-2 ${
                                                errors.name
                                                    ? 'border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:bg-red-100 dark:text-red-900'
                                                    : 'border-gray-300 bg-gray-50 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500'
                                            }`}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Phone Field */}
                                    <div>
                                        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                            Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className={`block w-full rounded-lg border p-2.5 text-sm focus:ring-2 ${
                                                errors.phone
                                                    ? 'border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:bg-red-100 dark:text-red-900'
                                                    : 'border-gray-300 bg-gray-50 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500'
                                            }`}
                                            placeholder="Enter your phone number"
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                                        )}
                                    </div>

                                    {/* District Field */}
                                    <div>
                                        <label htmlFor="district" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                            District
                                        </label>
                                        <input
                                            type="text"
                                            id="district"
                                            name="district"
                                            value={formData.district}
                                            onChange={handleInputChange}
                                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                                            placeholder="Enter your district"
                                        />
                                    </div>

                                    {/* Email Field (Read-only) */}
                                    <div>
                                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Email Address (Cannot be changed)
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={user?.email || ''}
                                            className="block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400"
                                            disabled
                                        />
                                    </div>
                                </div>
                                
                                {/* Action buttons */}
                                <div className="border-t border-gray-200 pt-4 dark:border-gray-700 md:pt-5">
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className={`me-2 inline-flex items-center rounded-lg px-5 py-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-4 ${
                                            isUpdating
                                                ? 'cursor-not-allowed bg-gray-400 dark:bg-gray-600'
                                                : 'bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
                                        }`}
                                    >
                                        {isUpdating && (
                                            <svg className="me-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        {isUpdating ? 'Updating...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeEditModal}
                                        disabled={isUpdating}
                                        className="me-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ show: false, message: '', type: 'success' })}
            />

        </section>
    );
}

export default Profile