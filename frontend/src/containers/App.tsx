import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../components/HomePage';
import ErrorPage from '../components/ErrorPage';
import NavBar from '../components/NavBar';
import AuthPage from '../components/AuthPage';

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter >
      <Routes>
        <Route path="/" element={
          <>
            <NavBar />
            <HomePage /></>
        } />
        <Route path="/auth" element={token ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route path="/not-found" element={<ErrorPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
