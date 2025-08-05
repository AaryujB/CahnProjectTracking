import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Plus, CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { projectAPI, developerAPI } from '../services/api';
import { formatDateForDisplay, formatDateForInput } from '../utils/dateUtils.js';

const ProjectView = ({ user, project: initialProject, onLogout, onBack }) => {
  const [project, setProject] = useState(initialProject);
  const [currentView, setCurrentView] = useState('overview');
  const [developers, setDevelopers] = useState([]);
  const [newPhase, setNewPhase] = useState({
    name: '', startDate: '', endDate: '', tasks: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if current user can edit this project
  const canEdit = user.role === 'owner' || project.assignedDevelopers?.some(dev => dev._id === user.id);

  // Move functions above useEffect and wrap with useCallback
  const fetchProjectDetails = useCallback(async () => {
    try {
      const response = await projectAPI.getById(project._id);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project details:', error);
      setError('Failed to load project details');
    }
  }, [project._id]);

  const fetchDevelopers = useCallback(async () => {
    try {
      const response = await developerAPI.getAll();
      setDevelopers(response.data);
    } catch (error) {
      console.error('Error fetching developers:', error);
    }
  }, []);

  useEffect(() => {
    fetchProjectDetails();
    if (user.role === 'owner') {
      fetchDevelopers();
    }
  }, [fetchProjectDetails, fetchDevelopers, user.role]);

  const addPhase = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tasks = newPhase.tasks.split(',').map(t => t.trim()).filter(t => t);
      await projectAPI.addPhase(project._id, {
        ...newPhase,
        tasks
      });
      await fetchProjectDetails();
      setNewPhase({ name: '', startDate: '', endDate: '', tasks: '' });
    } catch (error) {
      setError('Failed to add phase');
    } finally {
      setLoading(false);
    }
  };

  const updatePhaseStatus = async (phaseId, status) => {
    try {
      await projectAPI.updatePhase(project._id, phaseId, { status });
      await fetchProjectDetails();
    } catch (error) {
      setError('Failed to update phase status');
    }
  };

  const updateTaskStatus = async (phaseId, tasks) => {
    try {
      await projectAPI.updatePhase(project._id, phaseId, { tasks });
      await fetchProjectDetails();
    } catch (error) {
      setError('Failed to update task status');
    }
  };

  const removeDeveloper = async (developerId) => {
    try {
      setLoading(true);
      await projectAPI.removeDevelopers(project._id, [developerId]);
      await fetchProjectDetails();
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error removing developer:', error);
      setError('Failed to remove developer from project');
    } finally {
      setLoading(false);
    }
  };

  const assignDeveloper = async (developerId) => {
    try {
      setLoading(true);
      await projectAPI.assignDevelopers(project._id, [developerId]);
      await fetchProjectDetails();
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error assigning developer:', error);
      setError('Failed to assign developer to project');
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (status) => {
    try {
      await projectAPI.update(project._id, { status });
      setProject({ ...project, status });
    } catch (error) {
      setError('Failed to update project status');
    }
  };

  const updateProjectField = async (field, value) => {
    try {
      await projectAPI.update(project._id, { [field]: value });
      setProject({ ...project, [field]: value });
    } catch (error) {
      setError(`Failed to update ${field}`);
    }
  };

  const deleteProject = async () => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"? This action cannot be undone and will permanently remove all project data, phases, and tasks.`
    );
    
    if (isConfirmed) {
      setLoading(true);
      try {
        console.log('Attempting to delete project with ID:', project._id);
        const response = await projectAPI.delete(project._id);
        console.log('Delete response:', response);
        // Navigate back to dashboard after successful deletion
        onBack();
      } catch (error) {
        console.error('Error deleting project:', error);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        console.error('Full error response:', error.response);
        
        // More detailed error message
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Unknown error occurred';
        setError(`Failed to delete project: ${errorMessage}`);
        setLoading(false);
      }
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

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle size={16} />;
      case 'in progress': return <Clock size={16} />;
      case 'planning': return <AlertCircle size={16} />;
      case 'on hold': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold">{project.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name || user.username}</span>
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

        {/* Navigation Tabs */}
        <div className="flex space-x-6 mb-6">
          <button
            onClick={() => setCurrentView('overview')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentView === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setCurrentView('phases')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentView === 'phases' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Phases
          </button>
          <button
            onClick={() => setCurrentView('timeline')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentView === 'timeline' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Timeline
          </button>
          {(user.role === 'owner' || canEdit) && (
            <button
              onClick={() => setCurrentView('settings')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'settings' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Settings size={16} className="inline mr-2" />
              Settings
            </button>
          )}
        </div>

        {/* Overview Tab */}
        {currentView === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">Project Overview</h3>
                {canEdit && (
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <select
                      value={project.status}
                      onChange={(e) => updateProjectStatus(e.target.value)}
                      className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-700">{project.description}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Timeline</h4>
                  <p className="text-gray-700">
                    {formatDateForDisplay(project.startDate)} - {formatDateForDisplay(project.endDate)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Current Status</h4>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      <span className="ml-2">{project.status}</span>
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Team Size</h4>
                  <p className="text-gray-700">{project.assignedDevelopers?.length || 0} developers</p>
                </div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-medium mb-4">Project Progress</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['completed', 'in-progress', 'pending'].map(status => {
                  const count = project.phases?.filter(p => p.status === status).length || 0;
                  return (
                    <div key={status} className="text-center p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        <span className="ml-2 capitalize">{status.replace('-', ' ')}</span>
                      </div>
                      <p className="text-2xl font-bold mt-2">{count}</p>
                      <p className="text-gray-600 text-sm">Phases</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team Overview */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Assigned Team</h4>
                {user.role === 'owner' && (
                  <span className="text-sm text-gray-500">
                    {project.assignedDevelopers?.length || 0} developer(s) assigned
                  </span>
                )}
              </div>
              <div className="grid gap-4">
                {project.assignedDevelopers?.map(dev => (
                  <div key={dev._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <h5 className="font-medium">{dev.name}</h5>
                      <p className="text-sm text-gray-600">{dev.email}</p>
                      {dev.school && dev.grade && (
                        <p className="text-sm text-gray-500">{dev.school} - {dev.grade}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {dev.hoursPerWeek} hrs/week available
                        </p>
                      </div>
                      {user.role === 'owner' && (
                        <button
                          onClick={() => {
                            const confirmRemove = window.confirm(
                              `Are you sure you want to remove ${dev.name} from this project? They will lose access to all project data and phases.`
                            );
                            if (confirmRemove) {
                              removeDeveloper(dev._id);
                            }
                          }}
                          disabled={loading}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Removing...' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">No developers assigned to this project</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Phases Tab */}
        {currentView === 'phases' && (
          <div className="space-y-6">
            {user.role === 'owner' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Add New Phase</h3>
                <form onSubmit={addPhase} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Phase Name"
                      value={newPhase.name}
                      onChange={(e) => setNewPhase({...newPhase, name: e.target.value})}
                      className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="date"
                      value={newPhase.startDate}
                      onChange={(e) => setNewPhase({...newPhase, startDate: e.target.value})}
                      className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="date"
                      value={newPhase.endDate}
                      onChange={(e) => setNewPhase({...newPhase, endDate: e.target.value})}
                      className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <textarea
                    placeholder="Tasks (comma-separated)"
                    value={newPhase.tasks}
                    onChange={(e) => setNewPhase({...newPhase, tasks: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Plus size={16} className="inline mr-2" />
                    {loading ? 'Adding...' : 'Add Phase'}
                  </button>
                </form>
              </div>
            )}

            {/* Phases List */}
            <div className="space-y-4">
              {project.phases?.map(phase => (
                <div key={phase._id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold">{phase.name}</h4>
                      <p className="text-sm text-gray-500">
                        {formatDateForDisplay(phase.startDate)} - {formatDateForDisplay(phase.endDate)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(phase.status)}`}>
                        {getStatusIcon(phase.status)}
                        <span className="ml-2 capitalize">{phase.status.replace('-', ' ')}</span>
                      </span>
                      {canEdit && (
                        <select
                          value={phase.status}
                          onChange={(e) => updatePhaseStatus(phase._id, e.target.value)}
                          className="ml-2 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Tasks */}
                  {phase.tasks && phase.tasks.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Tasks:</h5>
                      <div className="space-y-2">
                        {phase.tasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            {canEdit ? (
                              <input
                                type="checkbox"
                                checked={task.completed || false}
                                onChange={(e) => {
                                  const updatedTasks = [...phase.tasks];
                                  updatedTasks[taskIndex] = { ...task, completed: e.target.checked };
                                  updateTaskStatus(phase._id, updatedTasks);
                                }}
                                className="rounded"
                              />
                            ) : (
                              <div className={`w-4 h-4 rounded ${task.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            )}
                            <span className={task.completed ? 'line-through text-gray-500' : ''}>{task.name}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {phase.tasks.filter(t => t.completed).length} of {phase.tasks.length} tasks completed
                      </div>
                    </div>
                  )}
                </div>
              )) || (
                <div className="text-center py-8 bg-white rounded-lg shadow">
                  <p className="text-gray-500">No phases created yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {currentView === 'timeline' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-6">Project Timeline</h3>
            <div className="space-y-8">
              {/* Project Timeline */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                
                {/* Project Start */}
                <div className="relative flex items-center mb-8">
                  <div className="absolute left-2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow"></div>
                  <div className="ml-12">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-blue-600" />
                      <h4 className="font-medium">Project Started</h4>
                    </div>
                    <p className="text-sm text-gray-500">{formatDateForDisplay(project.startDate)}</p>
                  </div>
                </div>

                {/* Phases Timeline */}
                {project.phases?.map((phase, index) => (
                  <div key={phase._id} className="relative flex items-start mb-8">
                    <div className={`absolute left-2 w-4 h-4 rounded-full border-4 border-white shadow ${
                      phase.status === 'completed' ? 'bg-green-600' :
                      phase.status === 'in-progress' ? 'bg-blue-600' : 'bg-gray-400'
                    }`}></div>
                    <div className="ml-12">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(phase.status)}
                        <h4 className="font-medium">{phase.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(phase.status)}`}>
                          {phase.status.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDateForDisplay(phase.startDate)} - {formatDateForDisplay(phase.endDate)}
                      </p>
                      {phase.tasks && phase.tasks.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            {phase.tasks.filter(t => t.completed).length} of {phase.tasks.length} tasks completed
                          </p>
                          <div className="w-48 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${(phase.tasks.filter(t => t.completed).length / phase.tasks.length) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Project End */}
                <div className="relative flex items-center">
                  <div className="absolute left-2 w-4 h-4 bg-gray-400 rounded-full border-4 border-white shadow"></div>
                  <div className="ml-12">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-gray-600" />
                      <h4 className="font-medium">Project End Date</h4>
                    </div>
                    <p className="text-sm text-gray-500">{formatDateForDisplay(project.endDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab (Owner and Assigned Developers) */}
        {currentView === 'settings' && (user.role === 'owner' || canEdit) && (
          <div className="space-y-6">
            {/* Project Status (Available to both owners and developers) */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Project Status</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                <select
                  value={project.status}
                  onChange={(e) => updateProjectStatus(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>

            {/* Owner-only settings */}
            {user.role === 'owner' && (
              <>
                {/* Assign Developers */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Manage Team</h3>
                  <div className="space-y-6">
                    {/* Currently Assigned Developers */}
                    <div>
                      <h4 className="font-medium mb-3">Currently Assigned Developers</h4>
                      <div className="space-y-3">
                        {project.assignedDevelopers?.map(dev => (
                          <div key={dev._id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                            <div>
                              <h5 className="font-medium text-blue-900">{dev.name}</h5>
                              <p className="text-sm text-blue-700">{dev.email}</p>
                              {dev.school && dev.grade && (
                                <p className="text-sm text-blue-600">{dev.school} - {dev.grade}</p>
                              )}
                              {dev.hoursPerWeek && (
                                <p className="text-sm text-blue-600">{dev.hoursPerWeek} hrs/week available</p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                const confirmRemove = window.confirm(
                                  `Are you sure you want to remove ${dev.name} from this project? They will lose access to all project data and phases.`
                                );
                                if (confirmRemove) {
                                  removeDeveloper(dev._id);
                                }
                              }}
                              disabled={loading}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {loading ? 'Removing...' : 'Remove'}
                            </button>
                          </div>
                        )) || (
                          <p className="text-gray-500 text-center py-4">No developers currently assigned</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Available Developers */}
                    <div>
                      <h4 className="font-medium mb-3">Available Developers</h4>
                      <div className="space-y-3">
                        {developers
                          .filter(dev => !project.assignedDevelopers?.some(assigned => assigned._id === dev._id))
                          .map(dev => (
                            <div key={dev._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                              <div>
                                <p className="font-medium">{dev.name}</p>
                                <p className="text-sm text-gray-600">{dev.email}</p>
                                <p className="text-sm text-gray-500">{dev.school} - {dev.grade}</p>
                                <p className="text-sm text-gray-500">{dev.hoursPerWeek} hrs/week available</p>
                              </div>
                              <button
                                onClick={() => assignDeveloper(dev._id)}
                                disabled={loading}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                {loading ? 'Assigning...' : 'Assign'}
                              </button>
                            </div>
                          )) || []}
                        {developers.filter(dev => !project.assignedDevelopers?.some(assigned => assigned._id === dev._id)).length === 0 && (
                          <p className="text-gray-500 text-center py-4">All available developers are assigned</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={formatDateForInput(project.startDate)}
                          onChange={(e) => updateProjectField('startDate', e.target.value)}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={formatDateForInput(project.endDate)}
                          onChange={(e) => updateProjectField('endDate', e.target.value)}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={project.description}
                        onChange={(e) => updateProjectField('description', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="4"
                      />
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
                  <h3 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h3>
                  <p className="text-gray-600 mb-4">
                    Once you delete a project, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={deleteProject}
                    disabled={loading}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Deleting...' : 'Delete Project'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectView;