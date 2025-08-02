'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Users, CheckSquare, Clock, AlertTriangle, Target, FileText, Bell } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Task {
  id: string
  title: string
  priority: number
  details: string | null
  executor: string[]
  target: string[]
  expected_result: string | null
  due_date: string | null
  category: string | null
  risks: string | null
  status: string
}

interface Person {
  id: number
  name: string
}

const ProjectManagementAI = () => {
  const [selectedView, setSelectedView] = useState('dashboard')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState({
    title: '',
    priority: 1,
    details: '',
    executor: '',
    target: '',
    expected_result: '',
    due_date: '',
    category: 'witness'
  })

  const projectData = {
    projectName: "国蔚项目 - 在检察院翻案",
    dates: ["August 4", "August 5", "August 6", "August 7", "August 8"]
  }

  useEffect(() => {
    loadTasks()
    loadPeople()
  }, [])

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPeople = async () => {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('name')
      
      if (error) throw error
      setPeople(data || [])
    } catch (error) {
      console.error('Error loading people:', error)
    }
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', taskId)
      
      if (error) throw error
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status } : task
      ))
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Failed to update task status')
    }
  }

  const addNewTask = async () => {
    if (!newTask.title) return

    try {
      const taskId = `custom-${Date.now()}`
      const task = {
        id: taskId,
        title: newTask.title,
        priority: newTask.priority,
        details: newTask.details || null,
        executor: newTask.executor.split(',').map(p => p.trim()).filter(p => p),
        target: newTask.target.split(',').map(p => p.trim()).filter(p => p),
        expected_result: newTask.expected_result || null,
        due_date: newTask.due_date || null,
        category: newTask.category,
        risks: null,
        status: 'pending'
      }

      const { error } = await supabase
        .from('tasks')
        .insert([task])
      
      if (error) throw error
      
      setTasks(prev => [...prev, task])
      
      setNewTask({
        title: '',
        priority: 1,
        details: '',
        executor: '',
        target: '',
        expected_result: '',
        due_date: '',
        category: 'witness'
      })
      
      alert('Task created successfully!')
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in-progress': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'blocked': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600 bg-red-100'
      case 2: return 'text-orange-600 bg-orange-100'
      case 3: return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTasksForDate = (date: string) => {
    return tasks.filter(task => task.due_date === date)
  }

  const getTasksForPerson = (person: string) => {
    return tasks.filter(task => 
      task.executor.includes(person) || task.target.includes(person)
    )
  }

  const getTaskRecommendation = (task: Task) => {
    if (task.priority === 1 && task.due_date === "August 4") {
      return "🔥 High priority urgent task! Recommend immediate execution and close follow-up."
    }
    if (task.risks) {
      return "⚠️ This task has risks. Recommend creating contingency plan and careful execution."
    }
    if (task.category === "witness") {
      return "💡 Recommend gentle communication, build trust, avoid pressure that could backfire."
    }
    if (task.category === "legal") {
      return "📋 Recommend consulting professional lawyer to ensure process compliance and effectiveness."
    }
    return "📌 Proceed as planned, report progress regularly."
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project data...</p>
        </div>
      </div>
    )
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckSquare className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total Tasks</p>
              <p className="text-2xl font-bold text-blue-900">{tasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Team Members</p>
              <p className="text-2xl font-bold text-green-900">{people.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">
                {tasks.filter(task => task.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">High Priority</p>
              <p className="text-2xl font-bold text-red-900">
                {tasks.filter(task => task.priority === 1).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Project Goal: {projectData.projectName}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>

<h4 className="font-medium mb-2">Today&apos;s Priority Tasks</h4>

            <div className="space-y-2">
              {getTasksForDate("August 4").map(task => (
                <div key={task.id} className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium">{task.title}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                      P{task.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Assigned: {task.executor.join(", ")}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">High Risk Tasks</h4>
            <div className="space-y-2">
              {tasks.filter(task => task.risks).map(task => (
                <div key={task.id} className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                  <span className="text-sm font-medium">{task.title}</span>
                  <p className="text-xs text-red-600 mt-1">Risk: {task.risks}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDateView = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center">
        <Calendar className="h-6 w-6 mr-2" />
        View Tasks by Date
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projectData.dates.map(date => (
          <div 
            key={date}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedDate === date ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedDate(selectedDate === date ? null : date)}
          >
            <h3 className="font-semibold text-lg">{date}</h3>
            <p className="text-sm text-gray-600">{getTasksForDate(date).length} tasks</p>
            
            {selectedDate === date && (
              <div className="mt-4 space-y-3">
                {getTasksForDate(date).map(task => (
                  <div key={task.id} className="p-3 bg-white rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                        P{task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{task.details}</p>
                    <div className="text-xs text-gray-500">
                      <p>Executor: {task.executor.join(", ")}</p>
                      <p>Target: {task.target.join(", ")}</p>
                    </div>
                    <div className="mt-2">
                      <select 
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="text-xs border rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderPersonView = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center">
        <Users className="h-6 w-6 mr-2" />
        View Tasks by Person
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {people.map(person => (
          <div 
            key={person.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedPerson === person.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPerson(selectedPerson === person.name ? null : person.name)}
          >
            <h3 className="font-semibold text-lg">{person.name}</h3>
            <p className="text-sm text-gray-600">{getTasksForPerson(person.name).length} related tasks</p>
            
            {selectedPerson === person.name && (
              <div className="mt-4 space-y-3">
                {getTasksForPerson(person.name).map(task => (
                  <div key={task.id} className="p-3 bg-white rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="flex gap-1">
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                          P{task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status)}`}>
                          {task.status === 'pending' ? 'Pending' : 
                           task.status === 'in-progress' ? 'In Progress' :
                           task.status === 'completed' ? 'Completed' : 'Blocked'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{task.details}</p>
                    <div className="text-xs text-gray-500">
                      <p>Role: {task.executor.includes(person.name) ? 'Executor' : 'Target'}</p>
                      {task.due_date && <p>Due: {task.due_date}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderTaskView = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center">
        <CheckSquare className="h-6 w-6 mr-2" />
        Task Management
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {tasks.map(task => (
          <div 
            key={task.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTask === task.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.id} | {task.category}</p>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                  Priority {task.priority}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status)}`}>
                  {task.status === 'pending' ? 'Pending' : 
                   task.status === 'in-progress' ? 'In Progress' :
                   task.status === 'completed' ? 'Completed' : 'Blocked'}
                </span>
              </div>
            </div>
            
            {selectedTask === task.id && (
              <div className="mt-4 bg-white p-4 rounded border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Task Details</h4>
                    <p className="text-sm text-gray-700 mb-3">{task.details}</p>
                    
                    <h4 className="font-medium mb-2">Execution Info</h4>
                    <p className="text-sm"><strong>Executor:</strong> {task.executor.join(", ")}</p>
                    <p className="text-sm"><strong>Target:</strong> {task.target.join(", ")}</p>
                    {task.due_date && <p className="text-sm"><strong>Due Date:</strong> {task.due_date}</p>}
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Expected Result</h4>
                    <p className="text-sm text-gray-700 mb-3">{task.expected_result}</p>
                    
                    {task.risks && (
                      <div className="p-2 bg-red-50 rounded border-l-4 border-red-400">
                        <p className="text-sm text-red-700"><strong>Potential Risk:</strong> {task.risks}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Update Status</label>
                    <select 
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className="border rounded px-3 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">AI Recommendation</label>
                    <div className="p-2 bg-blue-50 rounded text-sm">
                      {getTaskRecommendation(task)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderAddTask = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center">
        <FileText className="h-6 w-6 mr-2" />
        Add New Task
      </h2>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Task Title</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter task title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({...newTask, priority: parseInt(e.target.value)})}
              className="w-full border rounded px-3 py-2"
            >
              <option value={1}>High Priority (1)</option>
              <option value={2}>Medium Priority (2)</option>
              <option value={3}>Low Priority (3)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Executor (comma separated)</label>
            <input
              type="text"
              value={newTask.executor}
              onChange={(e) => setNewTask({...newTask, executor: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="John, Jane"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Target (comma separated)</label>
            <input
              type="text"
              value={newTask.target}
              onChange={(e) => setNewTask({...newTask, target: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="Client, Partner"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="text"
              value={newTask.due_date}
              onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="August 5"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={newTask.category}
              onChange={(e) => setNewTask({...newTask, category: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="witness">Witness Contact</option>
              <option value="legal">Legal Process</option>
              <option value="relationship">Relationship Building</option>
              <option value="petition">Petition</option>
              <option value="highlevel">High Level Contact</option>
              <option value="negotiation">Negotiation</option>
              <option value="pressure">Legal Pressure</option>
              <option value="investigation">Investigation</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Task Details</label>
            <textarea
              value={newTask.details}
              onChange={(e) => setNewTask({...newTask, details: e.target.value})}
              className="w-full border rounded px-3 py-2 h-20"
              placeholder="Detailed description of task requirements"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Expected Result</label>
            <textarea
              value={newTask.expected_result}
              onChange={(e) => setNewTask({...newTask, expected_result: e.target.value})}
              className="w-full border rounded px-3 py-2 h-20"
              placeholder="Describe expected outcome"
            />
          </div>
        </div>
        
        <div className="flex gap-4 mt-6">
          <button
            onClick={addNewTask}
            disabled={!newTask.title}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Management AI Assistant</h1>
              <p className="text-sm text-gray-600">Intelligent project management and task coordination system</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-400" />
              <div className="text-right">
                <p className="text-sm font-medium">Project Status</p>
                <p className="text-xs text-green-600">Active</p>
              </div>
            </div>
          </div>
          
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'dates', label: 'By Date' },
              { id: 'people', label: 'By Person' },
              { id: 'tasks', label: 'Task Management' },
              { id: 'add', label: 'Add Task' }
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSelectedView(id)}
                className={`px-1 py-4 border-b-2 font-medium text-sm ${
                  selectedView === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedView === 'dashboard' && renderDashboard()}
        {selectedView === 'dates' && renderDateView()}
        {selectedView === 'people' && renderPersonView()}
        {selectedView === 'tasks' && renderTaskView()}
        {selectedView === 'add' && renderAddTask()}
      </div>
    </div>
  )
}

export default ProjectManagementAI