import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Signup } from './pages/Signup';
import { Signin } from './pages/Signin';
import { Blog } from './pages/Blog';
import { Blogs } from './pages/Blogs';
import { Publish } from './pages/Publish';
import { useEffect, useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if a token exists in local storage
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token); // Convert token to a boolean
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {isAuthenticated ? (
          // Show the blog routes if the user is authenticated
          <>
            <Route path="/blog/:id" element={<Blog />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/publish" element={<Publish />} />
            <Route path="/" element={<Navigate to="/blogs" />} />
            <Route path="*" element={<Navigate to="/blogs" />} />
          </>
        ) : (
          // Show authentication pages if the user is not authenticated
          <>
            <Route path="/" element={<Signin />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/signin" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
