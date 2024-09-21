"use client";
import React, { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

// Set the container size for the map
const containerStyle = {
  width: "100%",
  height: "400px",
};

// Initial center of the map (latitude, longitude)
const center = {
  lat: 40.748817,
  lng: -73.985428,
};

function MyMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  const [coordinates, setCoordinates] = useState<{
    lat: number | null;
    lng: number | null;
  }>({ lat: null, lng: null });

  // Function to handle the map click event
  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    setCoordinates({ lat: lat ?? null, lng: lng ?? null });
  }, []);

  return isLoaded ? (
    <div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onClick={onMapClick}
      >
        {/* Show marker at the clicked location */}
        {coordinates.lat && coordinates.lng && (
          <Marker position={{ lat: coordinates.lat, lng: coordinates.lng }} />
        )}
      </GoogleMap>

      {/* Display the coordinates */}
      {coordinates.lat && coordinates.lng && (
        <div>
          <p>Latitude: {coordinates.lat}</p>
          <p>Longitude: {coordinates.lng}</p>
        </div>
      )}
    </div>
  ) : (
    <p>Loading...</p>
  );
}

export default React.memo(MyMap);
