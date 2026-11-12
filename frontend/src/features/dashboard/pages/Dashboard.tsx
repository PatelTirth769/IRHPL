import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(taskSchema),
  });

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/tasks', data);
      reset();
      fetchTasks();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const toggleTask = async (task) => {
    try {
      await api.patch(`/tasks/${task._id}`, { completed: !task.completed });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register('title')}
              type="text"
              placeholder="Task Title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <textarea
              {...register('description')}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              rows="2"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Add Task
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
        {loading ? (
          <p className="text-gray-500">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tasks found. Create one above!</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task._id} className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task)}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div>
                    <h3 className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-500'}`}>
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task._id)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
