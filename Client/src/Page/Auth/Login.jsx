import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setLoading(true);

    const result = await login(formData.email, formData.password);

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
            <LogIn className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--txt)' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--txt-dim)' }}>
            Sign in to continue to Learning Journey
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p style={{ color: 'var(--txt-dim)' }}>
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold hover:underline" style={{ color: 'var(--btn)' }}>
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;