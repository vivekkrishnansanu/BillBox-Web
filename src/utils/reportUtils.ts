import { Income, EMI, Savings, Expense } from '../types';

export interface MonthlyFinancialReport {
  month: string;
  year: number;
  income: {
    total: number;
    primary: number;
    extra: number;
    source?: string;
  };
  expenses: {
    total: number;
    byCategory: Record<string, number>;
    topCategory: { name: string; amount: number; percentage: number };
  };
  emis: {
    active: number;
    totalMonthly: number;
    totalRemaining: number;
    list: Array<{ name: string; amount: number; category: string }>;
  };
  savings: {
    totalSaved: number;
    monthlyContribution: number;
    activeSavings: number;
    breakdown: Array<{ type: string; amount: number; name: string }>;
    upcomingMaturity: Array<{ name: string; amount: number; date: string }>;
  };
  forecast: {
    availableBalance: number;
    savingsRate: number;
    emiToIncomeRatio: number;
    nextMonthProjection: number;
  };
  summary: {
    financialHealth: 'excellent' | 'good' | 'average' | 'poor';
    recommendations: string[];
  };
}

export function generateMonthlyReport(
  income: Income[],
  expenses: Expense[],
  emis: EMI[],
  savings: Savings[]
): MonthlyFinancialReport {
  const currentDate = new Date();
  const currentMonth = currentDate.toISOString().slice(0, 7);
  const monthName = currentDate.toLocaleDateString(undefined, { month: 'long' });
  const year = currentDate.getFullYear();

  // Income Analysis
  const currentIncome = income.find(inc => inc.month === currentMonth);
  const totalIncome = currentIncome ? currentIncome.monthlyIncome + currentIncome.extraIncome : 0;

  // Expenses Analysis
  const monthExpenses = expenses.filter(expense => {
    const expenseMonth = expense.date.slice(0, 7);
    return expenseMonth === currentMonth;
  });

  const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const expensesByCategory = monthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => b - a)[0];

  // EMI Analysis
  const activeEMIs = emis.filter(emi => {
    return currentMonth >= emi.startMonth && currentMonth <= emi.endMonth && emi.isActive;
  });

  const totalMonthlyEMI = activeEMIs.reduce((sum, emi) => sum + emi.monthlyAmount, 0);
  const totalRemainingEMI = activeEMIs.reduce((sum, emi) => {
    const remainingMonths = Math.max(0, 
      (new Date(emi.endMonth + '-01').getTime() - new Date(currentMonth + '-01').getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    return sum + (emi.monthlyAmount * Math.ceil(remainingMonths));
  }, 0);

  // Savings Analysis
  const activeSavings = savings.filter(s => s.isActive && !s.isMatured);
  const totalSaved = activeSavings.reduce((sum, s) => sum + s.amount, 0);
  
  const monthlyContribution = activeSavings.reduce((sum, s) => {
    if (s.type === 'rd') return sum + (s.monthlyDeposit || 0);
    if (s.type === 'sip') return sum + (s.monthlyInvestment || 0);
    if (s.type === 'custom' && s.frequency === 'monthly') return sum + s.amount;
    return sum;
  }, 0);

  const savingsBreakdown = activeSavings.map(s => ({
    type: s.type.toUpperCase(),
    amount: s.type === 'rd' ? (s.monthlyDeposit || 0) : 
            s.type === 'sip' ? (s.monthlyInvestment || 0) : s.amount,
    name: s.name
  }));

  const upcomingMaturity = activeSavings
    .filter(s => s.maturityDate)
    .map(s => ({
      name: s.name,
      amount: s.expectedMaturityAmount || s.expectedTotal || s.expectedFutureValue || s.amount,
      date: s.maturityDate!
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Financial Forecast
  const availableBalance = totalIncome - totalExpenses - totalMonthlyEMI;
  const savingsRate = totalIncome > 0 ? ((availableBalance / totalIncome) * 100) : 0;
  const emiToIncomeRatio = totalIncome > 0 ? ((totalMonthlyEMI / totalIncome) * 100) : 0;
  const nextMonthProjection = availableBalance - monthlyContribution;

  // Financial Health Assessment
  let financialHealth: 'excellent' | 'good' | 'average' | 'poor' = 'poor';
  const recommendations: string[] = [];

  if (savingsRate >= 30) {
    financialHealth = 'excellent';
  } else if (savingsRate >= 20) {
    financialHealth = 'good';
  } else if (savingsRate >= 10) {
    financialHealth = 'average';
  }

  if (emiToIncomeRatio > 50) {
    recommendations.push('EMI burden is high (>50% of income). Consider debt consolidation.');
  }
  if (savingsRate < 20) {
    recommendations.push('Increase savings rate to at least 20% of income.');
  }
  if (totalExpenses > totalIncome * 0.7) {
    recommendations.push('Reduce discretionary expenses to improve savings.');
  }

  return {
    month: monthName,
    year,
    income: {
      total: totalIncome,
      primary: currentIncome?.monthlyIncome || 0,
      extra: currentIncome?.extraIncome || 0,
      source: currentIncome?.incomeSource
    },
    expenses: {
      total: totalExpenses,
      byCategory: expensesByCategory,
      topCategory: topCategory ? {
        name: topCategory[0],
        amount: topCategory[1],
        percentage: Math.round((topCategory[1] / totalExpenses) * 100)
      } : { name: 'None', amount: 0, percentage: 0 }
    },
    emis: {
      active: activeEMIs.length,
      totalMonthly: totalMonthlyEMI,
      totalRemaining: totalRemainingEMI,
      list: activeEMIs.map(emi => ({
        name: emi.name,
        amount: emi.monthlyAmount,
        category: emi.category
      }))
    },
    savings: {
      totalSaved,
      monthlyContribution,
      activeSavings: activeSavings.length,
      breakdown: savingsBreakdown,
      upcomingMaturity
    },
    forecast: {
      availableBalance,
      savingsRate,
      emiToIncomeRatio,
      nextMonthProjection
    },
    summary: {
      financialHealth,
      recommendations
    }
  };
}

export function generateWhatsAppFinancialReport(report: MonthlyFinancialReport, currency: string = '₹'): string {
  const { month, year, income, expenses, emis, savings, forecast, summary } = report;
  
  let message = `📊 *Monthly Financial Report*\n`;
  message += `📅 ${month} ${year}\n\n`;

  // Income Section
  message += `💰 *INCOME*\n`;
  message += `• Total: ${currency}${income.total.toLocaleString()}\n`;
  if (income.source) {
    message += `• Source: ${income.source}\n`;
  }
  if (income.extra > 0) {
    message += `• Extra Income: ${currency}${income.extra.toLocaleString()}\n`;
  }
  message += `\n`;

  // Expenses Section
  message += `💸 *EXPENSES*\n`;
  message += `• Total: ${currency}${expenses.total.toLocaleString()}\n`;
  if (expenses.topCategory.amount > 0) {
    message += `• Top Category: ${expenses.topCategory.name} (${expenses.topCategory.percentage}%)\n`;
  }
  message += `\n`;

  // EMI Section
  if (emis.active > 0) {
    message += `🏦 *EMI DETAILS*\n`;
    message += `• Active EMIs: ${emis.active}\n`;
    message += `• Monthly EMI: ${currency}${emis.totalMonthly.toLocaleString()}\n`;
    message += `• Remaining: ${currency}${emis.totalRemaining.toLocaleString()}\n`;
    
    if (emis.list.length > 0) {
      message += `• EMI Breakdown:\n`;
      emis.list.forEach(emi => {
        message += `  - ${emi.name}: ${currency}${emi.amount.toLocaleString()}\n`;
      });
    }
    message += `\n`;
  }

  // Savings Section
  if (savings.activeSavings > 0) {
    message += `🎯 *SAVINGS & INVESTMENTS*\n`;
    message += `• Total Saved: ${currency}${savings.totalSaved.toLocaleString()}\n`;
    message += `• Monthly Contribution: ${currency}${savings.monthlyContribution.toLocaleString()}\n`;
    message += `• Active Savings: ${savings.activeSavings}\n`;
    
    if (savings.breakdown.length > 0) {
      message += `• Breakdown:\n`;
      savings.breakdown.forEach(item => {
        message += `  - ${item.type}: ${currency}${item.amount.toLocaleString()} (${item.name})\n`;
      });
    }
    
    if (savings.upcomingMaturity.length > 0) {
      message += `• Upcoming Maturity:\n`;
      savings.upcomingMaturity.forEach(item => {
        const maturityDate = new Date(item.date).toLocaleDateString();
        message += `  - ${item.name}: ${currency}${item.amount.toLocaleString()} (${maturityDate})\n`;
      });
    }
    message += `\n`;
  }

  // Financial Forecast
  message += `📈 *FINANCIAL FORECAST*\n`;
  message += `• Available Balance: ${currency}${forecast.availableBalance.toLocaleString()}\n`;
  message += `• Savings Rate: ${forecast.savingsRate.toFixed(1)}%\n`;
  message += `• EMI to Income Ratio: ${forecast.emiToIncomeRatio.toFixed(1)}%\n`;
  
  const healthEmoji = {
    excellent: '🟢',
    good: '🟡',
    average: '🟠',
    poor: '🔴'
  };
  
  message += `• Financial Health: ${healthEmoji[summary.financialHealth]} ${summary.financialHealth.toUpperCase()}\n\n`;

  // Recommendations
  if (summary.recommendations.length > 0) {
    message += `💡 *RECOMMENDATIONS*\n`;
    summary.recommendations.forEach((rec, index) => {
      message += `${index + 1}. ${rec}\n`;
    });
    message += `\n`;
  }

  // Summary
  const totalOutflow = expenses.total + emis.totalMonthly + savings.monthlyContribution;
  const netSavings = income.total - totalOutflow;
  
  message += `📋 *SUMMARY*\n`;
  message += `• Income: ${currency}${income.total.toLocaleString()}\n`;
  message += `• Expenses: ${currency}${expenses.total.toLocaleString()}\n`;
  message += `• EMI: ${currency}${emis.totalMonthly.toLocaleString()}\n`;
  message += `• Savings: ${currency}${savings.monthlyContribution.toLocaleString()}\n`;
  message += `• Net Balance: ${currency}${netSavings.toLocaleString()}\n\n`;

  message += `📱 Generated by BillBox - Smart Financial Tracker`;
  
  return message;
}

export function shareFinancialReportViaWhatsApp(message: string): void {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}