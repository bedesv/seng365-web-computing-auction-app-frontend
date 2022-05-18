import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./components/Home"
import Register from "./components/Register";
import Login from "./components/Login"

function App() {
  return (
      <div className="App">
        <Router>
          <div>
            <Routes>
                <Route path="/register" element={<Register />}/>
                <Route path="/login" element={<Login />}/>
                <Route path="/" element={<Home />}/>



            </Routes>
          </div>
        </Router>
      </div>
  );
}

export default App;
