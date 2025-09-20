// src/pages/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const UserProfile = () => {
  const { userId } = useParams(); // from route like "/:userId/profile"
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${baseURL}/api/books/${id}/profile`, {
          headers,
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`${res.status} ${res.statusText} — ${text}`);
        }

        const data = await res.json();
        // book route returns the profile object directly
        setUser(data);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    return () => controller.abort();
  }, [userId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Error: {error}
      </div>
    );
  }
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">No user found</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAECB6] p-6 flex flex-col items-center">
      {/* Profile Block */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
        <img
          src={user.profilePic || "https://via.placeholder.com/150"}
          alt={user.name}
          className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-md"
        />
        <h1 className="text-2xl font-bold mt-4">{user.name}</h1>
        <p className="text-gray-600 mt-1">{user.email}</p>
        <p className="text-gray-500 text-sm mt-1">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
      </div>

      {/* Analytics Block */}
      <div className="grid grid-cols-3 gap-4 mt-6 w-full max-w-3xl">
        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <p className="text-xl font-bold">{user.stats?.booksListed ?? 0}</p>
          <p className="text-gray-600 text-sm">Books Listed</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <p className="text-xl font-bold">{user.stats?.booksShared ?? 0}</p>
          <p className="text-gray-600 text-sm">Books Shared</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <p className="text-xl font-bold">{user.stats?.booksBorrowed ?? 0}</p>
          <p className="text-gray-600 text-sm">Books Borrowed</p>
        </div>
      </div>

      {/* User's Books */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 mt-6">
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
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 mt-6">
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
      <div className="mt-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Edit Profile</button>
      </div>
    </div>
  );
};

export default UserProfile;
