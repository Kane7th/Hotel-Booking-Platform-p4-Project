import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoomList from './components/RoomList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoomList />} />
      </Routes>
    </Router>
  );
}

export default App;
