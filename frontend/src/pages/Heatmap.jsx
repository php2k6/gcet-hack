import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { User, Home, FileText, Info, MapPin } from 'lucide-react';
import { useGetHeatmapData } from '../api/other';

const Heatmap = () => {
  const mapRef = useRef(null);
  const navbarRef = useRef(null);
  const titleRef = useRef(null);
  const legendRef = useRef(null);
  const mapInstance = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const location = useLocation();
  
  // Parse URL parameters for coordinate focusing
  const getURLParams = () => {
    const params = new URLSearchParams(location.search);
    return {
      lat: params.get('lat') ? parseFloat(params.get('lat')) : null,
      lng: params.get('lng') ? parseFloat(params.get('lng')) : null,
      zoom: params.get('zoom') ? parseInt(params.get('zoom')) : null,
      highlight: params.get('highlight') || null
    };
  };
  
  // Fetch heatmap data from API
  const { data: heatmapData, isLoading: isHeatmapLoading, error: heatmapError } = useGetHeatmapData();

  // Helper functions
  const getCategoryIcon = (category) => {
    const baseIconProps = {
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -28]
    };

    switch (category?.toLowerCase()) {
      case 'garbage':
      case 'sanitation':
        return window.L.icon({
          ...baseIconProps,
          iconUrl: 'https://cdn-icons-png.flaticon.com/128/2514/2514330.png'
        });
      case 'pothole':
      case 'road':
      case 'infrastructure':
        return window.L.icon({
          ...baseIconProps,
          iconUrl: 'https://cdn-icons-png.flaticon.com/128/12843/12843591.png'
        });
      case 'electricity':
      case 'utilities':
        return window.L.icon({
          ...baseIconProps,
          iconUrl: 'https://cdn-icons-png.flaticon.com/128/252/252590.png'
        });
      default:
        return window.L.icon({
          ...baseIconProps,
          iconUrl: 'https://cdn-icons-png.flaticon.com/128/1842/1842632.png' // Generic issue icon
        });
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return 'Open';
      case 1:
        return 'In Progress';
      case 2:
        return 'Resolved';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 2: // Resolved
        return '#10b981';
      case 1: // In Progress
        return '#f59e0b';
      case 0: // Open
      default:
        return '#ef4444';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 0:
        return 'Low';
      case 1:
        return 'Medium';
      case 2:
        return 'High';
      case 3:
        return 'Critical';
      default:
        return 'Unknown';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 3: // Critical
        return '#dc2626';
      case 2: // High
        return '#ea580c';
      case 1: // Medium
        return '#d97706';
      case 0: // Low
      default:
        return '#059669';
    }
  };

  // Parse location string to coordinates
  const parseLocation = (locationString) => {
    try {
      // Try to extract lat/lng from various formats
      // Format: "Lat: 23.0225, Lng: 72.5714" or "23.0225, 72.5714"
      const coordPattern = /(?:lat[:\s]*)?(-?\d+\.?\d*)[,\s]+(?:lng[:\s]*)?(-?\d+\.?\d*)/i;
      const match = locationString.match(coordPattern);
      
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        
        // Validate coordinates
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return [lat, lng];
        }
      }
      
      // Default to Anand if parsing fails
      return [22.56, 72.95];
    } catch (error) {
      console.error('Error parsing location:', error);
      return [22.56, 72.95];
    }
  };

  // Load Leaflet dynamically
  useEffect(() => {
    // Add Leaflet CSS
    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
    document.head.appendChild(leafletCSS);

    // Add Leaflet JS
    const leafletJS = document.createElement('script');
    leafletJS.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
    leafletJS.onload = () => {
      setIsMapLoaded(true);
    };
    document.head.appendChild(leafletJS);

    return () => {
      // Cleanup
      document.head.removeChild(leafletCSS);
      document.head.removeChild(leafletJS);
    };
  }, []);

  // Initialize map when Leaflet is loaded and data is available
  useEffect(() => {
    if (!isMapLoaded || !window.L || !mapRef.current || isHeatmapLoading) return;

    // Clear existing map if it exists
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    // Get URL parameters for coordinate focusing
    const urlParams = getURLParams();
    
    // Initialize map with coordinates from URL if available, otherwise use default
    const defaultLat = 22.56;
    const defaultLng = 72.95;
    const defaultZoom = 11;
    
    const mapLat = urlParams.lat || defaultLat;
    const mapLng = urlParams.lng || defaultLng;
    const mapZoom = urlParams.zoom || defaultZoom;
    
    const map = window.L.map(mapRef.current).setView([mapLat, mapLng], mapZoom);
    mapInstance.current = map;

    // Add tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Use only API data, no fallback
    const markersData = heatmapData && heatmapData.length > 0 ? heatmapData : [];

    console.log('Heatmap: Rendering', markersData.length, 'markers');
    if (markersData.length === 0) {
      console.log('Heatmap: No data available, rendering empty map');
    }

    // Add markers to map only if data is available
    if (markersData.length > 0) {
      markersData.forEach((markerData) => {
      const coords = parseLocation(markerData.location);
      const icon = getCategoryIcon(markerData.category);
      
      // Check if this marker should be highlighted
      const isHighlighted = urlParams.highlight && markerData.id === urlParams.highlight;
      
      const marker = window.L.marker(coords, {
        icon: icon,
        riseOnHover: true
      }).addTo(map);
      
      // If this marker is highlighted, open its popup automatically
      if (isHighlighted) {
        setTimeout(() => {
          marker.openPopup();
        }, 500); // Small delay to ensure map is fully loaded
      }

      const statusText = getStatusText(markerData.status);
      const statusColor = getStatusColor(markerData.status);
      const priorityText = getPriorityText(markerData.priority);
      const priorityColor = getPriorityColor(markerData.priority);

      marker.bindPopup(
        `<div class="p-3 min-w-[250px]">
          <div class="font-bold text-lg mb-2 text-gray-800">${markerData.title}</div>
          <div class="text-sm text-gray-600 mb-3">${markerData.category || 'General'}</div>
          
          <div class="space-y-2 mb-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Status:</span>
              <span class="px-2 py-1 rounded text-xs font-semibold text-white" style="background-color: ${statusColor}">
                ${statusText}
              </span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Priority:</span>
              <span class="px-2 py-1 rounded text-xs font-semibold text-white" style="background-color: ${priorityColor}">
                ${priorityText}
              </span>
            </div>
            
            <div class="text-xs text-gray-500 mt-2">
              <strong>Location:</strong> ${markerData.location}
            </div>
          </div>
          
          <div class="text-center">
            <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors">
              View Details
            </button>
          </div>
        </div>`,
        { offset: [0, -28] }
      );
      });

      // Animate markers after a short delay (only if markers exist)
      setTimeout(() => {
        const markerElements = document.querySelectorAll('.leaflet-marker-icon');
        if (markerElements.length > 0) {
          gsap.fromTo(markerElements,
            { scale: 0, rotation: 180 },
            { scale: 1, rotation: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" }
          );
        }
      }, 1000);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isMapLoaded, heatmapData, isHeatmapLoading, location.search]);

  // GSAP Animations
  useEffect(() => {
    const tl = gsap.timeline();

    // Animate navbar
    tl.fromTo(navbarRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );

    // Animate title
    tl.fromTo(titleRef.current,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=0.5"
    );

    // Animate legend
    tl.fromTo(legendRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=0.3"
    );

    // Map container fade in
    gsap.fromTo(mapRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.5, delay: 0.5, ease: "power2.out" }
    );
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50">

      {/* Map Title */}
      <div ref={titleRef} className="absolute top-24 left-8 z-40">
        <h2 className="text-3xl text-slate-800 mb-1">
          Anand District Grievance Map
        </h2>
        <p className="text-sm text-gray-600 flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {isHeatmapLoading ? "Loading complaint data..." : 
           heatmapError ? "Unable to load data" : 
           heatmapData && heatmapData.length > 0 ? "Click on markers for complaint details" :
           "No complaints data available"}
        </p>
        {heatmapData && heatmapData.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Showing {heatmapData.length} active complaints
          </p>
        )}
        {heatmapData && heatmapData.length === 0 && !isHeatmapLoading && (
          <p className="text-xs text-gray-500 mt-1">
            No complaints to display on map
          </p>
        )}
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* Legend */}
      <div
        ref={legendRef}
        className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-40 border"
      >
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Complaint Types</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <img
              src="https://cdn-icons-png.flaticon.com/128/2514/2514330.png"
              alt="Garbage"
              className="w-5 h-5"
            />
            <span className="text-sm text-gray-700">Garbage & Sanitation</span>
          </div>
          <div className="flex items-center space-x-3">
            <img
              src="https://cdn-icons-png.flaticon.com/128/12843/12843591.png"
              alt="Pothole"
              className="w-5 h-5"
            />
            <span className="text-sm text-gray-700">Road & Infrastructure</span>
          </div>
          <div className="flex items-center space-x-3">
            <img
              src="https://cdn-icons-png.flaticon.com/128/252/252590.png"
              alt="Electricity"
              className="w-5 h-5"
            />
            <span className="text-sm text-gray-700">Electricity & Utilities</span>
          </div>
        </div>

        {/* Status Legend */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">Status</h4>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Open</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Resolved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="absolute top-24 right-4 bg-white rounded-lg shadow-lg p-4 z-40 border">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Live Statistics</h3>
        {isHeatmapLoading ? (
          <div className="space-y-2">
            <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Total Complaints:</span>
              <span className="text-sm font-bold text-gray-800">
                {heatmapData?.length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-red-600">Open:</span>
              <span className="text-sm font-bold text-red-600">
                {heatmapData?.filter(item => item.status === 0).length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-yellow-600">In Progress:</span>
              <span className="text-sm font-bold text-yellow-600">
                {heatmapData?.filter(item => item.status === 1).length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-green-600">Resolved:</span>
              <span className="text-sm font-bold text-green-600">
                {heatmapData?.filter(item => item.status === 2).length || 0}
              </span>
            </div>
          </div>
        )}
        
        {heatmapError && (
          <div className="mt-2 text-xs text-red-500">
            Failed to load data
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {(!isMapLoaded || isHeatmapLoading) && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mb-4"></div>
            <p className="text-gray-600">
              {!isMapLoaded ? "Loading Map..." : "Loading Grievance Data..."}
            </p>
          </div>
        </div>
      )}
      <style>
        {`.dark .leaflet-layer,
.dark .leaflet-control-zoom-in,
.dark .leaflet-control-zoom-out,
.dark .leaflet-control-attribution {
  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
}`}
      </style>
    </div>
  );
};

export default Heatmap;