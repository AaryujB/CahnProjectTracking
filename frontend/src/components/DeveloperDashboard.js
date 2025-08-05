import React, { useState, useEffect } from 'react';
import { Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { projectAPI, developerAPI } from '../services/api';
import { formatDateForDisplay } from '../utils/dateUtils.js';

const DeveloperDashboard = ({ user, onLogout, onOpenProject }) => {
  const [projects, setProjects] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchProfile();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await developerAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in progress': return 'text-blue-600 bg-blue-100';
      case 'planning': return 'text-yellow-600 bg-yellow-100';
      case 'on hold': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPhaseStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-600" />;
      case 'in-progress': return <Clock size={16} className="text-blue-600" />;
      case 'pending': return <AlertCircle size={16} className="text-yellow-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Developer Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={onLogout}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Profile Summary */}
        {profile && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold mb-4">Your Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">School</p>
                <p className="font-medium">{profile.school}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Grade Level</p>
                <p className="font-medium">{profile.grade}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Available Hours/Week</p>
                <p className="font-medium">{profile.hoursPerWeek} hours</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Projects Assigned</p>
              <p className="font-medium">{profile.assignedProjects?.length || 0} project(s)</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Assigned Projects</h2>
          
          <div className="grid gap-6">
            {projects.map(project => (
              <div key={project._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{project.name}</h3>
                    <p className="text-gray-600 mt-1">{project.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDateForDisplay(project.startDate)} - {formatDateForDisplay(project.endDate)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenProject(project)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye size={16} className="inline mr-2" />
                    View Project
                  </button>
                </div>
                
                {/* Project Team */}
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Team Members:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.assignedDevelopers.map(dev => (
                      <span key={dev._id} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {dev.name} {dev._id === user.id && '(You)'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Project Phases Progress */}
                {project.phases && project.phases.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-3">Project Phases:</h4>
                    <div className="space-y-2">
                      {project.phases.map(phase => (
                        <div key={phase._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getPhaseStatusIcon(phase.status)}
                            <div>
                              <p className="font-medium">{phase.name}</p>
                              <p className="text-sm text-gray-500">
                                {formatDateForDisplay(phase.startDate)} - {formatDateForDisplay(phase.endDate)}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(phase.status)}`}>
                            {phase.status.replace('-', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Progress Summary */}
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        <strong>Progress Summary:</strong> {project.phases.filter(p => p.status === 'completed').length} of {project.phases.length} phases completed
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(project.phases.filter(p => p.status === 'completed').length / project.phases.length) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Owner Information */}
                {project.owner && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Project Owner: <span className="font-medium text-gray-700">{project.owner.name || project.owner.username}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {projects.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">No projects assigned</h3>
                <p className="text-gray-500 mt-2">
                  You haven't been assigned to any projects yet. Contact a project owner to get started.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
              <div className="text-sm text-gray-600">Active Projects</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {projects.reduce((acc, project) => acc + (project.phases?.filter(p => p.status === 'completed').length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Completed Phases</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {projects.reduce((acc, project) => acc + (project.phases?.filter(p => p.status === 'in-progress').length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {projects.reduce((acc, project) => acc + (project.phases?.filter(p => p.status === 'pending').length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Pending Tasks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;