  import React,{useState, useEffect} from "react";
  import axios from "axios";
  import {jwtDecode} from "jwt-decode";

  const Dashboard=()=>{
    const [myBooks, setMyBooks] = useState([]);
    const [requests,setRequests] = useState([]);
    const [incomingRequests, setIncomingRequests]=useState([]);

    const token = localStorage.getItem("token");
    let userId = null;

    if (token) {
      const decoded = jwtDecode(token);
      userId = decoded.userId;
    }
    

    const handleAccept = async (reqId)=>{
      try{
        await axios.post(`http://localhost:5000/api/requests/${reqId}/accept`,
          null,
          {
          headers:{Authorization:`Bearer ${token}`},
          
        });
        setIncomingRequests((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: "accepted" } : r))
        );
      } catch (err){
        console.error("Error Accepting Request",err)
        alert("Failed to Accept Request")
      }
    };

    const handleDelete = async (reqId)=>{
      try{
        await axios.delete(`http://localhost:5000/api/requests/${reqId}`,{
          headers:{Authorization:`Bearer ${token}`},
        });
        
        setRequests((prev)=> prev.filter((r)=> r.id!==reqId));

      }catch(err){
        console.error("Error Deleting Request",err)
        alert("Failed to Delete Request")
      }
    };

    const handleReject = async (reqId)=>{
      try{
        await axios.post(`http://localhost:5000/api/requests/${reqId}/reject`,
          null,
          {
          headers:{Authorization:`Bearer ${token}`},
        })
        setIncomingRequests((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: "rejected" } : r))
        );
      } catch (err){
        console.error("Error Rejecting Request",err)
        alert("Failed to Reject Request")
      }
    };

    const handleReturn = async (reqId)=>{
      try{
        await axios.post(`http://localhost:5000/api/requests/${reqId}/return`,
        null,
        {
          headers:{Authorization:`Bearer ${token}`},
        }
      );
      alert("Book Returned")
      
      } catch (err){
        console.error("Error Returning Book");
        alert("Failed to Return Book")
      }
    }

    useEffect(()=>{
      const fetchRequests = async ()=>{
        try{
          const sentRes = await axios.get("http://localhost:5000/api/requests/me",
          {headers:
            {Authorization: `Bearer ${token}`}
        });
          console.log("Sent Requests:", sentRes.data.requests);

          setRequests(sentRes.data.requests);

          const incomingRes= await axios.get("http://localhost:5000/api/requests/my-requests",
          {headers:
            {Authorization: `Bearer ${token}` }
          });
          
          console.log("Incoming Requests:", incomingRes.data.requests);

          setIncomingRequests(incomingRes.data.requests);
        } catch (err){
          console.error("Error fetching books");
        }
      };
      if (token) {
      fetchRequests();
      }
      
    },[token]);

    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

  {/* Sent Requests Section */}
  <div>
    <h2 className="text-2xl font-semibold mb-6">📤 Sent Requests</h2>
    {requests?.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {requests.map((req) => (
          <div key={req.id} className="bg-blue-50 border border-blue-200 p-3 rounded-lg shadow-sm text-sm">
            <img
              src={req.image}
              alt={req.title}
              className="w-full h-40 object-cover rounded-md mb-3"
            />
            <p className="py-1"><span className="font-medium">📚 Book:</span> {req.title}</p>
            <p className="py-1"><span className="font-medium">👤 Owner:</span> {req.owner_name}</p>
            <p className="py-1"><span className="font-medium">📌 Status:</span> {req.status}</p>
            
            <div className="mt-3">
            <button
              onClick={() => handleDelete(req.id)}
              className="self-start px-4 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Delete
            </button>
            {req.status=='accepted' && req.requester_id==userId && (
              <button
              onClick={()=>handleReturn(req.id)}
              className="self-start px-4 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                Return
              </button>
            )}
          </div>
          </div>
        
        ))}
      </div>
    ) : (
      <p className="text-gray-500 italic">No requests sent.</p>
    )}
  </div>

  {/* Incoming Requests Section */}
  <div>
    <h2 className="text-2xl font-semibold mb-6">📥 Incoming Requests</h2>
    {incomingRequests?.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {incomingRequests.map((req) => (

          <div key={req.id} className="bg-green-50 border border-green-200 p-3 rounded-lg shadow-sm text-sm">
            <img
              src={req.image}
              alt={req.title}
              className="w-full h-40 object-cover rounded-md mb-3"
            />
            <p className="py-1"><span className="font-medium">📚 Book:</span> {req.title}</p>
            <p className="py-1"><span className="font-medium">🙋 Requested By:</span> {req.requester_name}</p>
            <p className="py-1"><span className="font-medium ">📌 Status:</span> {req.status}</p>
            <div className="mt-3 flex gap-3">
            <button
              onClick={() => handleAccept(req.id)}
              className="self-start  px-4 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Accept
            </button>
            <button
              onClick={() => handleReject(req.id)}
              className="self-start  px-4 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Reject
            </button>
          </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 italic">No incoming requests.</p>
    )}
  </div>
  </div>

</div>

    )

  }
  export default Dashboard;