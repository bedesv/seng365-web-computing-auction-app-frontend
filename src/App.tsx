import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./components/Home"
import Header from "./components/Header"
import Register from "./components/Register";

function App() {
  return (
      <div className="App">
        <Router>
          <div>
            <Routes>
              <Route path="/home" element={<Home />}/>
              <Route path="*" element={<Register />}/>

            </Routes>
          </div>
        </Router>
      </div>
  );
}

export default App;
