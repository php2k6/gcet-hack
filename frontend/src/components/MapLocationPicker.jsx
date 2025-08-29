import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            map.flyTo(e.latlng, map.getZoom());
        }
    });

    return position === null ? null : (
        <Marker position={position} />
    );
};

const MapLocationPicker = ({ onLocationSelect, onClose, initialPosition = null }) => {
    const [position, setPosition] = useState(initialPosition || [23.0225, 72.5714]); // Default to Ahmedabad
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    // Reverse geocoding to get address from coordinates
    const getAddressFromCoords = async (lat, lng) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            if (data.display_name) {
                setAddress(data.display_name);
            }
        } catch (error) {
            console.error('Error getting address:', error);
            setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (position) {
            getAddressFromCoords(position[0], position[1]);
        }
    }, [position]);

    const handleConfirm = () => {
        if (position) {
            onLocationSelect({
                latitude: position[0],
                longitude: position[1],
                address: address,
                coordinates: `${position[0].toFixed(5)}, ${position[1].toFixed(5)}`
            });
            onClose();
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition([latitude, longitude]);
                setLoading(false);
            },
            (error) => {
                console.error(error);
                alert("Unable to fetch current location.");
                setLoading(false);
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-800">Select Location</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Map Container */}
                <div className="relative">
                    <MapContainer
                        center={position}
                        zoom={13}
                        style={{ height: '400px', width: '100%' }}
                        className="z-10"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker position={position} setPosition={setPosition} />
                    </MapContainer>

                    {/* Current Location Button */}
                    <button
                        onClick={getCurrentLocation}
                        disabled={loading}
                        className="absolute right-4 top-4 z-20 rounded-lg bg-white p-2 shadow-md hover:shadow-lg disabled:opacity-50"
                        title="Get Current Location"
                    >
                        {loading ? (
                            <svg className="h-5 w-5 animate-spin text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Address Display */}
                <div className="border-t border-gray-200 p-4">
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Selected Location:
                        </label>
                        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                            {loading ? (
                                <div className="flex items-center">
                                    <svg className="mr-2 h-4 w-4 animate-spin text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Loading address...
                                </div>
                            ) : (
                                address || `${position[0].toFixed(5)}, ${position[1].toFixed(5)}`
                            )}
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 mb-4">
                        <strong>Coordinates:</strong> {position[0].toFixed(6)}, {position[1].toFixed(6)}
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                        Click anywhere on the map to select a location, or use the location button to get your current position.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleConfirm}
                            disabled={!position}
                            className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-2 font-semibold text-white transition hover:shadow-lg disabled:opacity-50"
                        >
                            Confirm Location
                        </button>
                        <button
                            onClick={onClose}
                            className="rounded-xl border border-gray-300 px-6 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapLocationPicker;
