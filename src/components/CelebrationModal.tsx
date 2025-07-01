import React from 'react';
import { X, Award, Trophy, Star, Zap, Target, TrendingUp } from 'lucide-react';
import { Celebration } from '../types';

interface CelebrationModalProps {
  celebration: Celebration;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({
  celebration,
  onClose,
  onAcknowledge
}) => {
  const getCelebrationIcon = () => {
    switch (celebration.type) {
      case 'milestone':
        return <Target className="h-12 w-12 text-white" />;
      case 'goal_achieved':
        return <Trophy className="h-12 w-12 text-white" />;
      case 'debt_paid':
        return <Zap className="h-12 w-12 text-white" />;
      case 'streak':
        return <TrendingUp className="h-12 w-12 text-white" />;
      case 'level_up':
        return <Star className="h-12 w-12 text-white" />;
      default:
        return <Award className="h-12 w-12 text-white" />;
    }
  };

  const handleAcknowledge = () => {
    onAcknowledge(celebration.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-md">
        <div className={`bg-gradient-to-br ${celebration.color} rounded-lg shadow-xl overflow-hidden`}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Celebration content */}
          <div className="p-6 text-center text-white">
            <div className="mb-4">
              <div className="bg-white/20 rounded-full p-4 inline-block">
                {getCelebrationIcon()}
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-2">{celebration.title}</h3>
            <p className="text-white/90 mb-6">{celebration.message}</p>
            
            {/* Confetti animation */}
            <div className="relative h-20 mb-6">
              <div className="absolute inset-0 flex justify-center">
                <div className="w-1 h-20 bg-yellow-300 animate-fall-1"></div>
                <div className="w-1 h-20 bg-blue-300 animate-fall-2"></div>
                <div className="w-1 h-20 bg-green-300 animate-fall-3"></div>
                <div className="w-1 h-20 bg-red-300 animate-fall-4"></div>
                <div className="w-1 h-20 bg-purple-300 animate-fall-5"></div>
              </div>
            </div>
            
            <button
              onClick={handleAcknowledge}
              className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              Awesome!
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fall-1 {
          0% { transform: translateY(-100%) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(100%) rotate(180deg); opacity: 0; }
        }
        @keyframes fall-2 {
          0% { transform: translateY(-100%) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(100%) rotate(-180deg); opacity: 0; }
        }
        @keyframes fall-3 {
          0% { transform: translateY(-100%) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(100%) rotate(90deg); opacity: 0; }
        }
        @keyframes fall-4 {
          0% { transform: translateY(-100%) rotate(0deg); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: translateY(100%) rotate(-90deg); opacity: 0; }
        }
        @keyframes fall-5 {
          0% { transform: translateY(-100%) rotate(0deg); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(100%) rotate(45deg); opacity: 0; }
        }
        .animate-fall-1 { animation: fall-1 2s ease-in-out infinite; }
        .animate-fall-2 { animation: fall-2 2.2s ease-in-out infinite 0.2s; }
        .animate-fall-3 { animation: fall-3 1.8s ease-in-out infinite 0.4s; }
        .animate-fall-4 { animation: fall-4 2.4s ease-in-out infinite 0.6s; }
        .animate-fall-5 { animation: fall-5 2s ease-in-out infinite 0.8s; }
      `}</style>
    </div>
  );
};

export default CelebrationModal;