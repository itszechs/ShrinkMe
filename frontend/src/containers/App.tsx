import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createContext, useEffect, useState } from "react";

import HomePage from '../components/HomePage';
import ErrorPage from '../components/ErrorPage';
import NavBar from '../components/NavBar';
import AuthPage from '../components/AuthPage';
import { api } from '../utils/constants';

export const AuthContext = createContext({
  isLoggedIn: false,
  setIsLoggedIn: (value: boolean) => { },
});

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('token'));

  // run only once
  useEffect(() => {
    if (isLoggedIn) {
      fetch(api.buildUrl(api.token), {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => {
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <BrowserRouter >
        <Routes>
          <Route path="/" element={
            <>
              <NavBar />
              <HomePage /></>
          } />
          <Route path="/auth" element={isLoggedIn ? <Navigate to="/" replace /> : <AuthPage />} />
          <Route path="/not-found" element={<ErrorPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>

  );
}
