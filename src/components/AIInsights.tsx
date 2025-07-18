import { AIInsight } from '../types';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, DollarSign, Calendar, Zap } from 'lucide-react';

interface AIInsightsProps {
  insights: AIInsight[];
  darkMode?: boolean;
}

export function AIInsights({ insights, darkMode = false }: AIInsightsProps) {
  if (insights.length === 0) {
    return (
      <div className={`rounded-lg shadow-sm border p-4 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center space-x-2 mb-3">
          <Brain size={20} className="text-purple-600" />
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Insights</h3>
        </div>
        <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Add more expenses to get personalized insights
        </p>
      </div>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'budget_alert':
      case 'spending_velocity':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'spending_pattern':
      case 'category_dominance':
        return <TrendingUp size={16} className="text-blue-500" />;
      case 'category_suggestion':
      case 'savings_opportunity':
        return <Lightbulb size={16} className="text-yellow-500" />;
      case 'bill_prediction':
        return <Calendar size={16} className="text-green-500" />;
      case 'anomaly_detection':
        return <Zap size={16} className="text-orange-500" />;
      case 'predictive_spending':
        return <Target size={16} className="text-indigo-500" />;
      default:
        return <Brain size={16} className="text-purple-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className={`rounded-lg shadow-sm border p-4 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center space-x-2 mb-4">
        <Brain size={20} className="text-purple-600" />
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Insights</h3>
        <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-medium">
          {insights.length} insights
        </span>
      </div>
      
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`border-l-4 p-3 rounded-r-lg ${getPriorityColor(insight.priority)}`}
          >
            <div className="flex items-start space-x-2">
              {getInsightIcon(insight.type)}
              <div className="flex-1">
                <h4 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {insight.title}
                </h4>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {insight.description}
                </p>
                {insight.actionable && (
                  <button className="text-purple-600 text-xs font-medium mt-2 hover:text-purple-700 transition-colors">
                    Take Action →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}