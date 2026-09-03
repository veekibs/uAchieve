"use client"; // This component will be rendered on the client

import React, { useState, useEffect } from 'react';
// We will NOT import L, MapContainer, TileLayer, Marker, Popup statically here.
// They will be dynamically imported inside the useEffect hook.

export default function LeafletMap() {
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [customMarkerIcon, setCustomMarkerIcon] = useState<any>(null);
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: any;
    TileLayer: any;
    Marker: any;
    Popup: any;
  } | null>(null);

  useEffect(() => {
    // Only attempt to load Leaflet and React-Leaflet in the browser environment
    if (typeof window !== 'undefined') {
      const loadLeaflet = async () => {
        try {
          // Use dynamic import with type assertion to handle leaflet module
          const L = (await import('leaflet')).default;
          const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet');

          const icon = new L.Icon({
            iconUrl: '/images/map-marker.png',
            iconRetinaUrl: '/images/map-marker@2x.png',
            iconSize: [38, 38],
            iconAnchor: [19, 38],
            popupAnchor: [0, -38],
          });
          setCustomMarkerIcon(icon);

          setMapComponents({
            MapContainer: MapContainer,
            TileLayer: TileLayer,
            Marker: Marker,
            Popup: Popup,
          });
          setLeafletLoaded(true);
        } catch (error) {
          console.error("Failed to load Leaflet or React-Leaflet:", error);
        }
      };

      loadLeaflet();
    }
  }, []);

  if (!leafletLoaded || !MapComponents || !customMarkerIcon) {
    // The loading state is handled by the `dynamic` import in DynamicMapComponent.tsx,
    // so we can return null here to avoid rendering anything until fully loaded.
    return null;
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents;

  return (
    <MapContainer
      center={[52.136, -0.468]} // Approximate coordinates for Bedford
      zoom={13}
      scrollWheelZoom={false}
      className="w-full h-full z-0" // Ensure map fills container and is behind overlay
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[52.136, -0.468]} icon={customMarkerIcon}>
        <Popup>
          <div className="font-['Plus Jakarta Sans']">
            <p className="text-slate-800 text-sm font-bold leading-5 mb-1">UAchieve Training Centre</p>
            <p className="text-gray-600 text-xs font-normal leading-4">123 Training Street, London EC1V 3NB</p>
            <p className="text-gray-400 text-xs font-normal leading-4 mt-1">Exact venue confirmed in booking email</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
