import React, { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    location: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState({ text: '', isError: false });

  const BACKEND_URL = 'http://127.0.0.1:5000/api';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', isError: false });

    console.log('⚡ ACTION: Submit button clicked on frontend form.');
    const { firstName, lastName, location, email, password } = formData;

    const endpoint = isLogin ? `${BACKEND_URL}/login` : `${BACKEND_URL}/register`;
    const payload = isLogin ? { email, password } : formData;

    console.log(`📡 SENDING data to network URL target: ${endpoint}`);
    console.log('Payload context payload being shipped:', payload);

    try {
      // Sending request over the network bridge
      const response = await axios.post(endpoint, payload);

      console.log('📥 RESPONSE RECEIVED back from backend server:', response.data);
      setMessage({ text: response.data.message, isError: false });

      if (isLogin && response.data.token) {
        console.log('💾 SAVING secure token into browser localstorage keys...');
        localStorage.setItem('authToken', response.data.token);
      }
    } catch (error) {
      console.error('❌ NETWORK FETCH ERROR DETECTED:', error);
      const errorMsg = error.response?.data?.message || 'Server connection failed. Is your backend server running on port 5000?';
      setMessage({ text: errorMsg, isError: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
        
        <div className="text-center mb-6">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Mode: {isLogin ? 'Login Sign In' : 'Database Registration'}
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" placeholder="John"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" placeholder="Doe"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" placeholder="Kigali, Rwanda"/>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" placeholder="you@example.com"/>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" placeholder="••••••••"/>
          </div>

          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md">
            {isLogin ? 'Run Login Fetch' : 'Run Registration Fetch'}
          </button>

          {message.text && (
            <div className={`p-3 text-center rounded-xl text-sm font-medium border ${message.isError ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
              {message.text}
            </div>
          )}

          <div className="text-center pt-2">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-xs text-blue-600 font-bold hover:underline">
              {isLogin ? 'Switch to Registration View' : 'Switch to Login View'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}