import React, { useState ,useEffect} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { Link } from "react-router-dom";


const baseURL = import.meta.env.VITE_API_BASE_URL;


export default function Browse () {
  const [loading, setLoading] = useState(true);
  const [books, setBooks]=useState([]);
  const navigate=useNavigate();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [available, setAvailable] = useState(""); // "true", "false", or ""
  const [genre, setGenre] = useState("");
  const [radius, setRadius] = useState("");
  

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
        if (err.response && err.response.status === 403) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
        } else {
          toast.error("Failed to fetch books. Please try again later.", { duration: 3000 });
        }
      } finally {
      setLoading(false); // stop loading
      }
    };
    fetchBooks();
    

  },[navigate]);

  // const filteredBooks = books.filter(
  //   (book) =>
  //     book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     book.author.toLowerCase().includes(searchTerm.toLowerCase())
  // );


  const fetchFilteredBooks = async()=>{
    const token=localStorage.getItem("token");
    if (!token){
      toast.error("Please login to Search");
      navigate("/login");
      return;
    }

    setLoading(true);
    try{
      const res=await axios.get(`${baseURL}/api/books/search`,{
        headers:{Authorization:`Bearer ${token}`},
        params: {
          title: title || undefined,
          author: author || undefined,
          available: available || undefined,
          genre: genre || undefined,
          radius: 10,
        }
    });

    setBooks(res.data.books);
    }catch (err) {
    console.error("Search error:", err);
    toast.error("Failed to search books.");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-full px-6 py-6 sm:py-8 bg-[#FAECB6]">
      <h1 className="font-title text-3xl font-semibold mb-6 text-center text-[#F96635] drop-shadow-[2px_2px_0_#000000]">
        Browse Books
      </h1>


    
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
  <input
    type="text"
    placeholder="Search by title..."
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    className="border border-black px-3 py-2 rounded-lg drop-shadow-[2px_2px_0_#000000]"
  />
  <input
    type="text"
    placeholder="Search by author..."
    value={author}
    onChange={(e) => setAuthor(e.target.value)}
    className="border border-black px-3 py-2 rounded-lg drop-shadow-[2px_2px_0_#000000]"
  />
  <input
    type="text"
    placeholder="Filter by distance of Owner"
    value={author}
    onChange={(e) => setRadius(e.target.value)}
    className="border border-black px-3 py-2 rounded-lg drop-shadow-[2px_2px_0_#000000]"
  />
  <select
    value={available}
    onChange={(e) => setAvailable(e.target.value)}
    className="border border-black px-3 py-2 rounded-lg drop-shadow-[2px_2px_0_#000000]"
  >
    <option value="">All</option>
    <option value="true">Available</option>
    <option value="false">Unavailable</option>
  </select>
  <input
    type="text"
    placeholder="Genre..."
    value={genre}
    onChange={(e) => setGenre(e.target.value)}
    className="border border-black px-3 py-2 rounded-lg drop-shadow-[2px_2px_0_#000000]"
  />
  <button
    onClick={fetchFilteredBooks}
    className="px-4 py-2 bg-blue-500 text-white rounded-lg border border-black drop-shadow-[2px_2px_0_#000000]"
  >
    Search
  </button>
</div>


    {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <ClipLoader size={50} color="#F96635" />
        </div>
      ) : (
      <div className="grid gap-6 grid-cols-2  md:grid-cols-4 lg:grid-cols-6 mx-auto px-3 sm:px-6 ">
        {books.length > 0 ? (
          books.map((book, index) => (
            <div
              key={index}
              className="bg-[#FACAB6] rounded-xl border-2 border-black drop-shadow-[4px_4px_0_#000000] overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full"
            >
              <img src={book.image} alt={book.title} className="w-full h-64 w-32 object-contain"/>
              <div className="h-[2px] w-full bg-black"></div>
              <div className="p-4">
                <h2 className="text-sm sm:text-base md:text-lg font-title">{book.title}</h2>
                <p className="font-heading text-gray-600 mb-2 text-xs sm:text-sm">by {book.author}</p>
                <p className="font-heading text-[10px] sm:text-xs md:text-sm font-semibold mb-2">
                  Owned by :{" "}
                  <Link 
                    to={`/${book.owner_id}/profile`} 
                    className="text-black hover:underline"
                    title="View profile"
                  >
                    {book.owner_name}
                  </Link>
                </p>
                  
                <span
                  className={`text-[10px] inline-block px-2 lg:px-2 py-1 text-sm rounded border-black border-2 drop-shadow-[1px_1px_0_#000000] ${
                    book.available === true
                      ? "font-heading bg-green-100 text-green-700"
                      : "font-heading bg-red-100 text-red-600"
                  }`}
                >
                  {book.available===true ? "Available" : "Unavailable"}
                </span>
                <button
                  onClick={()=>{sendRequest(book.id)}}
                  className="text-[10px] lg:text-sm font-heading text-black border-black border-2 drop-shadow-[3px_3px_0_#000000] mt-4 w-full bg-[#2BBAA5] py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
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

