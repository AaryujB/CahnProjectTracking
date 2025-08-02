import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DeveloperDashboard from './components/DeveloperDashboard';
import ProjectView from './components/ProjectView';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [currentProject, setCurrentProject] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setCurrentView(parsedUser.role === 'owner' ? 'dashboard' : 'developer-dashboard');
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setCurrentView(userData.role === 'owner' ? 'dashboard' : 'developer-dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('login');
    setCurrentProject(null);
  };

  const openProject = (project) => {
    setCurrentProject(project);
    setCurrentView('project');
  };

  const closeProject = () => {
    setCurrentProject(null);
    setCurrentView(user.role === 'owner' ? 'dashboard' : 'developer-dashboard');
  };

  return (
    <div className="App">
      {currentView === 'login' && (
        <Login onLogin={handleLogin} />
      )}
      {currentView === 'dashboard' && user?.role === 'owner' && (
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          onOpenProject={openProject}
        />
      )}
      {currentView === 'developer-dashboard' && user?.role === 'developer' && (
        <DeveloperDashboard 
          user={user} 
          onLogout={handleLogout} 
          onOpenProject={openProject}
        />
      )}
      {currentView === 'project' && currentProject && (
        <ProjectView 
          user={user} 
          project={currentProject}
          onLogout={handleLogout} 
          onBack={closeProject}
        />
      )}
    </div>
  );
}

export default App;