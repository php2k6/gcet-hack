import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { User, Home, FileText, Info, MapPin } from 'lucide-react';

const Heatmap = () => {
  const mapRef = useRef(null);
  const navbarRef = useRef(null);
  const titleRef = useRef(null);
  const legendRef = useRef(null);
  const mapInstance = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

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

  // Initialize map when Leaflet is loaded
  useEffect(() => {
    if (!isMapLoaded || !window.L || !mapRef.current) return;

    // Initialize map
    const map = window.L.map(mapRef.current).setView([22.56, 72.95], 11);
    mapInstance.current = map;

    // Add tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Define custom icons
    const garbageIcon = window.L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/2514/2514330.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -28]
    });

    const potholeIcon = window.L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/12843/12843591.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -28]
    });

    const electricityIcon = window.L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/252/252590.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -28]
    });

    // Sample complaints data
    const markers = [
      { lat: 22.56, lng: 72.95, type: "Garbage", desc: "Overflowing bin near Anand market", status: "Open", icon: garbageIcon },
      { lat: 22.59, lng: 72.96, type: "Pothole", desc: "Large pothole on main road", status: "In Progress", icon: potholeIcon },
      { lat: 22.56, lng: 72.92, type: "Electricity", desc: "Street light not working", status: "Resolved", icon: electricityIcon },
      { lat: 22.40, lng: 72.91, type: "Garbage", desc: "Uncollected waste near park", status: "Open", icon: garbageIcon },
      { lat: 22.54, lng: 72.99, type: "Pothole", desc: "Road damage due to rain", status: "In Progress", icon: potholeIcon },
      { lat: 22.58, lng: 72.93, type: "Electricity", desc: "Transformer issue", status: "Open", icon: electricityIcon },
      { lat: 22.50, lng: 72.94, type: "Garbage", desc: "Dump site in residential area", status: "Resolved", icon: garbageIcon },
      { lat: 22.61, lng: 72.97, type: "Pothole", desc: "Dangerous road depression", status: "Open", icon: potholeIcon },
      { lat: 22.57, lng: 72.91, type: "Electricity", desc: "Loose wires hanging", status: "In Progress", icon: electricityIcon },
      { lat: 22.55, lng: 72.97, type: "Garbage", desc: "Clogged drain with waste", status: "Open", icon: garbageIcon },
      { lat: 22.53, lng: 72.95, type: "Pothole", desc: "Pothole causing traffic near CVM public garden", status: "Resolved", icon: potholeIcon },
      { lat: 22.52, lng: 72.98, type: "Electricity", desc: "Frequent power cuts reported", status: "Open", icon: electricityIcon }
    ];

    // Add markers to map
    markers.forEach((markerData) => {
      const marker = window.L.marker([markerData.lat, markerData.lng], {
        icon: markerData.icon,
        riseOnHover: true
      }).addTo(map);

      const statusColor = markerData.status === "Resolved" ? "#10b981" :
        markerData.status === "In Progress" ? "#f59e0b" : "#ef4444";

      marker.bindPopup(
        `<div class="p-2">
          <div class="font-bold text-lg mb-2">${markerData.type}</div>
          <div class="text-gray-700 mb-2">${markerData.desc}</div>
          <div class="flex items-center">
            <span class="text-sm font-medium">Status: </span>
            <span class="ml-1 px-2 py-1 rounded text-xs font-semibold text-white" style="background-color: ${statusColor}">
              ${markerData.status}
            </span>
          </div>
          
          <div class="mt-2 text-center">
            <button class="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
              View Details
            </button>
          </div>`,
        { offset: [0, -28] }
      );
    });

    // Animate markers after a short delay
    setTimeout(() => {
      const markerElements = document.querySelectorAll('.leaflet-marker-icon');
      gsap.fromTo(markerElements,
        { scale: 0, rotation: 180 },
        { scale: 1, rotation: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" }
      );
    }, 1000);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isMapLoaded]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'text-green-600';
      case 'In Progress':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50">

      {/* Map Title */}
      <div ref={titleRef} className="absolute top-24 left-8 z-40">
        <h2 className="text-3xl text-slate-800 mb-1">
          Anand District Grievance Map
        </h2>
        <p className="text-sm text-gray-600 flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          Click on markers for complaint details
        </p>
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
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Total Complaints:</span>
            <span className="text-sm font-bold text-gray-800">12</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-red-600">Open:</span>
            <span className="text-sm font-bold text-red-600">6</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-yellow-600">In Progress:</span>
            <span className="text-sm font-bold text-yellow-600">3</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-green-600">Resolved:</span>
            <span className="text-sm font-bold text-green-600">3</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mb-4"></div>
            <p className="text-gray-600">Loading Grievance Map...</p>
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