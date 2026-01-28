import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Users, Shield, TrendingUp, Activity, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalAlumni: 0,
    pendingVerifications: 0,
    activeSessions: 0,
    totalMatches: 0,
  });
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [profilesRes, verificationsRes, sessionsRes, matchesRes] = await Promise.all([
        supabase.from('profiles').select('user_role'),
        supabase
          .from('verification_requests')
          .select('*, user:user_id(full_name, email)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('mentorship_sessions')
          .select('*')
          .eq('status', 'accepted'),
        supabase
          .from('ai_matches')
          .select('*')
          .eq('is_active', true),
      ]);

      const students = profilesRes.data?.filter((p) => p.user_role === 'student').length || 0;
      const alumni = profilesRes.data?.filter((p) => p.user_role === 'alumni').length || 0;

      setStats({
        totalUsers: profilesRes.data?.length || 0,
        totalStudents: students,
        totalAlumni: alumni,
        pendingVerifications: verificationsRes.data?.length || 0,
        activeSessions: sessionsRes.data?.length || 0,
        totalMatches: matchesRes.data?.length || 0,
      });

      if (verificationsRes.data) setVerificationRequests(verificationsRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';

      const { data: request } = await supabase
        .from('verification_requests')
        .select('user_id')
        .eq('id', requestId)
        .single();

      await supabase
        .from('verification_requests')
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq('id', requestId);

      if (action === 'approve' && request) {
        await supabase
          .from('profiles')
          .update({ is_verified: true, verification_badge: true })
          .eq('id', request.user_id);
      }

      loadDashboardData();
    } catch (error) {
      console.error('Error handling verification:', error);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and management</p>
      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <Users className="w-10 h-10 mb-4 opacity-80" />
          <div className="text-3xl font-bold mb-1">{stats.totalUsers}</div>
          <div className="text-blue-100">Total Users</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"
        >
          <Users className="w-10 h-10 mb-4 opacity-80" />
          <div className="text-3xl font-bold mb-1">{stats.totalStudents}</div>
          <div className="text-green-100">Students</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <Users className="w-10 h-10 mb-4 opacity-80" />
          <div className="text-3xl font-bold mb-1">{stats.totalAlumni}</div>
          <div className="text-orange-100">Alumni</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white"
        >
          <Shield className="w-10 h-10 mb-4 opacity-80" />
          <div className="text-3xl font-bold mb-1">{stats.pendingVerifications}</div>
          <div className="text-red-100">Pending Verifications</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white"
        >
          <Activity className="w-10 h-10 mb-4 opacity-80" />
          <div className="text-3xl font-bold mb-1">{stats.activeSessions}</div>
          <div className="text-cyan-100">Active Sessions</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <TrendingUp className="w-10 h-10 mb-4 opacity-80" />
          <div className="text-3xl font-bold mb-1">{stats.totalMatches}</div>
          <div className="text-purple-100">AI Matches</div>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Activity</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {((stats.totalAlumni / stats.totalUsers) * 100).toFixed(1)}%
            </div>
            <div className="text-gray-600">Alumni Ratio</div>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {stats.totalMatches > 0
                ? (stats.activeSessions / stats.totalMatches * 100).toFixed(1)
                : 0}
              %
            </div>
            <div className="text-gray-600">Match to Session Rate</div>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {stats.activeSessions}
            </div>
            <div className="text-gray-600">Active Engagements</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Alumni Verification</h1>
        <p className="text-gray-600">Review and approve alumni verification requests</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl p-6 border border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : verificationRequests.length > 0 ? (
        <div className="space-y-4">
          {verificationRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{request.user?.full_name}</h3>
                  <p className="text-gray-600">{request.user?.email}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                  Pending
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-700">Proof Type:</span>
                  <span className="ml-2 text-gray-900">{request.proof_type}</span>
                </div>
                {request.institute_email && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Institute Email:</span>
                    <span className="ml-2 text-gray-900">{request.institute_email}</span>
                  </div>
                )}
                {request.document_url && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Document:</span>
                    <a
                      href={request.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-700 underline"
                    >
                      View Document
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-700">Submitted:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(request.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleVerification(request.id, 'approve')}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </button>
                <button
                  onClick={() => handleVerification(request.id, 'reject')}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Shield className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Verifications</h3>
          <p className="text-gray-600">All verification requests have been processed</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'verification':
        return renderVerification();
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
