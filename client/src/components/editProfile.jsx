import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { LoadScript, Autocomplete } from "@react-google-maps/api";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const EditProfile = () => {
  const { userId } = useParams();
  const [autocomplete, setAutocomplete] = useState(null);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);

  const onLoad = (autoC) => setAutocomplete(autoC);

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        setCoords({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          place_id: place.place_id,
        });
        setAddress(place.formatted_address);
      }
    }
  };

  const handleSave = async () => {
    if (!coords || !address) return;

    const token = localStorage.getItem("token");
    await fetch(`${baseURL}/api/users/${userId}/location`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...coords, address }),
    });
    alert("Location updated!");
  };

  return (
    <div className="p-6">
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["places"]}>
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
          <input
            type="text"
            placeholder="Enter your location"
            className="w-full p-2 border rounded"
          />
        </Autocomplete>
      </LoadScript>
      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Save Location
      </button>
      {address && <p className="mt-2 text-gray-600">Selected: {address}</p>}
    </div>
  );
};

export default EditProfile;