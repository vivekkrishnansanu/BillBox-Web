import { MonthlyStats } from '../types';

export function generateWhatsAppMessage(stats: MonthlyStats, currency: string = '$'): string {
  const { totalSpent, expensesByCategory, month, year } = stats;
  
  let message = `📊 *Monthly Summary - ${month} ${year}*\n\n`;
  message += `💰 Total Spent: ${currency}${totalSpent.toFixed(2)}\n\n`;
  
  message += `📋 *By Category:*\n`;
  Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, amount]) => {
      const percentage = ((amount / totalSpent) * 100).toFixed(1);
      message += `• ${category}: ${currency}${amount.toFixed(2)} (${percentage}%)\n`;
    });
  
  message += `\n🎯 Shared from BillBox - Smart Expense Tracker`;
  
  return message;
}

export function shareViaWhatsApp(message: string): void {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}

export function canShare(): boolean {
  return 'share' in navigator || 'webkitShare' in navigator;
}

export function shareNative(data: { title?: string; text?: string; url?: string }): void {
  if (navigator.share) {
    navigator.share(data);
  }
}