import React, { useState } from 'react';
import { authAPI } from '../services/api';

const Login = ({ onLogin }) => {
  const [loginForm, setLoginForm] = useState({ 
    username: '', 
    password: '', 
    email: '', 
    type: 'owner' 
  });
  const [devForm, setDevForm] = useState({
    name: '', 
    email: '', 
    school: '', 
    grade: '', 
    hoursPerWeek: '', 
    resume: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(loginForm);
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDevRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.register(devForm);
      alert('Registration successful! You can now login with your credentials.');
      setLoginForm({ ...loginForm, type: 'developer', email: devForm.email, password: '' });
      setDevForm({
        name: '', email: '', school: '', grade: '', hoursPerWeek: '', resume: '', password: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Project Manager</h2>
          <p className="mt-2 text-gray-600">Sign in to your account or register as a developer</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow">
          <div className="flex mb-4">
            <button
              type="button"
              onClick={() => setLoginForm({...loginForm, type: 'owner'})}
              className={`flex-1 py-2 px-4 rounded-l-lg ${
                loginForm.type === 'owner' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Owner Login
            </button>
            <button
              type="button"
              onClick={() => setLoginForm({...loginForm, type: 'developer'})}
              className={`flex-1 py-2 px-4 ${
                loginForm.type === 'developer' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Developer Login
            </button>
            <button
              type="button"
              onClick={() => setLoginForm({...loginForm, type: 'register'})}
              className={`flex-1 py-2 px-4 rounded-r-lg ${
                loginForm.type === 'register' ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {loginForm.type === 'owner' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : loginForm.type === 'developer' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleDevRegistration} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={devForm.name}
                onChange={(e) => setDevForm({...devForm, name: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={devForm.email}
                onChange={(e) => setDevForm({...devForm, email: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={devForm.password}
                onChange={(e) => setDevForm({...devForm, password: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="School/University"
                value={devForm.school}
                onChange={(e) => setDevForm({...devForm, school: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <select
                value={devForm.grade}
                onChange={(e) => setDevForm({...devForm, grade: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select Grade Level</option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Graduate">Graduate</option>
              </select>
              <input
                type="number"
                placeholder="Available Hours/Week"
                value={devForm.hoursPerWeek}
                onChange={(e) => setDevForm({...devForm, hoursPerWeek: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                min="1"
                max="40"
              />
              <textarea
                placeholder="Resume/Background (skills, experience, projects)"
                value={devForm.resume}
                onChange={(e) => setDevForm({...devForm, resume: e.target.value})}
                className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register as Developer'}
              </button>
            </form>
          )}
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Demo Login Details:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              {loginForm.type === 'owner' ? (
                <div>
                  <p><strong>Owner Access:</strong></p>
                  <p>• Username: user1, user2, user3, or user4</p>
                  <p>• Password: password</p>
                  <p>• Can create projects, manage phases, assign developers, access settings</p>
                </div>
              ) : loginForm.type === 'developer' ? (
                <div>
                  <p><strong>Developer Login:</strong></p>
                  <p>• Use your registered email and password</p>
                  <p>• View only assigned projects</p>
                  <p>• Update task progress and phase status</p>
                </div>
              ) : (
                <div>
                  <p><strong>Developer Registration:</strong></p>
                  <p>• Register with your academic and availability details</p>
                  <p>• Submit resume and skills for project assignments</p>
                  <p>• Wait for owners to assign you to projects</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;