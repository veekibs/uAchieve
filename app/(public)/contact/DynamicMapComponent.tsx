"use client";

import React from 'react';
import dynamic from 'next/dynamic'; // Import dynamic for client-side loading

// Dynamically import the LeafletMap component, disabling SSR
// This ensures that the code containing direct 'leaflet' and 'react-leaflet' imports
// is never processed on the server.
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
      Loading Map...
    </div>
  ),
});

export default function DynamicMapComponent() {
  return <LeafletMap />;
}
