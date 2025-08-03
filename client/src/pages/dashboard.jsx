  import React,{useState, useEffect} from "react";
  import axios from "axios";
  import {jwtDecode} from "jwt-decode";
  import MessageBox from "../components/messageBox";
  import { HiArrowUp } from "react-icons/hi";
  const baseURL = import.meta.env.VITE_API_BASE_URL;

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
    const resetReqs = async()=>{
      const sentRes = await axios.get(`${baseURL}/api/requests/me`,
          {headers:
            {Authorization: `Bearer ${token}`}
        });

          
          setRequests(sentRes.data.requests);

          const incomingRes= await axios.get(`${baseURL}/api/requests/my-requests`,
          {headers:
            {Authorization: `Bearer ${token}` }
          });
          

          setIncomingRequests(incomingRes.data.requests);
    };

    const handleConfirmExchange = async (requestId) => {
      try {
        await axios.patch(`${baseURL}/api/requests/${requestId}/confirm`, 
          null,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
        ); 

        await resetReqs();
        
        alert("Exchange marked");
        // optionally refresh list
      } catch (err) {
        console.error(err);
      }
    };


    const handleReturnConfirm = async (requestId) => {
        try {
          const token = localStorage.getItem("token");
          await axios.post(
            `${baseURL}/api/requests/${requestId}/return`,
            null,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("handlereturn");

          
          setTimeout(() => {
            alert("Return Confirmed From your side");
            resetReqs(); // don’t await, just fire after alert
          }, 100);

        } catch (err) {
          console.error("Error confirming return:", err);
        }
      };    

    const handleAccept = async (reqId)=>{
      try{
        await axios.post(`${baseURL}/api/requests/${reqId}/accept`,
          null,
          {
          headers:{Authorization:`Bearer ${token}`},
          
        });

        await resetReqs();
        // const newincRes= await axios.get("http://localhost:5000/api/requests/my-requests",
        //   {headers:
        //     {Authorization: `Bearer ${token}` }
        //   });
          

        // setIncomingRequests(newincRes.data.requests);
      } catch (err){
        console.error("Error Accepting Request",err)
        alert("Failed to Accept Request")
      }
    };

    const handleDelete = async (reqId)=>{
      try{
        await axios.delete(`${baseURL}/api/requests/${reqId}`,{
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
        await axios.post(`${baseURL}/requests/${reqId}/reject`,
          null,
          {
          headers:{Authorization:`Bearer ${token}`},
        })

        await resetReqs();
        // setIncomingRequests((prev) =>
        // prev.map((r) => (r.id === reqId ? { ...r, status: "rejected" } : r))
        // );
      } catch (err){
        console.error("Error Rejecting Request",err)
        alert("Failed to Reject Request")
      }
    };

    useEffect(()=>{
      const fetchRequests = async ()=>{
        try{
          const sentRes = await axios.get("http://localhost:5000/api/requests/me",
          {headers:
            {Authorization: `Bearer ${token}`}
        });

          
          setRequests(sentRes.data.requests);

          const incomingRes= await axios.get("http://localhost:5000/api/requests/my-requests",
          {headers:
            {Authorization: `Bearer ${token}` }
          });
          

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
      <div className="bg-[#FAECB6] min-h-screen">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

    {/* Sent Requests Section */}
  <div>
    <h2 className="text-2xl font-title mb-6 flex gap-2"> Sent Requests</h2>
    {requests?.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {requests.map((req) => {


          return (
            <div key={req.id} className="bg-[#B6E6FA] border-black border-2 drop-shadow-[4px_4px_0_#000000] p-3 rounded-lg shadow-sm text-sm">
              <img
                src={req.image}
                alt={req.title}
                className="w-full h-40 object-cover rounded-md mb-3"
              />
              <div className="h-[3px] w-full bg-black mb-2" />
              <p className="py-1 font-title"><span className="font-heading font-bold">📚 Book:</span> {req.title}</p>
              <p className="py-1 font-heading"><span className="font-heading font-bold">👤 Owner:</span> {req.owner_name}</p>
              <p className="py-1 font-heading"><span className="font-heading font-bold">📌 Status:</span> {req.status}</p>
              
              <div className="items-center mt-3 flex flex-col gap-2">
                
                {/* Delete Request Button */}
                {req.status=='pending' && (
                  <>
                <button
                  onClick={() => handleDelete(req.id)}
                  className="bg-[#B6E6FA] border-black border-2 drop-shadow-[2px_2px_0_#000000] font-heading px-4 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
  </>
                )}

                {/* Confirm Return Logic */}
                {req.is_exchanged && !req.is_returned && (
                  <>
                    {(parseInt(userId) === req.sender_id && !req.sender_returned) ||
                    (parseInt(userId) === req.receiver_id && !req.receiver_returned) ? (
                      <button
                        onClick={() => handleReturnConfirm(req.id)}
                        className="font-heading border-2 border-black drop-shadow-[2px_2px_0_#000000] px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Confirm Return
                      </button>
                    ) : (
                      <span className="text-gray-500 font-heading ">Waiting for other user...</span>
                    )}
                  </>
                )}

                {/* Book Returned Message */}
                {req.is_returned && <span className="text-green-600 font-medium">✅ Book Returned</span>}

                {/* Optional Message Box */}
                {req.status === "accepted" && req.requester_id === userId && (
                  <div className="mt-3">
                    <MessageBox userId={userId} requestId={req.id} />
                  </div>
                )}

                {/* Mark as Exchanged Button */}
                {!req.sender_confirmed && req.status === "accepted" && (
                  <button
                    className="w-[75%] font-heading border-2 border-black drop-shadow-[2px_2px_0_#000000] px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => handleConfirmExchange(req.id)}
                  >
                    Mark as Exchanged
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <p className="text-gray-500 font-heading ">No sent requests yet.</p>
    )}
  </div>


    {/* Incoming Requests Section */}
    <div>
      <h2 className="text-2xl font-title mb-6 flex gap-2">Incoming Requests</h2>
      {incomingRequests?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {incomingRequests.map((req) => (

            <div key={req.id} className="bg-[#FACAB6] border-black border-2 drop-shadow-[4px_4px_0_#000000] p-3 rounded-lg shadow-sm text-sm">
              <img
                src={req.image}
                alt={req.title}
                className="w-full h-40 object-cover rounded-md mb-3"
              />
              <div className="h-[3px] w-full bg-black mb-2" />
              <p className="py-1 font-title"><span className="font-heading font-bold">📚 Book:</span> {req.title}</p>
              <p className="py-1 font-heading"><span className="font-heading font-bold">🙋 Requested By:</span> {req.requester_name}</p>
              <p className="py-1 font-heading"><span className="font-heading font-bold ">📌 Status:</span> {req.status}</p>
              <div className="items-center mt-3 flex flex-col gap-2">
              {req.status==='pending' &&(
                <>
              <div className="flex flex-cols gap-2">
              <button
                onClick={() => handleAccept(req.id)}
                className="border-black border-2 drop-shadow-[2px_2px_0_#000000] self-start  px-4 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(req.id)}
                className="border-black border-2 drop-shadow-[2px_2px_0_#000000] self-start  px-4 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Reject
              </button>
              </div>
  </>
              )}

              {req.is_exchanged && !req.is_returned && (
                  <>
                    {(parseInt(userId) === req.sender_id && !req.sender_returned) ||
                    (parseInt(userId) === req.receiver_id && !req.receiver_returned) ? (
                      <button
                        onClick={() => {
                          console.log("button clicked");
                          handleReturnConfirm(req.id)
                        }}
                        className="font-heading border-2 border-black drop-shadow-[2px_2px_0_#000000] px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Confirm Return
                      </button>
                    ) : (
                      <span className="text-gray-500">Waiting for other user...</span>
                    )}
                  </>
                )}

  {req.is_returned && <span>✅ Book Returned</span>}

              {req.status === "accepted" && req.requester_id !== userId && (
                <div className="mt-3">
                  {/* Message Component */}
                  <MessageBox
                    userId={userId}
                    requestId={req.id}
                  />
                </div>
              )}

              {!req.receiver_confirmed && req.status==="accepted" &&(
                <button
                  className="w-[75%] font-heading border-2 border-black drop-shadow-[2px_2px_0_#000000] px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => handleConfirmExchange(req.id)}>
                  Mark as Exchanged
                </button>
              )}       
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 font-heading">No incoming requests.</p>
      )}
    </div>
    </div>

        </div>
      </div>

    )

  }
  export default Dashboard;