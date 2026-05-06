import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();

  // Form state — controlled inputs
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();     // prevent browser refresh
    setError('');
    setLoading(true);

    try {
      // POST /api/auth/register → sends name, email, password to backend
      await api.post('/auth/register', form);

      // On success → go to login page
      navigate('/login', {
        state: { message: 'Account created! Please log in.' }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-white text-3xl font-bold tracking-widest mb-2">
            Prospect<span className="text-blue-500">IQ</span>
          </h1>
          <p className="text-gray-400 text-sm">CRM for modern sales teams</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-white text-xl font-semibold mb-6">Create your account</h2>

          {/* Error message */}
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full bg-black border border-gray-700 text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
                className="w-full bg-black border border-gray-700 text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                required
                minLength={6}
                className="w-full bg-black border border-gray-700 text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Link to login */}
          <p className="text-gray-500 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
