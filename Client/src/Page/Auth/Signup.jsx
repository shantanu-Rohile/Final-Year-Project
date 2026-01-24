import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await signup(formData.username, formData.email, formData.password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: 'var(--btn)' }}
          >
            <UserPlus className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--txt)' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--txt-dim)' }}>
            Join Quiz Generator today
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-8 shadow-2xl"
          style={{ backgroundColor: 'var(--bg-sec)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-4 rounded-lg bg-red-500/20 border border-red-500"
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-500">{error}</p>
              </motion.div>
            )}

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt)' }}>
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--txt-dim)' }} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all"
                  style={{
                    backgroundColor: 'var(--bg-ter)',
                    borderColor: 'var(--bg-ter)',
                    color: 'var(--txt)'
                  }}
                  placeholder="johndoe"
                  required
                  minLength={3}
                  maxLength={20}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt)' }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--txt-dim)' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all"
                  style={{
                    backgroundColor: 'var(--bg-ter)',
                    borderColor: 'var(--bg-ter)',
                    color: 'var(--txt)'
                  }}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--txt-dim)' }} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all"
                  style={{
                    backgroundColor: 'var(--bg-ter)',
                    borderColor: 'var(--bg-ter)',
                    color: 'var(--txt)'
                  }}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--txt-dim)' }} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all"
                  style={{
                    backgroundColor: 'var(--bg-ter)',
                    borderColor: 'var(--bg-ter)',
                    color: 'var(--txt)'
                  }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: 'var(--btn)' }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Sign Up
                </>
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p style={{ color: 'var(--txt-dim)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--btn)' }}>
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;