'use client';

import { useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
  display_name: string;
  icon: string;
  active: boolean;
}

interface Class {
  id: string;
  name: string;
  level: string;
  duration: string;
  tuition: number;
  category: string;
  badge: string;
  summary: string;
  description: string;
  active: boolean;
}

interface Session {
  id: string;
  class_id: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  instructor: string;
  max_seats: number;
  available_seats: number;
  status: string;
}

export default function TrainingPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSessions(selectedClass.id);
    }
  }, [selectedClass]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:3001/api/training/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchClasses = async (category: string = 'all') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/training/classes${category !== 'all' ? `?category=${category}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setClasses(data || []);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async (classId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/training/classes/${classId}/sessions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSessions(data || []);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedClass(null);
    setSessions([]);
    fetchClasses(categoryId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bzt-navy"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bzt-navy">Training Scheduling</h1>
          <p className="mt-2 text-gray-600">
            Browse and register for training classes and sessions
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-bzt-navy text-white'
                  : 'bg-white text-bzt-navy border border-bzt-navy hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-bzt-navy text-white'
                    : 'bg-white text-bzt-navy border border-bzt-navy hover:bg-gray-50'
                }`}
              >
                {category.display_name}
              </button>
            ))}
          </div>
        </div>

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No classes available</h3>
            <p className="text-gray-500">Check back later for new training opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedClass?.id === classItem.id ? 'ring-2 ring-bzt-gold' : ''
                }`}
                onClick={() => setSelectedClass(classItem)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-bzt-navy">{classItem.name}</h3>
                  {classItem.badge && (
                    <span className="bg-bzt-gold text-bzt-navy text-xs font-bold px-2 py-1 rounded">
                      {classItem.badge}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">{classItem.level}</span> • {classItem.duration}
                </div>
                <div className="text-2xl font-bold text-bzt-navy mb-2">
                  ${classItem.tuition.toFixed(2)}
                </div>
                {classItem.summary && (
                  <p className="text-sm text-gray-600 line-clamp-2">{classItem.summary}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Selected Class Details and Sessions */}
        {selectedClass && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <button
                onClick={() => {
                  setSelectedClass(null);
                  setSessions([]);
                }}
                className="text-bzt-navy hover:text-bzt-gold mb-4"
              >
                ← Back to Classes
              </button>
              <h2 className="text-2xl font-bold text-bzt-navy mb-2">{selectedClass.name}</h2>
              <div className="flex gap-4 text-sm text-gray-600 mb-4">
                <span>Level: {selectedClass.level}</span>
                <span>Duration: {selectedClass.duration}</span>
                <span className="font-bold text-bzt-navy">${selectedClass.tuition.toFixed(2)}</span>
              </div>
              {selectedClass.description && (
                <div className="prose max-w-none mb-4">
                  <p className="text-gray-700">{selectedClass.description}</p>
                </div>
              )}
            </div>

            {/* Sessions */}
            <div>
              <h3 className="text-xl font-bold text-bzt-navy mb-4">Available Sessions</h3>
              {sessions.length === 0 ? (
                <p className="text-gray-600">No sessions scheduled for this class</p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-bzt-gold transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-bzt-navy">
                            {new Date(session.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {session.start_time} - {session.end_time}
                          </div>
                          {session.location && (
                            <div className="text-sm text-gray-600 mt-1">
                              📍 {session.location}
                            </div>
                          )}
                          {session.instructor && (
                            <div className="text-sm text-gray-600 mt-1">
                              👤 Instructor: {session.instructor}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {session.available_seats} of {session.max_seats} seats available
                          </div>
                          <span
                            className={`inline-block mt-2 px-3 py-1 rounded text-xs font-bold ${
                              session.status === 'full'
                                ? 'bg-red-100 text-red-800'
                                : session.status === 'scheduled'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                      </div>
                      {session.available_seats > 0 && session.status === 'scheduled' && (
                        <button className="mt-4 bg-bzt-gold text-bzt-navy px-6 py-2 rounded-lg font-bold hover:bg-bzt-gold-light transition-colors">
                          Register Now
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
