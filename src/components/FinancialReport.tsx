import { useState } from 'react';
import { Income, EMI, Savings, Expense } from '../types';
import { generateMonthlyReport, generateWhatsAppFinancialReport, shareFinancialReportViaWhatsApp } from '../utils/reportUtils';
import { 
  FileText, 
  Share2, 
  Download, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Target,
  Calendar,
  Eye,
  EyeOff,
  MessageCircle
} from 'lucide-react';

interface FinancialReportProps {
  income: Income[];
  expenses: Expense[];
  emis: EMI[];
  savings: Savings[];
  currency: string;
  darkMode?: boolean;
}

export function FinancialReport({
  income,
  expenses,
  emis,
  savings,
  currency,
  darkMode = false
}: FinancialReportProps) {
  const [showAmounts, setShowAmounts] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const report = generateMonthlyReport(income, expenses, emis, savings);

  const handleShareWhatsApp = async () => {
    setIsGenerating(true);
    try {
      const message = generateWhatsAppFinancialReport(report, currency);
      shareFinancialReportViaWhatsApp(message);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatAmount = (amount: number) => {
    if (!showAmounts) return '****';
    return `${currency}${amount.toLocaleString()}`;
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'average': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const baseClasses = darkMode 
    ? 'bg-gray-800 text-white border-gray-700' 
    : 'bg-white text-gray-900 border-gray-200';

  return (
    <div className={`p-6 space-y-4 pb-12 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Monthly Financial Report
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {report.month} {report.year}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAmounts(!showAmounts)}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            title={showAmounts ? 'Hide amounts' : 'Show amounts'}
          >
            {showAmounts ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <button
            onClick={handleShareWhatsApp}
            disabled={isGenerating}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-3 hover:from-green-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50"
            title="Share via WhatsApp"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <MessageCircle size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Financial Health Overview */}
          <div className={`rounded-lg shadow-sm border p-5 ${baseClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Financial Health Overview
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(report.summary.financialHealth)}`}>
                {report.summary.financialHealth.toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatAmount(report.income.total)}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Income
                </p>
              </div>
              <div className="text-center">
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatAmount(report.expenses.total)}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Expenses
                </p>
              </div>
              <div className="text-center">
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatAmount(report.emis.totalMonthly)}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Monthly EMI
                </p>
              </div>
              <div className="text-center">
                <p className={`text-xl font-bold ${
                  report.forecast.availableBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatAmount(report.forecast.availableBalance)}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Available Balance
                </p>
              </div>
            </div>
          </div>

          {/* Income Details */}
          <div className={`rounded-lg shadow-sm border p-5 ${baseClasses}`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-2">
                <DollarSign size={20} className="text-white" />
              </div>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Income Details
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Primary Income
                </span>
                <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatAmount(report.income.primary)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Extra Income
                </span>
                <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatAmount(report.income.extra)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Source
                </span>
                <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {report.income.source || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Forecast */}
          <div className={`rounded-lg shadow-sm border p-5 ${baseClasses}`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-2">
                <TrendingUp size={20} className="text-white" />
              </div>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Financial Forecast
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Savings Rate
                </p>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {report.forecast.savingsRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  EMI to Income Ratio
                </p>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {report.forecast.emiToIncomeRatio.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Available Balance
                </p>
                <p className={`text-lg font-bold ${
                  report.forecast.availableBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatAmount(report.forecast.availableBalance)}
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Next Month Projection
                </p>
                <p className={`text-lg font-bold ${
                  report.forecast.nextMonthProjection >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatAmount(report.forecast.nextMonthProjection)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* EMI Details - Only show if there are active EMIs */}
          {report.emis.active > 0 && (
            <div className={`rounded-lg shadow-sm border p-5 ${baseClasses}`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-2">
                  <CreditCard size={20} className="text-white" />
                </div>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  EMI Details
                </h2>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Active EMIs
                  </span>
                  <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {report.emis.active}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Monthly EMI
                  </span>
                  <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatAmount(report.emis.totalMonthly)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Remaining
                  </span>
                  <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatAmount(report.emis.totalRemaining)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Savings Details - Only show if there are active savings */}
          {report.savings.activeSavings > 0 && (
            <div className={`rounded-lg shadow-sm border p-5 ${baseClasses}`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-2">
                  <Target size={20} className="text-white" />
                </div>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Savings & Investments
                </h2>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Saved
                  </span>
                  <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatAmount(report.savings.totalSaved)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Monthly Contribution
                  </span>
                  <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatAmount(report.savings.monthlyContribution)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Active Savings
                  </span>
                  <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {report.savings.activeSavings}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {report.summary.recommendations.length > 0 && (
            <div className={`rounded-lg shadow-sm border p-5 ${baseClasses}`}>
              <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Recommendations
              </h2>
              <div className="space-y-3">
                {report.summary.recommendations.map((recommendation, index) => (
                  <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${
                    darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
                  } border`}>
                    <span className="text-yellow-600 font-bold text-sm">
                      {index + 1}.
                    </span>
                    <p className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                      {recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}