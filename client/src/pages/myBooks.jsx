import React, { useState ,useEffect} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";


const baseURL = import.meta.env.VITE_API_BASE_URL;


export default function MyBooks () {
  const [loading, setLoading] = useState(true);
  const [mybooks, setMyBooks]=useState([]);

  const navigate=useNavigate();
  

  useEffect(()=>{
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      toast.error("You need to be logged in to see your books.", { duration: 3000 });
      return;
    }

    const fetchBooks = async ()=>{
      try{

        const res = await axios.get(`${baseURL}/api/books/me`, {
          headers:{
            Authorization:`Bearer ${token}`
          },
        });

        setMyBooks(res.data.books);

      } catch(err){
        console.error("Error fetching books:", err);
        if (err.response && err.response.status === 403) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
        } else {
          toast.error("Failed to fetch your books. Please try again later.", { duration: 3000 });
        }
      } finally {
      setLoading(false); // stop loading
      }
    };
    fetchBooks();
    

  },[navigate]);

  return (
    <div className="min-h-screen px-6 py-10 bg-[#FAECB6]">
      <h1 className="font-title text-3xl font-semibold mb-6 text-center text-[#F96635] drop-shadow-[2px_2px_0_#000000]">
        Your Books
      </h1>


    {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <ClipLoader size={50} color="#F96635" />
        </div>
      ) : (
      <div className="grid gap-6 grid-cols-2  md:grid-cols-4 lg:grid-cols-6 mx-auto px-3 sm:px-6 ">
        {mybooks.length > 0 ? (
          mybooks.map((book, index) => (
            <div
              key={index}
              className="bg-[#FACAB6] rounded-xl border-2 border-black drop-shadow-[4px_4px_0_#000000] overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full"
            >
              <img src={book.image} alt={book.title} className="w-full h-48 sm:h-56 object-cover"/>
              <div className="h-[2px] w-full bg-black"></div>
              <div className="p-4">
                <h2 className="text-sm sm:text-base md:text-lg font-title">{book.title}</h2>
                <p className="font-heading text-gray-600 mb-2 text-xs sm:text-sm">by {book.author}</p>
                <span
                  className={`text-[10px] inline-block px-2 lg:px-2 py-1 text-sm rounded border-black border-2 drop-shadow-[1px_1px_0_#000000] ${
                    book.available === true
                      ? "font-heading bg-green-100 text-green-700"
                      : "font-heading bg-red-100 text-red-600"
                  }`}
                >
                  {book.available===true ? "Ready to Lend" : "Lent out"}
                </span>
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

