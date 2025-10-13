import { useState } from "react";
import LocationPicker from "./LocationPicker";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export default function EditProfile() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState("");

  const handleSave = async () => {
    if (!selectedLocation) return alert("Please select a location");

    const token = localStorage.getItem("token");
    const res = await fetch(`${baseURL}/api/auth/update-location`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        address,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Location Updated", { duration: 3000 });
    } else {
      toast.Error("Error adding location", { duration: 3000 });
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-2">Select Your Location</h2>
      <LocationPicker onLocationSelect={setSelectedLocation} />
      <input
        type="text"
        placeholder="Optional location name / address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700"
      >
        Save Location
      </button>
    </div>
  );
}
