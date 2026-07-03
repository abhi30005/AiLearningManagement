import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { apiFetch } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award, Target, BookOpen, Clock } from 'lucide-react';
import { PageLoader } from '../../components/ui/PageLoader'

export default function ResultsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!user) return;
      try {
        const data = await apiFetch<any>(`/analytics/student/${user.id}/results`);
        if (data && data.overview) {
          setResults(data);
        } else {
          setResults({
            overview: { averageScore: 0, totalQuizzes: 0, assignmentsSubmitted: 0, learningHours: 0 },
            recentScores: []
          });
        }
      } catch (err) {
        console.error("Failed to fetch results", err);
        setResults({
            overview: { averageScore: 0, totalQuizzes: 0, assignmentsSubmitted: 0, learningHours: 0 },
            recentScores: []
        });
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [user]);

  if (loading) {
    return <PageLoader type="list" />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Results</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track your performance across courses and assessments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <Target className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{results.overview.averageScore}%</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <Award className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Quizzes Taken</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{results.overview.totalQuizzes}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Assignments</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{results.overview.assignmentsSubmitted}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Learning Hours</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{results.overview.learningHours}h</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Recent Performance</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={results.recentScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: '#F3F4F6', opacity: 0.1 }}
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', color: '#F9FAFB' }}
              />
              <Bar dataKey="score" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
