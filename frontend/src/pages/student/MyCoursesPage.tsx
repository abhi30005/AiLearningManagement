import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { apiFetch } from '../../lib/api';
import { ChevronRight, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageLoader } from '../../components/ui/PageLoader';

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) {
        setCourses([]);
        setLoading(false);
        return;
      }
      try {
        const [enrollRes, coursesRes] = await Promise.all([
           apiFetch<{enrollments: any[]}>(`/enrollments/user/${user.id}`),
           apiFetch<any[]>('/courses/')
        ]);
        
        const enrollments = enrollRes.enrollments || [];
        const allCourses = coursesRes || [];

        const formattedCourses = allCourses.map((course: any) => {
          const enr = enrollments.find((e: any) => e.courseId === course.id);
          return {
            id: course.id,
            title: course.title,
            progress: enr ? (enr.progress || 0) : 0,
            image: course.image || course.thumbnail,
            nextLesson: '',
            lastAccessed: '',
            completed: enr ? enr.progress === 100 : false
          };
        });
        setCourses(formattedCourses);
      } catch (error) {
        console.error('Failed to fetch enrollments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  if (loading) {
    return <PageLoader type="list" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track your progress and continue learning.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
            <div className="md:w-1/3 h-48 md:h-auto">
              <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 md:w-2/3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{course.title}</h3>
                  {course.completed && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Completed
                    </span>
                  )}
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${course.progress === 100 ? 'bg-green-600' : 'bg-primary-600'}`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                {!course.completed && course.nextLesson && (
                  <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <PlayCircle className="h-4 w-4 mr-2 text-primary-600" />
                    Next: <span className="font-medium text-gray-900 dark:text-white ml-1">{course.nextLesson}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Link
                  to={`/courses/${course.id}`}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    course.completed ? 'bg-gray-600 hover:bg-gray-700' : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {course.completed ? 'Review Course' : 'Continue Learning'}
                  <ChevronRight className="ml-2 -mr-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
