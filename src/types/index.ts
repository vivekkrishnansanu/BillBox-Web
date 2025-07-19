export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  isRecurring: boolean;
  recurringDayOfMonth?: number;
  nextDueDate?: string;
  isPaid?: boolean;
  createdAt: string;
  user_id?: string;
  aiConfidence?: number;
  location?: string;
  merchant?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom?: boolean;
  keywords?: string[];
  aiTrainingData?: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences: {
    currency: 'INR';
    language: string;
    reminderDays: number;
    reminderTypes: ('in-app' | 'sms' | 'whatsapp')[];
    monthlyBudget?: number;
    categories: string[];
  };
  createdAt: string;
  lastLogin: string;
}

export interface AIInsight {
  id: string;
  type: 'spending_pattern' | 'budget_alert' | 'category_suggestion' | 'bill_prediction';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface Reminder {
  id: string;
  expenseId: string;
  dueDate: string;
  daysBeforeReminder: number;
  type: 'in-app' | 'sms' | 'whatsapp';
  isActive: boolean;
  sent: boolean;
  message: string;
}

export interface MonthlyStats {
  totalSpent: number;
  totalIncome: number;
  expensesByCategory: Record<string, number>;
  billsDue: number;
  month: string;
  year: number;
  budgetUtilization?: number;
  aiInsights: AIInsight[];
}

export interface Settings {
  language: string;
  currency: 'INR'; // Fixed to Indian Rupee only
  reminderDays: number;
  reminderTypes: ('in-app' | 'sms' | 'whatsapp')[];
  pinEnabled: boolean;
  pin?: string;
  aiEnabled: boolean;
  phoneNumber?: string;
  whatsappNumber?: string;
}

export interface Income {
  id: string;
  monthlyIncome: number;
  extraIncome: number;
  incomeSource?: string;
  month: string; // YYYY-MM format
  createdAt: string;
  user_id?: string;
}

export interface EMI {
  id: string;
  name: string;
  monthlyAmount: number;
  tenure: number; // in months
  startMonth: string; // YYYY-MM format
  category: string;
  totalAmount: number; // calculated: monthlyAmount * tenure
  endMonth: string; // calculated: startMonth + tenure
  isActive: boolean;
  createdAt: string;
  user_id?: string;
}

export interface FinancialForecast {
  month: string;
  income: number;
  expenses: number;
  activeEMIs: number;
  totalEMIAmount: number;
  remainingAmount: number;
  savings: number;
  completedEMIs: string[];
}

export interface Savings {
  id: string;
  type: 'fd' | 'rd' | 'sip' | 'custom';
  name: string;
  
  // Common fields
  amount: number;
  startDate: string;
  
  // FD specific
  maturityPeriod?: number; // in months
  interestRate?: number;
  compoundingFrequency?: 'monthly' | 'quarterly' | 'annually';
  bankName?: string;
  expectedMaturityAmount?: number;
  maturityDate?: string;
  
  // RD specific
  monthlyDeposit?: number;
  tenure?: number; // in months
  autoDebit?: boolean;
  expectedTotal?: number;
  
  // SIP specific
  fundName?: string;
  monthlyInvestment?: number;
  expectedAnnualReturn?: number;
  duration?: number; // in months
  goalTag?: string;
  expectedFutureValue?: number;
  
  // Custom specific
  frequency?: 'one-time' | 'monthly' | 'quarterly' | 'yearly';
  purpose?: string;
  
  // Status
  isActive: boolean;
  isMatured: boolean;
  currentValue?: number;
  
  createdAt: string;
  user_id?: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  category: string;
  startDate: string;
  nextBillingDate: string;
  isActive: boolean;
  autoRenewal: boolean;
  description?: string;
  createdAt: string;
  user_id?: string;
}

export interface SavingsOverview {
  totalSaved: number;
  monthlyContribution: number;
  expectedReturns: number;
  upcomingMaturity: Savings[];
  savingsByType: Record<string, number>;
  projectedGrowth: { month: string; value: number }[];
}