import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../lib/auth-context';
import { apiFetch } from '../../lib/api';
import { Award, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CertificateTemplate } from '../../components/CertificateTemplate';

export default function CertificatesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // We'll keep a reference to a hidden container where we render the active certificate to print
  const printRef = useRef<HTMLDivElement>(null);
  const [activeCert, setActiveCert] = useState<any | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user) {
        setCertificates([]);
        setLoading(false);
        return;
      }
      try {
        const res = await apiFetch<{certificates: any[]}>(`/gamification/certificates/${user.id}`);
        setCertificates(res.certificates || []);
      } catch (error) {
        console.error('Failed to fetch certificates', error);
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [user]);

  // Effect to handle the actual print once the activeCert is set in the DOM
  useEffect(() => {
    if (activeCert && printRef.current && downloadingId) {
      const generatePDF = async () => {
        try {
          const canvas = await html2canvas(printRef.current!, {
            scale: 2, // High quality
            useCORS: true,
            logging: false
          });
          
          const imgData = canvas.toDataURL('image/png');
          
          // A4 Landscape: 297mm x 210mm
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
          });
          
          pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
          pdf.save(`${activeCert.courseName.replace(/\s+/g, '_')}_Certificate.pdf`);
          
        } catch (err) {
          console.error("Error generating PDF", err);
          alert("Failed to generate PDF. Please try again.");
        } finally {
          setActiveCert(null);
          setDownloadingId(null);
        }
      };
      
      // Small timeout to ensure fonts and layout are applied
      setTimeout(generatePDF, 300);
    }
  }, [activeCert, downloadingId]);

  const handleDownload = (cert: any) => {
    setDownloadingId(cert.id);
    setActiveCert(cert);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Certificates</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View and download your earned certificates.</p>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Award className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No certificates yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Complete courses to earn certificates and showcase your skills.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map(cert => (
            <div key={cert.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center text-center">
              <div className={`p-4 rounded-full bg-${cert.color || 'primary'}-50 dark:bg-${cert.color || 'primary'}-900/20 mb-4`}>
                <Award className={`h-12 w-12 text-${cert.color || 'primary'}-600 dark:text-${cert.color || 'primary'}-400`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{cert.courseName || cert.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Earned on {new Date(cert.date).toLocaleDateString()}</p>
              
              <button 
                onClick={() => handleDownload(cert)}
                disabled={downloadingId === cert.id}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingId === cert.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden off-screen area to render the certificate before converting to PDF */}
      {activeCert && (
        <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none overflow-hidden" style={{ width: 0, height: 0 }}>
          <CertificateTemplate 
            ref={printRef}
            studentName={activeCert.studentName || user?.name || 'Student'}
            courseName={activeCert.courseName || activeCert.title}
            department={activeCert.department || 'General'}
            date={activeCert.date}
            certificateId={activeCert.id}
            instructorName={activeCert.instructorName || 'Instructor'}
          />
        </div>
      )}
    </div>
  );
}
