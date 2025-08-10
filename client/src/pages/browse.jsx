import React, { useState ,useEffect} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";


const baseURL = import.meta.env.VITE_API_BASE_URL;


export default function Browse () {
  const [loading, setLoading] = useState(true);
  const [books, setBooks]=useState([]);
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate=useNavigate();
  

  useEffect(()=>{
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      toast.error("You need to be logged in to browse books.", { duration: 3000 });
      return;
    }

    const fetchBooks = async ()=>{
      try{
        const res = await axios.get(`${baseURL}/api/books/all`, {
          headers:{
            Authorization:`Bearer ${token}`
          },
        });
        setBooks(res.data.books);
      } catch(err){
        console.error("Error fetching books:", err);
        toast.error("Failed to fetch books. Please try again later.", { duration: 3000 });
      } finally {
      setLoading(false); // stop loading
      }
    };
    fetchBooks();
    

  },[navigate]);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sendRequest = async (bookId) =>{
    const token= localStorage.getItem("token");
    if (!token){
      return alert("Please log in to Make requests")
    }
    try {
      await axios.post(`${baseURL}/api/requests/${bookId}`,
        {},
        {
        headers:{
            Authorization: `Bearer ${token}`
        }
        }
      );

      toast.success("Request Sent.", { duration: 3000 });

    } catch (error){
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data.message;

        if (status === 400 && message === "Request already sent") {
          toast.error("You've already sent a request for this book.", { duration: 3000 });
        } else {
          toast.error(`Error: ${message}`, { duration: 3000 });
        }
      } else {
        toast.error("Something went wrong. Please try again.", { duration: 3000 });
      }
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-[#FAECB6]">
      <h1 className="font-title text-3xl font-semibold mb-6 text-center text-[#F96635] drop-shadow-[2px_2px_0_#000000]">
        Browse Books
      </h1>


    
      <div className="font-heading flex justify-center mb-8 gap-3">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="border-black border-2 drop-shadow-[3px_3px_0_#000000] w-full max-w-md px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button className="border-black border-2 drop-shadow-[3px_3px_0_#000000] px-4 rounded-lg bg-[#B6E6FA] text-black hover:bg-blue-600 transition-colors duration-200"
        onClick={(e) => setSearchTerm(inputValue)}>Search</button>
      </div>


    {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <ClipLoader size={50} color="#F96635" />
        </div>
      ) : (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6 ">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book, index) => (
            <div
              key={index}
              className="bg-[#FACAB6] rounded-2xl border-2 border-black drop-shadow-[4px_4px_0_#000000] overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <img src={book.image} alt={book.title} className="w-full h-56 object-cover"/>
              <div className="h-[2px] w-full bg-black"></div>
              <div className="p-4">
                <h2 className="text-xl font-title">{book.title}</h2>
                <p className="font-heading text-gray-600 mb-2">by {book.author}</p>
                <p className="font-heading text-sm font-semibold mb-2">Owned by : {book.owner_name}</p>
                <span
                  className={`inline-block px-3 py-1 text-sm rounded border-black border-2 drop-shadow-[1px_1px_0_#000000] ${
                    book.available === true
                      ? "font-heading bg-green-100 text-green-700"
                      : "font-heading bg-red-100 text-red-600"
                  }`}
                >
                  {book.available===true ? "Available" : "Unavailable"}
                </span>
                <button
                  onClick={()=>{sendRequest(book.id)}}
                  className="font-heading text-black border-black border-2 drop-shadow-[3px_3px_0_#000000] mt-4 w-full bg-[#2BBAA5]  py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
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
      )}
    </div>
    
  );
};

