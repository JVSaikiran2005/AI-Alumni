import { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  BookOpen,
  TrendingUp,
  Star,
  Calendar,
  ArrowRight,
  Search,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MentorshipRequest } from '../components/Mentorship/MentorshipRequest';
import { ProfileSettings } from '../components/Profile/ProfileSettings';
import { CareerInsights } from '../components/Career/CareerInsights';
import { AIChat } from '../components/AI/AIChat';

const mockMatches = [
  {
    id: '1',
    alumni: { full_name: 'Sarah Johnson', user_details: { job_title: 'Senior Engineer', current_company: 'Tech Corp' } },
    match_score: 0.95,
    matched_skills: ['React', 'TypeScript', 'Node.js']
  },
  {
    id: '2',
    alumni: { full_name: 'Michael Chen', user_details: { job_title: 'Product Manager', current_company: 'Innovation Inc' } },
    match_score: 0.87,
    matched_skills: ['Product Strategy', 'Leadership']
  }
];

const mockJobs = [
  { id: '1', title: 'Frontend Developer', company: 'TechStart', job_type: 'Full-time', location: 'Remote' },
  { id: '2', title: 'Junior Full Stack', company: 'WebDev Co', job_type: 'Full-time', location: 'New York' },
  { id: '3', title: 'Design Engineer', company: 'Creative Labs', job_type: 'Contract', location: 'San Francisco' },
];

const mockSessions = [
  { id: '1', title: 'Career Planning Session', alumni: { full_name: 'Sarah Johnson' }, status: 'accepted', scheduled_at: '2026-02-15', duration_minutes: 60 },
  { id: '2', title: 'Technical Interview Prep', alumni: { full_name: 'Michael Chen' }, status: 'pending', scheduled_at: null, duration_minutes: 45 }
];

export function StudentDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [matches] = useState(mockMatches);
  const [sessions] = useState(mockSessions);
  const [jobs] = useState(mockJobs);
  const [loading] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<{ id: string; name: string } | null>(null);
  const [generatingMatches, setGeneratingMatches] = useState(false);

  const generateAIMatches = async () => {
    setGeneratingMatches(true);
    setTimeout(() => {
      alert('Generated 2 AI-powered matches!');
      setGeneratingMatches(false);
    }, 2000);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile?.full_name}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your career journey</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <Users className="w-10 h-10 mb-4 opacity-80" />
          <div className="text-3xl font-bold mb-1">{matches.length}</div>
          <div className="text-blue-100">AI Matches</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"
        >
          <BookOpen className="w-10 h-10 mb-4 opacity-80" />
          <div className="text-3xl font-bold mb-1">{sessions.length}</div>
          <div className="text-green-100">Mentorship Sessions</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <Briefcase className="w-10 h-10 mb-4 opacity-80" />
          <div className="text-3xl font-bold mb-1">{jobs.length}</div>
          <div className="text-orange-100">Active Opportunities</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white"
        >
          <TrendingUp className="w-10 h-10 mb-4 opacity-80" />
          <div className="text-3xl font-bold mb-1">85%</div>
          <div className="text-cyan-100">Profile Strength</div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top AI Matches</h2>
            <button
              onClick={() => setActiveTab('matches')}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : matches.length > 0 ? (
            <div className="space-y-4">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {match.alumni?.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{match.alumni?.full_name}</div>
                    <div className="text-sm text-gray-600">
                      {match.alumni?.user_details?.job_title} at{' '}
                      {match.alumni?.user_details?.current_company}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{(match.match_score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No matches yet. Complete your profile to get AI-powered matches!</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Opportunities</h2>
            <button
              onClick={() => setActiveTab('opportunities')}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.slice(0, 4).map((job) => (
                <div key={job.id} className="p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer">
                  <div className="font-semibold text-gray-900 mb-1">{job.title}</div>
                  <div className="text-sm text-gray-600 mb-2">{job.company}</div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {job.job_type}
                    </span>
                    {job.location && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {job.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No opportunities available yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Mentorship Sessions</h2>
          {sessions.filter((s) => s.status === 'accepted').length > 0 ? (
            <div className="space-y-4">
              {sessions
                .filter((s) => s.status === 'accepted')
                .slice(0, 3)
                .map((session) => (
                  <div key={session.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-10 h-10 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{session.title}</div>
                      <div className="text-sm text-gray-600">with {session.alumni?.full_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {session.scheduled_at
                          ? new Date(session.scheduled_at).toLocaleDateString()
                          : 'Pending'}
                      </div>
                      <div className="text-xs text-gray-500">{session.duration_minutes} min</div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming sessions scheduled</p>
            </div>
          )}
        </div>
        <AIChat />
      </div>
    </div>
  );

  const renderMatches = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Matches</h1>
          <p className="text-gray-600">Alumni matched to your interests and career goals</p>
        </div>
        <button
          onClick={generateAIMatches}
          disabled={generatingMatches}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center gap-2 disabled:opacity-50"
        >
          <Search className="w-5 h-5" />
          {generatingMatches ? 'Generating...' : 'Generate AI Matches'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <motion.div
            key={match.id}
            whileHover={{ y: -4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {match.alumni?.full_name?.charAt(0)}
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-current text-yellow-500" />
                <span className="font-bold text-yellow-700">
                  {(match.match_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-1">{match.alumni?.full_name}</h3>
            <p className="text-gray-600 mb-4">
              {match.alumni?.user_details?.job_title} at {match.alumni?.user_details?.current_company}
            </p>

            {match.matched_skills && match.matched_skills.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Matching Skills:</div>
                <div className="flex flex-wrap gap-2">
                  {match.matched_skills.slice(0, 3).map((skill: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedAlumni({ id: '1', name: match.alumni?.full_name })}
              className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Request Mentorship
            </button>
          </motion.div>
        ))}
      </div>

      {matches.length === 0 && !loading && (
        <div className="text-center py-16">
          <Users className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No matches yet</h3>
          <p className="text-gray-600 mb-6">Complete your profile to get personalized alumni matches</p>
          <button
            onClick={() => setActiveTab('settings')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Complete Profile
          </button>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'matches':
        return renderMatches();
      case 'mentorship':
        return (
          <div className="text-center py-16">
            <BookOpen className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900">Mentorship Sessions</h2>
            <p className="text-gray-600 mt-2">Your mentorship sessions will appear here</p>
          </div>
        );
      case 'opportunities':
        return (
          <div className="text-center py-16">
            <Briefcase className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900">Job Opportunities</h2>
            <p className="text-gray-600 mt-2">Browse and apply to opportunities posted by alumni</p>
          </div>
        );
      case 'interviews':
        return <CareerInsights />;
      case 'messages':
        return (
          <div className="text-center py-16">
            <MessageSquare className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            <p className="text-gray-600 mt-2">Your messages will appear here</p>
          </div>
        );
      case 'settings':
        return <ProfileSettings />;
      default:
        return renderDashboard();
    }
  };

  return (
    <>
      <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </DashboardLayout>
      {selectedAlumni && (
        <MentorshipRequest
          alumniId={selectedAlumni.id}
          alumniName={selectedAlumni.name}
          onClose={() => setSelectedAlumni(null)}
          onSuccess={() => {}}
        />
      )}
    </>
  );
}
