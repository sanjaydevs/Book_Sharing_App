import React, { useState ,useEffect} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";



export default function Browse () {
  const [books, setBooks]=useState([]);
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate=useNavigate();

  useEffect(()=>{
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      alert("You need to be logged in to browse books.");
      return;
    }

    const fetchBooks = async ()=>{
      try{
        const res = await axios.get("http://localhost:5000/api/books/all", {
          headers:{
            Authorization: `Bearer ${token}'`
          },
        });
        setBooks(res.data.books);
      } catch(err){
        console.error("Error fetching books:", err);
        alert("Failed to fetch books. Please try again later.");
      }
    };
    fetchBooks();

  },[navigate]);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <h1 className="text-3xl font-semibold mb-6 text-center text-blue-600">
        Browse Books
      </h1>

      <div className="flex justify-center mb-8 gap-3">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button className="px-4 rounded-lg bg-blue-500 text-white"
        onClick={(e) => setSearchTerm(inputValue)}>Search</button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 ">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={book.image}
                alt={book.title}
                className="w-full object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold">{book.title}</h2>
                <p className="text-gray-600 mb-2">by {book.author}</p>
                <p className="text-sm font-semibold mb-2">Owned by : {book.owner_name}</p>
                <span
                  className={`inline-block px-3 py-1 text-sm rounded-full ${
                    book.available === true
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {book.available===true ? "Available" : "Unavailable"}
                </span>
                <button
                  className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  disabled={book.available !== true}
                >
                  {book.available === true ? "Request" : "Unavailable"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            No books found.
          </p>
        )}
      </div>
    </div>
  );
};

