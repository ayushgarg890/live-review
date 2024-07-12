import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ReviewList from '../ReviewList/ReviewList';
import ReviewForm from '../ReviewForm/ReviewForm';
import Login from '../Login/Login';
import Register from '../Register/Register';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<ReviewList />} />
      <Route path="/new" element={<ReviewForm />} />
      <Route path="/:id" element={<ReviewForm />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  </Router>
);

export default App;
