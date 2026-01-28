import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, TrendingUp, ThumbsUp, Eye } from 'lucide-react';

interface InterviewExperienceCardProps {
  experience: {
    id: string;
    company: string;
    position: string;
    interview_date: string;
    difficulty_level: string;
    content: string;
    tips: string[];
    outcome: string;
    upvotes: number;
    views: number;
    author: {
      full_name: string;
    };
  };
}

export function InterviewExperienceCard({ experience }: InterviewExperienceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{experience.position}</h3>
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase className="w-4 h-4" />
            <span>{experience.company}</span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(experience.difficulty_level)}`}>
          {experience.difficulty_level}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {new Date(experience.interview_date).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1">
          <ThumbsUp className="w-4 h-4" />
          {experience.upvotes}
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          {experience.views}
        </div>
      </div>

      {expanded ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
            <p className="text-gray-700 whitespace-pre-line">{experience.content}</p>
          </div>

          {experience.tips && experience.tips.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Tips</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {experience.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {experience.outcome && (
            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Outcome: {experience.outcome}</span>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
            Shared by {experience.author.full_name}
          </div>
        </motion.div>
      ) : (
        <p className="text-gray-600 line-clamp-2">{experience.content}</p>
      )}
    </motion.div>
  );
}
