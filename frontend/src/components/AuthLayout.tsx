import { Outlet } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-secondary-950 bg-cover bg-center"
      style={{ backgroundImage: 'url(/elearn.jpg)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-secondary-950/78 to-cyan-950/60" />
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-cyan-200/18 to-transparent lg:block" />

      <div
        className="relative z-10 flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-12"
      >
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-300/15 ring-1 ring-cyan-100/35 rounded-lg flex items-center justify-center backdrop-blur-sm shadow-lg shadow-cyan-950/30">
              <GraduationCap className="w-7 h-7 text-cyan-100" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-white">AI-LMS</span>
              <span className="text-sm font-medium text-cyan-100/85">AI-Powered Learning Management System</span>
            </div>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 items-center justify-center gap-10 py-6 lg:justify-between lg:py-8">
          <section className="hidden max-w-xl text-white lg:block">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Smarter digital classrooms
            </p>
            <h1 className="text-5xl font-bold leading-tight text-white drop-shadow-lg">
              Transform Education with AI-Powered Learning
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-white/80">
              Bring tutoring, assessments, voice support, and multilingual learning into one focused LMS experience.
            </p>

            <div className="mt-10 grid gap-4">
              {[
                'AI Tutor for personalized learning',
                'Smart quizzes and assessments',
                'Voice-based learning support',
                'Multi-language content support',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-cyan-300/20 ring-1 ring-cyan-100/40 flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/90">{feature}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="min-h-0 w-full max-w-md lg:max-w-lg">
            <div className="no-scrollbar max-h-[calc(100vh-9rem)] overflow-y-auto overscroll-contain rounded-lg border border-cyan-100/25 bg-secondary-950/72 p-5 shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-2xl sm:max-h-[calc(100vh-10rem)] sm:p-8 lg:max-h-[calc(100vh-8rem)]">
              <Outlet />
            </div>
          </section>
        </main>

        <footer className="text-center text-sm text-white/65 lg:text-left">
          &copy; 2024 AI-LMS. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
