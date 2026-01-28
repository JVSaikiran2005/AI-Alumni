import { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Briefcase, CheckCircle, Clock, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { JobPostingForm } from '../components/Jobs/JobPostingForm';
import { ProfileSettings } from '../components/Profile/ProfileSettings';

const mockSessions = [
  { id: '1', title: 'Career Planning', student: { full_name: 'John Smith' }, status: 'requested', description: 'I need help with my career path' },
  { id: '2', title: 'Interview Prep', student: { full_name: 'Jane Doe' }, status: 'accepted', description: 'Help with technical interviews' }
];

const mockReferralRequests = [
  { id: '1', student: { full_name: 'John Smith' }, job_posting: { title: 'Frontend Developer', company: 'TechCorp' }, message: 'Can you refer me?' }
];

export function AlumniDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats] = useState({
    totalMentees: 5,
    activeSessions: 2,
    referralRequests: 1,
    jobsPosted: 3,
  });
  const [sessions] = useState(mockSessions);
  const [referralRequests] = useState(mockReferralRequests);
  const [loading] = useState(false);

  const handleSessionAction = async (sessionId: string, action: 'accept' | 'reject') => {
    alert(`Session ${action}ed: ${sessionId}`);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile?.full_name}!
        </h1>
        <p className="text-gray-600">Manage your mentees and help shape the next generation</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <Users className="w-10 h-10 mb-4 opacity-80" />
          <div className="text-3xl font-bold mb-1">{stats.totalMentees}</div>
          <div className="text-blue-100">Total Mentees</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"
        >
          <CheckCircle className="w-10 h-10 mb-4 opacity-80" />
          <div className="text-3xl font-bold mb-1">{stats.activeSessions}</div>
          <div className="text-green-100">Active Sessions</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <MessageSquare className="w-10 h-10 mb-4 opacity-80" />
          <div className="text-3xl font-bold mb-1">{stats.referralRequests}</div>
          <div className="text-orange-100">Referral Requests</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white"
        >
          <Briefcase className="w-10 h-10 mb-4 opacity-80" />
          <div className="text-3xl font-bold mb-1">{stats.jobsPosted}</div>
          <div className="text-cyan-100">Jobs Posted</div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Pending Mentorship Requests</h2>
          {sessions.filter((s) => s.status === 'requested').length > 0 ? (
            <div className="space-y-4">
              {sessions
                .filter((s) => s.status === 'requested')
                .slice(0, 5)
                .map((session) => (
                  <div key={session.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{session.title}</div>
                        <div className="text-sm text-gray-600">
                          from {session.student?.full_name}
                        </div>
                      </div>
                      <Clock className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{session.description}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSessionAction(session.id, 'accept')}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleSessionAction(session.id, 'reject')}
                        className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition text-sm"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pending requests</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Referral Requests</h2>
          {referralRequests.length > 0 ? (
            <div className="space-y-4">
              {referralRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {request.student?.full_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {request.job_posting?.title} at {request.job_posting?.company}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{request.message}</p>
                  <button
                    onClick={() => setActiveTab('referrals')}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-sm"
                  >
                    Review Request
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No referral requests</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your Impact</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {sessions.filter((s) => s.status === 'completed').length}
            </div>
            <div className="text-gray-700">Sessions Completed</div>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.totalMentees}
            </div>
            <div className="text-gray-700">Students Helped</div>
          </div>
          <div className="text-center p-6 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {stats.jobsPosted}
            </div>
            <div className="text-gray-700">Opportunities Posted</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPostJob = () => (
    <div className="max-w-3xl mx-auto">
      <JobPostingForm onSuccess={() => {}} />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'post-job':
        return renderPostJob();
      case 'settings':
        return <ProfileSettings />;
      default:
        return renderDashboard();
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}
