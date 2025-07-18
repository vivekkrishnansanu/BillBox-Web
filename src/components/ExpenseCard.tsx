import { Expense, Category } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatDate } from '../utils/dateUtils';
import { Edit2, Trash2, Calendar } from 'lucide-react';

interface ExpenseCardProps {
  expense: Expense;
  category: Category;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  currency?: string;
}

export function ExpenseCard({ expense, category, onEdit, onDelete, currency = '$' }: ExpenseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <CategoryIcon icon={category.icon} color={category.color} size={20} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {expense.description}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-500">
                {formatDate(expense.date)}
              </span>
              {expense.isRecurring && (
                <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  <Calendar size={12} />
                  <span>Monthly</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-900">
            {currency}{expense.amount.toFixed(2)}
          </span>
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit(expense)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              aria-label="Edit expense"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(expense.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              aria-label="Delete expense"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}