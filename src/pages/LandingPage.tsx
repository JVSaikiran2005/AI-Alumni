import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, TrendingUp, Users, Zap } from 'lucide-react';
import { Login } from '../components/Auth/Login';
import { SignUp } from '../components/Auth/SignUp';

export function LandingPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AlumniConnect <span className="text-blue-600">AI</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Smart Alumni Engagement & Career Intelligence Platform
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Network className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Matching</h3>
                <p className="text-gray-600">
                  Connect with alumni who share your interests, skills, and career goals through
                  intelligent matching algorithms.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mentorship Platform</h3>
                <p className="text-gray-600">
                  Book 1-on-1 sessions with experienced alumni for career guidance, interview prep,
                  and professional development.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Career Intelligence</h3>
                <p className="text-gray-600">
                  Access real-time career trends, salary insights, and personalized learning
                  roadmaps powered by AI.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Referral Engine</h3>
                <p className="text-gray-600">
                  Get referred to top companies by alumni working in your dream organizations with
                  AI-predicted success rates.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <AnimatePresence mode="wait">
              {showLogin ? (
                <Login key="login" onToggle={() => setShowLogin(false)} />
              ) : (
                <SignUp key="signup" onToggle={() => setShowLogin(true)} />
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Platform Features
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-600">Alumni Network</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                <div className="text-gray-600">Match Accuracy</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-orange-600 mb-2">5K+</div>
                <div className="text-gray-600">Success Stories</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
