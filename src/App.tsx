import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./components/Home"
import Register from "./components/Register";
import Login from "./components/Login"
import Auctions from "./components/Auctions";
import SpecificAuction from "./components/SpecificAuction";

function App() {
  return (
      <div className="App">
        <Router>
          <div>
            <Routes>
                <Route path="/register" element={<Register />}/>
                <Route path="/login" element={<Login />}/>
                <Route path="/" element={<Auctions />}/>
                <Route path="/auctions" element={<Auctions />}/>
                <Route path="/auctions/:auctionId" element={<SpecificAuction />}/>
            </Routes>
          </div>
        </Router>
      </div>
  );
}

export default App;
