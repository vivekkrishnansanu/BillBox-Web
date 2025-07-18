import React from 'react';
import { History } from 'lucide-react';

export function TransactionCard() {
  return (
    <div className="flex flex-col items-center justify-center bg-green-50 border-2 border-blue-400 rounded-2xl py-4 px-3 w-full shadow-md relative">
      <History size={28} className="text-green-600 mb-1" />
      <span className="text-base font-semibold text-green-800 text-center whitespace-nowrap">
        Transaction History
      </span>
      <span className="absolute top-2 right-3 w-2.5 h-2.5 bg-green-400 rounded-full"></span>
    </div>
  );
} 