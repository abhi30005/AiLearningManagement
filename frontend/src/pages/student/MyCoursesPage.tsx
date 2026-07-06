import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { apiFetch } from '../../lib/api';
import { BookOpen, PlayCircle, Eye, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageLoader } from '../../components/ui/PageLoader';

export default function MyCoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
            completed: enr ? enr.progress === 100 : false,
            level: course.level
          };
        });
        // Only show courses the student is enrolled in
        setCourses(formattedCourses.filter(c => enrollments.some(e => e.courseId === c.id)));
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
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-secondary-900">My Courses</h1>
        <p className="text-secondary-600 mt-1">Track your progress and continue learning.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Course</th>
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Progress</th>
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Status</th>
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 px-6 text-center text-secondary-500">
                    No courses found. Start exploring and enroll in a course!
                  </td>
                </tr>
              ) : (
                courses.map((course, i) => (
                  <tr key={course.id || i} className="hover:bg-secondary-50 transition-colors">
                    <td className="py-3 px-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0 relative flex items-center justify-center">
                            {course.image ? (
                              <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen className="w-5 h-5 text-secondary-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-secondary-900">{course.title}</p>
                            <p className="text-xs text-secondary-500">{course.level || 'All Levels'}</p>
                          </div>
                       </div>
                    </td>
                    <td className="py-3 px-4 min-w-[150px]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-secondary-600">Progress</span>
                        <span className="font-medium text-secondary-900">{course.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${course.completed ? 'bg-accent-500' : 'bg-primary-500'}`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {course.completed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent-50 text-accent-700 border border-accent-200">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                          <PlayCircle className="w-3 h-3" />
                          In Progress
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                       <div className="flex items-center gap-2">
                         <button onClick={() => navigate(`/courses/${course.id}`)} className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors" title="View Course Details">
                            <Eye className="w-4 h-4" />
                         </button>
                         <button onClick={() => navigate(`/learn/${course.id}/lesson/default`)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title={course.completed ? 'Review Course' : 'Continue Learning'}>
                            <PlayCircle className="w-4 h-4" />
                         </button>
                         {course.completed && (
                           <button onClick={() => navigate(`/learn/${course.id}/quiz/final`)} className="p-2 text-accent-600 hover:bg-accent-50 rounded-lg transition-colors" title="Take Final Quiz & Certification">
                              <CheckCircle className="w-4 h-4" />
                           </button>
                         )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
