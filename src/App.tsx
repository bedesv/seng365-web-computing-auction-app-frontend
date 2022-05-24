import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login"
import Auctions from "./components/Auctions";
import SpecificAuction from "./components/SpecificAuction";
import MyAuctions from "./components/MyAuctions";

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
                <Route path="/myAuctions" element = {<MyAuctions />} />
            </Routes>
          </div>
        </Router>
      </div>
  );
}

export default App;
