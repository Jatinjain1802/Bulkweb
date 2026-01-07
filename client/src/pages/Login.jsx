import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Login successful
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to server. Please check your internet or try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-sans">
      {/* Left Decoration Side */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 relative justify-center items-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-600 via-purple-600 to-indigo-800 opacity-90"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-12 right-12 w-64 h-64 bg-pink-500 opacity-20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-white p-12 max-w-lg">
          <div className="mb-8 animate-fade-in-down">
             {/* Improved Logo */}
             <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6 shadow-xl border border-white/10">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
             </div>
          </div>
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight leading-tight">
            BulkWeb<span className="text-pink-400">.</span>
          </h1>
          <p className="text-xl text-indigo-100 leading-relaxed font-light opacity-90">
            Streamline your high-volume operations with our premium, intelligent bulk management platform.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-500">
              Please enter your details to sign in to your account.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative rounded-md shadow-sm group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all sm:text-sm bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative rounded-md shadow-sm group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all sm:text-sm bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
              Create an account
            </a>
          </p>
        </div>
        
        {/* Footer info/copyright */}
        <div className="absolute bottom-6 text-xs text-gray-400">
            &copy; {new Date().getFullYear()} BulkWeb Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
