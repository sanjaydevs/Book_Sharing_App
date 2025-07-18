import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import './App.css';
import Home from "./pages/home";
import Browse from "./pages/browse";
import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import AddBook from "./pages/addBook";
import Navbar from "./components/navbar";

function App() {
  return (
    
    <Router>
    <Navbar />
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-book" element={<AddBook />} />
      </Routes>
    </Router>
  );
}

export default App;

