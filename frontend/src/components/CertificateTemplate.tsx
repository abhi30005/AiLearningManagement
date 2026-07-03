import React from 'react';
import { Award } from 'lucide-react';

export interface CertificateProps {
  studentName: string;
  courseName: string;
  department: string;
  date: string;
  certificateId: string;
  instructorName: string;
}

export const CertificateTemplate = React.forwardRef<HTMLDivElement, CertificateProps>(
  ({ studentName, courseName, department, date, certificateId, instructorName }, ref) => {
    
    // Dynamic text scaling based on length
    const nameSize = studentName.length > 25 ? 'text-4xl' : 'text-5xl';
    const courseSize = courseName.length > 40 ? 'text-2xl' : 'text-3xl';
    
    // Use an exact pixel size for consistent PDF export (A4 Landscape ratio)
    return (
      <div 
        ref={ref}
        className="bg-white relative overflow-hidden" 
        style={{ width: '1122px', height: '793px', fontFamily: "'Inter', sans-serif" }}
      >
        {/* Ornate Border */}
        <div className="absolute inset-4 border-[8px] border-double border-amber-600 rounded-lg opacity-80 pointer-events-none"></div>
        <div className="absolute inset-8 border-[2px] border-amber-400 rounded opacity-60 pointer-events-none"></div>
        
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100 rounded-bl-full opacity-30 pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-100 rounded-tr-full opacity-30 pointer-events-none -z-10"></div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center h-full px-20 text-center relative z-10">
          
          <div className="flex items-center space-x-4 mb-8">
            <Award className="w-16 h-16 text-amber-500" />
            <h1 className="text-4xl font-extrabold tracking-wider text-gray-900 uppercase">
              NM Tech
            </h1>
          </div>

          <h2 className="text-xl font-bold tracking-[0.3em] text-gray-500 uppercase mb-8">
            Certificate of Completion
          </h2>

          <p className="text-lg text-gray-600 italic mb-4">
            This is proudly presented to
          </p>

          <h3 className={`font-bold text-amber-700 mb-6 font-serif ${nameSize}`}>
            {studentName}
          </h3>

          <p className="text-lg text-gray-600 mb-6 max-w-2xl">
            For successfully completing the comprehensive training program and demonstrating proficiency in
          </p>

          <h4 className={`font-bold text-gray-800 mb-4 ${courseSize}`}>
            {courseName}
          </h4>

          <p className="text-md font-medium text-primary-600 bg-primary-50 px-4 py-1 rounded-full mb-12">
            Department: {department}
          </p>

          <div className="w-full flex justify-between items-end mt-8 px-12">
            <div className="text-center w-64">
              <div className="border-b-2 border-gray-400 pb-2 mb-2 h-10 flex items-end justify-center">
                <span className="font-medium text-gray-800">{new Date(date).toLocaleDateString()}</span>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Date of Issue</p>
            </div>
            
            <div className="text-center">
              <div className="bg-amber-500 w-24 h-24 rounded-full flex items-center justify-center shadow-lg border-4 border-white mb-2 mx-auto">
                <Award className="w-12 h-12 text-white" />
              </div>
              <p className="text-xs text-gray-400 font-mono mt-2">ID: {certificateId}</p>
            </div>

            <div className="text-center w-64">
              <div className="border-b-2 border-gray-400 pb-2 mb-2 h-10 flex items-end justify-center">
                <span className="font-signature text-2xl text-gray-800" style={{ fontFamily: 'cursive' }}>{instructorName}</span>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Instructor / Director</p>
            </div>
          </div>

        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
