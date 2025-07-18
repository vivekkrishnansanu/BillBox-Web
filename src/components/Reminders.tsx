import { useMemo } from 'react';
import { Expense, Category } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { CategoryIcon } from './CategoryIcon';
import { getDaysUntilDue, formatDateRelative } from '../utils/dateUtils';
import { AlertTriangle, CheckCircle, Bell } from 'lucide-react';

interface RemindersProps {
  expenses: Expense[];
  categories: Category[];
  onMarkPaid: (id: string) => void;
  currency: string;
}

export function Reminders({ expenses, categories, onMarkPaid, currency }: RemindersProps) {
  const { t } = useTranslation();

  const billsWithReminders = useMemo(() => {
    return expenses
      .filter(expense => expense.isRecurring && expense.nextDueDate)
      .map(expense => ({
        ...expense,
        daysUntil: getDaysUntilDue(expense.nextDueDate!),
        category: categories.find(c => c.id === expense.category)!
      }))
      .filter(bill => bill.daysUntil >= -7) // Show bills up to 7 days overdue
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [expenses, categories]);

  const groupedBills = useMemo(() => {
    const overdue = billsWithReminders.filter(bill => bill.daysUntil < 0);
    const dueToday = billsWithReminders.filter(bill => bill.daysUntil === 0);
    const upcoming = billsWithReminders.filter(bill => bill.daysUntil > 0);

    return { overdue, dueToday, upcoming };
  }, [billsWithReminders]);

  const renderBillGroup = (bills: typeof billsWithReminders, title: string, icon: React.ReactNode) => {
    if (bills.length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-4">
          {icon}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {bills.length}
          </span>
        </div>
        <div className="space-y-3">
          {bills.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CategoryIcon 
                  icon={bill.category.icon} 
                  color={bill.category.color} 
                  size={20} 
                />
                <div>
                  <p className="font-medium text-gray-900">
                    {bill.description}
                  </p>
                  <p className="text-sm text-gray-600">
                    {bill.daysUntil === 0 
                      ? t('dueToday')
                      : bill.daysUntil < 0
                        ? `${t('overdue')} ${Math.abs(bill.daysUntil)} ${t('days')}`
                        : `${t('dueIn')} ${bill.daysUntil} ${t('days')}`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {currency}{bill.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateRelative(bill.nextDueDate!)}
                  </p>
                </div>
                <button
                  onClick={() => onMarkPaid(bill.id)}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  {t('markPaid')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('reminders')}
        </h1>
        <Bell size={24} className="text-gray-500" />
      </div>

      {billsWithReminders.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-green-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No bills due soon
          </h2>
          <p className="text-gray-600">
            All your recurring bills are up to date
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {renderBillGroup(
            groupedBills.overdue,
            t('overdue'),
            <AlertTriangle size={20} className="text-red-500" />
          )}
          
          {renderBillGroup(
            groupedBills.dueToday,
            t('dueToday'),
            <AlertTriangle size={20} className="text-orange-500" />
          )}
          
          {renderBillGroup(
            groupedBills.upcoming,
            t('upcomingBills'),
            <Bell size={20} className="text-blue-500" />
          )}
        </div>
      )}
    </div>
  );
}