// src/pages/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker} from "react-leaflet";

import L from "leaflet";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const baseURL = import.meta.env.VITE_API_BASE_URL;

const UserProfile = () => {
  const { userId } = useParams(); // from route like "/:userId/profile"
  const [user, setUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (!userId) {
      setError("No user id provided in URL");
      setLoading(false);
      return;
    }

    const id = parseInt(userId, 10);
    if (Number.isNaN(id)) {
      setError("Invalid user id");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    

    const fetchUser = async () => {
      setError(null);
      setNotFound(false);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return fetch(`${baseURL}/api/books/${id}/profile`, { headers, signal: controller.signal })
        .then(async (res) => {
          if (res.status === 404) {
            setNotFound(true);
            return null;
          }
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`${res.status} ${res.statusText} — ${text}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data) setUser(data);
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          console.error("Error fetching profile:", err);
          setError(err.message || "Failed to fetch profile");
        });
    };



    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      return fetch(`${baseURL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.user) {
            setCurrentUserId(data.user.id);
          } else if (data && data.id) {
            setCurrentUserId(data.id);
          } else {
            console.error("Unexpected /api/auth/me response:", data);
          }
        })
        .catch((err) => {
          console.error("Error fetching current user:", err);
        });
    };

    
    
  Promise.all([fetchUser(), fetchCurrentUser()])
  .catch(err => console.error("Error in fetching data:", err))
  .finally(() => setLoading(false));
    
    return () => controller.abort();
  }, [userId]);


  if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAECB6]">
      <ClipLoader size={50} color="#2563eb" /> 
    </div>
  );
}
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 bg-[#FAECB6]">
        Error: {error}
      </div>
    );
  }
  if (!loading && !error && user === null && !notFound) {
    // don’t render anything yet, just wait
    
    return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAECB6]">
      <ClipLoader size={50} color="#2563eb" /> 
    </div>
  );;
  }

  if (notFound) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FAECB6]">No user found</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAECB6] p-6 flex flex-col items-center">
      {/* Profile Block */}
      <div className=" bg-[#93D3AE] border-2 border-black shadow-[6px_6px_0_#000000] w-full max-w-3xl rounded-2xl  p-6 flex flex-col items-center ">
        <img
          src={user.profilePic || "https://via.placeholder.com/150"}
          alt={user.name}
          className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-md"
        />
        <h1 className="text-2xl font-bold mt-4">{user.name}</h1>
        <p className="text-gray-600 mt-1">{user.email}</p>
        <p className="text-gray-500 text-sm mt-1">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
        {user.location?.address ? (
          <p className="text-gray-600 mt-1">
            📍 {user.location.address}
          </p>
        ) : (
          <p className="text-gray-800 mt-1">No location set</p>
        )}

        {user.location?.latitude && user.location?.longitude && (
          <a
            href={`https://www.google.com/maps?q=${user.location.latitude},${user.location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline mt-1"
          >
            View on Map
          </a>
        )}

        {user.location?.latitude && user.location?.longitude && (
          <div className="w-full h-48 mt-2 rounded-lg overflow-hidden shadow-md">
            <MapContainer
              center={[user.location.latitude, user.location.longitude]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[user.location.latitude, user.location.longitude]}
                icon={markerIcon}
              />
            </MapContainer>
          </div>
        )}

        
      </div>

      {/* Analytics Block */}
      <div className="grid grid-cols-3 gap-4 mt-6 w-full max-w-3xl">
        <div className="bg-[#2BBAA5] border-2 border-black shadow-[4px_4px_0_#000000] rounded-2xl p-4 text-center">
          <p className="text-xl font-bold">{user.stats?.booksListed ?? 0}</p>
          <p className="text-gray-600 text-sm">Books Listed</p>
        </div>

        <div className="bg-[#2BBAA5] border-2 border-black shadow-[4px_4px_0_#000000] rounded-2xl p-4 text-center">
          <p className="text-xl font-bold">{user.stats?.booksShared ?? 0}</p>
          <p className="text-gray-600 text-sm">Books Shared</p>
        </div>

        <div className="bg-[#2BBAA5] border-2 border-black shadow-[4px_4px_0_#000000] rounded-2xl p-4 text-center">
          <p className="text-xl font-bold">{user.stats?.booksBorrowed ?? 0}</p>
          <p className="text-gray-600 text-sm">Books Borrowed</p>
        </div>
      </div>

      {/* User's Books */}
      <div className="bg-[#93D3AE] border-2 border-black shadow-[6px_6px_0_#000000] w-full max-w-3xl rounded-2xl p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Books</h2>
        {user.books && user.books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.books.map((b) => (
              <div key={b.id} className="p-3 bg-gray-100 rounded-lg flex flex-col">
                <div className="font-semibold">{b.title}</div>
                <div className="text-sm text-gray-600">{b.author}</div>
                <div className="text-xs text-gray-500 mt-2">{b.genre}</div>
                <div className="mt-2 text-sm">{b.available ? "Available" : "Unavailable"}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No books listed yet</p>
        )}
      </div>

        
      {/* History Block */}
      <div className="bg-[#F9A822] border-2 border-black shadow-[6px_6px_0_#000000] w-full max-w-3xl rounded-2xl p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Recent Exchanges</h2>
        {user.history && user.history.length > 0 ? (
          <ul className="space-y-3">
            {user.history.map((item) => (
              <li key={item.id} className="p-3 bg-gray-100 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-600">Action: {item.action} — Status: {item.status}</div>
                </div>
                <div className="text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No exchange history yet</p>
        )}
      </div>

      {/* Edit / Settings */}
      {currentUserId === user.id && (
        <div className="mt-6">
          <Link to={`/${user.id}/edit`}>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {user.location?.latitude ? "Edit Location" : "Add Location"}
            </button>

          </Link>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
