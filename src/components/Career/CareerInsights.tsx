import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Briefcase, DollarSign, Target, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function CareerInsights() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-insights`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-12 text-gray-500">
        <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Unable to load career insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Career Intelligence Dashboard</h2>
        <p className="text-gray-600">AI-powered insights to guide your career journey</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <Briefcase className="w-10 h-10 mb-4 opacity-80" />
          <div className="text-3xl font-bold mb-1">{insights.market_summary.total_active_jobs}</div>
          <div className="text-blue-100">Active Opportunities</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"
        >
          <Zap className="w-10 h-10 mb-4 opacity-80" />
          <div className="text-3xl font-bold mb-1">{insights.market_summary.most_in_demand}</div>
          <div className="text-green-100">Most In-Demand Skill</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <TrendingUp className="w-10 h-10 mb-4 opacity-80" />
          <div className="text-3xl font-bold mb-1">{insights.market_summary.avg_growth_rate}</div>
          <div className="text-orange-100">Avg Growth Rate</div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Trending Skills
          </h3>
          <div className="space-y-3">
            {insights.trending_skills.slice(0, 5).map((skill: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{skill.skill}</div>
                  <div className="text-sm text-gray-600">{skill.demand} job postings</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    +{skill.growth_rate.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Top Companies Hiring
          </h3>
          <div className="space-y-3">
            {insights.top_companies.slice(0, 5).map((company: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{company.company}</div>
                  <div className="text-sm text-gray-600">{company.alumni_count} alumni working here</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {insights.personalized_insights && insights.personalized_insights.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Your Skills Analysis
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {insights.personalized_insights.map((insight: any, index: number) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900">{insight.skill}</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    insight.demand_level === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {insight.demand_level} Demand
                  </span>
                </div>
                <p className="text-sm text-gray-600">{insight.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          Recommended Career Paths
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {insights.career_paths.map((path: any, index: number) => (
            <motion.div
              key={index}
              whileHover={{ y: -4 }}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition"
            >
              <h4 className="text-lg font-bold text-gray-900 mb-2">{path.path}</h4>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Avg Salary:</span>
                  <span className="font-semibold text-gray-900">${parseInt(path.avg_salary).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Demand:</span>
                  <span className="font-semibold text-green-600">{path.demand}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Timeline:</span>
                  <span className="font-semibold text-gray-900">{path.time_to_proficiency}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-700 mb-2">Required Skills:</div>
                <div className="flex flex-wrap gap-2">
                  {path.skills_needed.slice(0, 3).map((skill: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
