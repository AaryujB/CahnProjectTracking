import React, { useState, useEffect } from 'react';
import { Plus, Eye, Users } from 'lucide-react';
import { projectAPI, developerAPI } from '../services/api';
import { formatDateForDisplay} from '../utils/dateUtils.js';

const Dashboard = ({ user, onLogout, onOpenProject }) => {
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '', description: '', startDate: '', endDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchDevelopers();
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

  const fetchDevelopers = async () => {
    try {
      const response = await developerAPI.getAll();
      setDevelopers(response.data);
    } catch (error) {
      console.error('Error fetching developers:', error);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    try {
      const response = await projectAPI.create(newProject);
      setProjects([...projects, response.data]);
      setNewProject({ name: '', description: '', startDate: '', endDate: '' });
    } catch (error) {
      setError('Failed to create project');
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
              <h1 className="text-xl font-semibold">Project Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.username}</span>
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

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Projects Dashboard</h2>
          
          <form onSubmit={createProject} className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Project Name"
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="date"
                placeholder="Start Date"
                value={newProject.startDate}
                onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <textarea
                placeholder="Project Description"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="date"
                placeholder="End Date"
                value={newProject.endDate}
                onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={16} className="inline mr-2" />
              Create Project
            </button>
          </form>

          <div className="grid gap-6">
            {projects.map(project => (
              <div key={project._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
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
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Assigned Developers:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.assignedDevelopers.map(dev => (
                      <span key={dev._id} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {dev.name}
                      </span>
                    ))}
                    {project.assignedDevelopers.length === 0 && (
                      <span className="text-gray-500 text-sm">No developers assigned</span>
                    )}
                  </div>
                </div>
                
                {project.phases && project.phases.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Progress:</h4>
                    <div className="text-sm text-gray-600">
                      {project.phases.length} phases • 
                      {project.phases.filter(p => p.status === 'completed').length} completed
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {projects.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
                <p className="text-gray-500">Create your first project to get started.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Users size={20} className="mr-2" />
            <h3 className="text-lg font-semibold">Registered Developers</h3>
          </div>
          <div className="grid gap-4">
            {developers.map(dev => (
              <div key={dev._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{dev.name}</h4>
                    <p className="text-gray-600 text-sm">{dev.email}</p>
                    <p className="text-gray-600 text-sm">{dev.school} - {dev.grade}</p>
                    <p className="text-gray-600 text-sm">Available: {dev.hoursPerWeek} hours/week</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {dev.assignedProjects?.length || 0} project(s) assigned
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-700">{dev.resume}</p>
                </div>
                {dev.skills && dev.skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {dev.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {developers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No developers registered yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;