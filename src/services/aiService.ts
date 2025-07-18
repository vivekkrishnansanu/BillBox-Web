import { Category, AIInsight } from '../types';
import { DEFAULT_CATEGORIES, CATEGORY_SUGGESTIONS } from '../constants/categories';

interface CategoryPrediction {
  category: string;
  confidence: number;
  isNewCategory?: boolean;
  suggestedName?: string;
  reasoning?: string;
}

interface SmartSuggestion {
  type: 'category' | 'amount' | 'recurring';
  value: any;
  confidence: number;
  reasoning: string;
}

interface UserInteraction {
  description: string;
  type: string;
  value: any;
  accepted: boolean;
  timestamp: string;
}

interface UserPattern {
  category: string;
  amounts: number[];
  frequency: number;
  lastUsed: string;
  averageAmount: number;
}

class AIService {
  private categories: Category[] = DEFAULT_CATEGORIES;
  private userLearningData: Map<string, string> = new Map();
  private userPatterns: Map<string, UserPattern> = new Map();
  private userInteractions: UserInteraction[] = [];
  private merchantDatabase: Map<string, string> = new Map();

  constructor() {
    this.initializeMerchantDatabase();
    this.loadUserLearningData();
  }

  private initializeMerchantDatabase(): void {
    const merchants = {
      // Food & Dining
      'swiggy': 'food', 'zomato': 'food', 'dominos': 'food', 'kfc': 'food', 'mcdonalds': 'food',
      'pizza hut': 'food', 'subway': 'food', 'burger king': 'food', 'starbucks': 'food',
      'cafe coffee day': 'food', 'haldirams': 'food', 'bikanervala': 'food', 'sagar ratna': 'food',
      'biryani': 'food', 'biriyani': 'food', 'dal': 'food', 'rice': 'food', 'roti': 'food', 'curry': 'food',
      'samosa': 'food', 'dosa': 'food', 'idli': 'food', 'vada': 'food', 'paratha': 'food',
      'grocery': 'food', 'vegetables': 'food', 'fruits': 'food', 'milk': 'food', 'bread': 'food',
      
      // Transport & Fuel
      'uber': 'fuel', 'ola': 'fuel', 'rapido': 'fuel', 'auto': 'fuel', 'taxi': 'fuel',
      'indian oil': 'fuel', 'bharat petroleum': 'fuel', 'hindustan petroleum': 'fuel',
      'reliance petrol': 'fuel', 'shell': 'fuel', 'essar': 'fuel', 'petrol': 'fuel', 'diesel': 'fuel',
      'irctc': 'fuel', 'redbus': 'fuel', 'makemytrip': 'fuel', 'goibibo': 'fuel',
      
      // Shopping
      'amazon': 'shopping', 'flipkart': 'shopping', 'myntra': 'shopping', 'ajio': 'shopping',
      'nykaa': 'shopping', 'jabong': 'shopping', 'snapdeal': 'shopping', 'paytm mall': 'shopping',
      'big bazaar': 'shopping', 'reliance digital': 'shopping', 'croma': 'shopping',
      
      // Bills & Utilities
      'airtel': 'bills', 'jio': 'bills', 'vodafone': 'bills', 'bsnl': 'bills',
      'tata power': 'bills', 'adani electricity': 'bills', 'bescom': 'bills',
      'act fibernet': 'bills', 'hathway': 'bills', 'tikona': 'bills',
      'electricity': 'bills', 'water': 'bills', 'internet': 'bills', 'wifi': 'bills',
      
      // Entertainment
      'netflix': 'entertainment', 'amazon prime': 'entertainment', 'hotstar': 'entertainment',
      'zee5': 'entertainment', 'sony liv': 'entertainment', 'voot': 'entertainment',
      'spotify': 'entertainment', 'gaana': 'entertainment', 'jiosaavn': 'entertainment',
      
      // Health
      'apollo': 'health', 'fortis': 'health', 'max healthcare': 'health', 'aiims': 'health',
      'medplus': 'health', 'apollo pharmacy': 'health', 'netmeds': 'health', '1mg': 'health',
      'doctor': 'health', 'hospital': 'health', 'medicine': 'health', 'pharmacy': 'health',
      
      // Education
      'byjus': 'education', 'unacademy': 'education', 'vedantu': 'education', 'whitehat jr': 'education',
      'coursera': 'education', 'udemy': 'education', 'skillshare': 'education'
    };

    Object.entries(merchants).forEach(([merchant, category]) => {
      this.merchantDatabase.set(merchant.toLowerCase(), category);
    });
  }

  // Main function to generate comprehensive suggestions
  generateComprehensiveSuggestions(description: string, amount?: number) {
    const prediction = this.predictCategory(description, amount);
    const smartSuggestions = this.generateSmartSuggestions(description, amount);
    const learningInsights = this.generateLearningInsights(description);

    return {
      prediction,
      smartSuggestions,
      learningInsights
    };
  }

  // Enhanced category prediction
  predictCategory(description: string, amount?: number): CategoryPrediction {
    const cleanDescription = description.toLowerCase().trim();
    
    // 1. Check user's historical patterns first (highest priority)
    const userPattern = this.findUserHistoricalPattern(cleanDescription, amount);
    if (userPattern.confidence > 0.85) {
      return userPattern;
    }

    // 2. Exact merchant match
    const merchantMatch = this.findMerchantMatch(cleanDescription);
    if (merchantMatch.confidence > 0.8) {
      return merchantMatch;
    }

    // 3. User learning patterns
    const learningMatch = this.findUserLearningPattern(cleanDescription);
    if (learningMatch.confidence > 0.8) {
      return learningMatch;
    }

    // 4. Advanced NLP matching
    const nlpMatch = this.advancedNLPMatching(cleanDescription, amount);
    if (nlpMatch.confidence > 0.6) {
      return nlpMatch;
    }

    // 5. Fuzzy matching for typos
    const fuzzyMatch = this.fuzzyMatching(cleanDescription);
    if (fuzzyMatch.confidence > 0.5) {
      return fuzzyMatch;
    }

    return {
      category: 'miscellaneous',
      confidence: 0.3,
      reasoning: 'No clear pattern found'
    };
  }

  // New method to predict amount based on user patterns
  predictAmount(description: string): { amount: number; confidence: number; reasoning: string } | null {
    const cleanDescription = description.toLowerCase().trim();
    
    // Check exact matches first
    if (this.userPatterns.has(cleanDescription)) {
      const pattern = this.userPatterns.get(cleanDescription)!;
      if (pattern.frequency >= 3) {
        return {
          amount: Math.round(pattern.averageAmount),
          confidence: Math.min(0.9, 0.6 + (pattern.frequency * 0.05)),
          reasoning: `You usually spend ₹${Math.round(pattern.averageAmount)} on ${cleanDescription} (${pattern.frequency} times)`
        };
      }
    }
    
    // Check partial matches
    for (const [key, pattern] of this.userPatterns) {
      if (pattern.frequency >= 3) {
        // Check if description contains the key or vice versa
        if (cleanDescription.includes(key) || key.includes(cleanDescription)) {
          const similarity = this.calculateSimilarity(cleanDescription, key);
          if (similarity > 0.7) {
            return {
              amount: Math.round(pattern.averageAmount),
              confidence: Math.min(0.85, 0.5 + (pattern.frequency * 0.05) + (similarity * 0.2)),
              reasoning: `Similar to "${key}" - you usually spend ₹${Math.round(pattern.averageAmount)} (${pattern.frequency} times)`
            };
          }
        }
      }
    }
    
    return null;
  }
  
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }
  
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  private findUserHistoricalPattern(description: string, amount?: number): CategoryPrediction {
    // Check if user has spent similar amounts on similar descriptions
    for (const [key, pattern] of this.userPatterns) {
      if (description.includes(key) || key.includes(description)) {
        let confidence = 0.7;
        
        // Boost confidence if amount matches user's typical spending
        if (amount && pattern.amounts.length > 2) {
          const avgAmount = pattern.averageAmount;
          const variance = Math.abs(amount - avgAmount) / avgAmount;
          
          if (variance < 0.3) { // Within 30% of average
            confidence += 0.2;
          }
        }
        
        // Boost confidence based on frequency
        if (pattern.frequency >= 3) {
          confidence += 0.1;
        }

        return {
          category: pattern.category,
          confidence: Math.min(confidence, 0.95),
          reasoning: `You usually spend ₹${pattern.averageAmount.toFixed(0)} on ${key} (${pattern.frequency} times)`
        };
      }
    }

    return { category: 'miscellaneous', confidence: 0 };
  }

  private findMerchantMatch(description: string): CategoryPrediction {
    for (const [merchant, category] of this.merchantDatabase) {
      if (description.includes(merchant)) {
        return {
          category,
          confidence: 0.95,
          reasoning: `Recognized merchant: ${merchant}`
        };
      }
    }
    return { category: 'miscellaneous', confidence: 0 };
  }

  private findUserLearningPattern(description: string): CategoryPrediction {
    if (this.userLearningData.has(description)) {
      return {
        category: this.userLearningData.get(description)!,
        confidence: 0.9,
        reasoning: 'Based on your previous categorization'
      };
    }

    // Check partial matches
    for (const [userDesc, category] of this.userLearningData) {
      if (description.includes(userDesc) || userDesc.includes(description)) {
        return {
          category,
          confidence: 0.8,
          reasoning: `Similar to: ${userDesc}`
        };
      }
    }

    return { category: 'miscellaneous', confidence: 0 };
  }

  private advancedNLPMatching(description: string, amount?: number): CategoryPrediction {
    const words = description.split(/\s+/);
    let bestMatch = { category: 'miscellaneous', confidence: 0, reasoning: '' };

    for (const category of this.categories) {
      if (!category.keywords) continue;

      let score = 0;
      let matchedKeywords: string[] = [];

      for (const keyword of category.keywords) {
        const keywordLower = keyword.toLowerCase();
        
        if (words.some(word => word === keywordLower)) {
          score += 0.3;
          matchedKeywords.push(keyword);
        } else if (description.includes(keywordLower)) {
          score += 0.2;
          matchedKeywords.push(keyword);
        }
      }

      // Amount context boost
      if (amount) {
        score += this.getAmountContextBoost(category.id, amount);
      }

      if (score > bestMatch.confidence) {
        bestMatch = {
          category: category.id,
          confidence: Math.min(score, 0.9),
          reasoning: `Matched: ${matchedKeywords.slice(0, 3).join(', ')}`
        };
      }
    }

    return bestMatch;
  }

  private fuzzyMatching(description: string): CategoryPrediction {
    const variations = {
      'biryani': ['biriyani', 'biryani', 'biriani', 'briyani'],
      'grocery': ['groceries', 'grocer', 'kirana'],
      'petrol': ['patrol', 'petroll'],
      'electricity': ['electric', 'current', 'bijli'],
      'internet': ['wifi', 'broadband', 'net'],
      'mobile': ['phone', 'cell'],
      'restaurant': ['hotel', 'dhaba', 'eatery']
    };

    for (const [correct, variants] of Object.entries(variations)) {
      for (const variant of variants) {
        if (description.includes(variant)) {
          const prediction = this.advancedNLPMatching(correct);
          if (prediction.confidence > 0.5) {
            return {
              ...prediction,
              confidence: prediction.confidence * 0.8,
              reasoning: `Fuzzy match: "${variant}" → "${correct}"`
            };
          }
        }
      }
    }

    return { category: 'miscellaneous', confidence: 0 };
  }

  private getAmountContextBoost(categoryId: string, amount: number): number {
    const ranges = {
      food: { min: 20, max: 2000, optimal: [50, 500] },
      fuel: { min: 100, max: 5000, optimal: [300, 2000] },
      bills: { min: 200, max: 15000, optimal: [500, 3000] },
      rent: { min: 5000, max: 100000, optimal: [15000, 40000] },
      shopping: { min: 100, max: 50000, optimal: [500, 5000] },
      entertainment: { min: 99, max: 2000, optimal: [199, 999] }
    };

    const range = ranges[categoryId as keyof typeof ranges];
    if (!range) return 0;

    if (amount >= range.optimal[0] && amount <= range.optimal[1]) {
      return 0.15;
    } else if (amount >= range.min && amount <= range.max) {
      return 0.05;
    }
    return 0;
  }

  // Generate smart suggestions
  generateSmartSuggestions(description: string, currentAmount?: number): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    const cleanDescription = description.toLowerCase();

    // Amount suggestions
    if (!currentAmount || currentAmount === 0) {
      const amountSuggestion = this.suggestAmount(cleanDescription);
      if (amountSuggestion) {
        suggestions.push(amountSuggestion);
      }
    }

    // Recurring suggestions
    const recurringSuggestion = this.suggestRecurring(cleanDescription);
    if (recurringSuggestion) {
      suggestions.push(recurringSuggestion);
    }

    return suggestions;
  }

  private suggestAmount(description: string): SmartSuggestion | null {
    // Check user's historical spending first
    for (const [key, pattern] of this.userPatterns) {
      if (description.includes(key) && pattern.frequency >= 3) {
        return {
          type: 'amount',
          value: Math.round(pattern.averageAmount),
          confidence: 0.9,
          reasoning: `You typically spend ₹${pattern.averageAmount.toFixed(0)} on ${key}`
        };
      }
    }

    // Default amount suggestions
    const amountSuggestions = {
      'biryani': { amount: 250, confidence: 0.8 },
      'biriyani': { amount: 250, confidence: 0.8 },
      'pizza': { amount: 400, confidence: 0.8 },
      'coffee': { amount: 150, confidence: 0.7 },
      'petrol': { amount: 1000, confidence: 0.7 },
      'uber': { amount: 200, confidence: 0.8 },
      'auto': { amount: 80, confidence: 0.8 },
      'electricity': { amount: 2500, confidence: 0.7 },
      'internet': { amount: 800, confidence: 0.8 },
      'netflix': { amount: 199, confidence: 0.9 },
      'grocery': { amount: 1500, confidence: 0.6 }
    };

    for (const [keyword, suggestion] of Object.entries(amountSuggestions)) {
      if (description.includes(keyword)) {
        return {
          type: 'amount',
          value: suggestion.amount,
          confidence: suggestion.confidence,
          reasoning: `Typical amount for ${keyword} in India`
        };
      }
    }

    return null;
  }

  private suggestRecurring(description: string): SmartSuggestion | null {
    const recurringKeywords = [
      'rent', 'electricity', 'water', 'gas', 'internet', 'mobile', 'phone',
      'netflix', 'prime', 'spotify', 'gym', 'insurance', 'emi', 'sip',
      'maintenance', 'society', 'cable', 'broadband', 'subscription'
    ];

    const hasRecurringKeyword = recurringKeywords.some(keyword => 
      description.includes(keyword)
    );

    if (hasRecurringKeyword) {
      return {
        type: 'recurring',
        value: true,
        confidence: 0.8,
        reasoning: 'This appears to be a recurring expense'
      };
    }

    return null;
  }

  // Generate learning insights
  generateLearningInsights(description: string): any[] {
    const insights = [];
    const cleanDescription = description.toLowerCase();

    // Check if user has similar expenses
    for (const [key, pattern] of this.userPatterns) {
      if (cleanDescription.includes(key) && pattern.frequency >= 2) {
        insights.push({
          message: `You've spent on ${key} ${pattern.frequency} times, averaging ₹${pattern.averageAmount.toFixed(0)}`
        });
      }
    }

    // Check recent interactions
    const recentInteractions = this.userInteractions
      .filter(interaction => 
        interaction.description.toLowerCase().includes(cleanDescription) ||
        cleanDescription.includes(interaction.description.toLowerCase())
      )
      .slice(-3);

    if (recentInteractions.length > 0) {
      insights.push({
        message: `Similar to your recent expenses: ${recentInteractions.map(i => i.description).join(', ')}`
      });
    }

    return insights;
  }

  // Track user interactions for learning
  trackUserInteraction(description: string, type: string, value: any, accepted: boolean): void {
    const interaction: UserInteraction = {
      description: description.toLowerCase(),
      type,
      value,
      accepted,
      timestamp: new Date().toISOString()
    };

    this.userInteractions.push(interaction);

    // Keep only last 100 interactions
    if (this.userInteractions.length > 100) {
      this.userInteractions = this.userInteractions.slice(-100);
    }

    // Save to localStorage
    localStorage.setItem('aiUserInteractions', JSON.stringify(this.userInteractions));
  }

  // Learn from user's final choice
  learnFromUser(description: string, correctCategory: string, amount?: number): void {
    const cleanDescription = description.toLowerCase().trim();
    
    // Store exact match
    this.userLearningData.set(cleanDescription, correctCategory);
    
    // Update user patterns
    if (amount) {
      const pattern = this.userPatterns.get(cleanDescription) || {
        category: correctCategory,
        amounts: [],
        frequency: 0,
        lastUsed: new Date().toISOString(),
        averageAmount: 0
      };
      
      pattern.amounts.push(amount);
      pattern.frequency++;
      pattern.lastUsed = new Date().toISOString();
      pattern.averageAmount = pattern.amounts.reduce((sum, amt) => sum + amt, 0) / pattern.amounts.length;
      
      // Keep only last 10 amounts
      if (pattern.amounts.length > 10) {
        pattern.amounts = pattern.amounts.slice(-10);
        pattern.averageAmount = pattern.amounts.reduce((sum, amt) => sum + amt, 0) / pattern.amounts.length;
      }
      
      this.userPatterns.set(cleanDescription, pattern);
    }
    
    this.saveUserLearningData();
  }

  private saveUserLearningData(): void {
    const learningData = Object.fromEntries(this.userLearningData);
    const patternData = Object.fromEntries(
      Array.from(this.userPatterns.entries()).map(([key, pattern]) => [key, pattern])
    );
    
    localStorage.setItem('aiLearningData', JSON.stringify(learningData));
    localStorage.setItem('aiPatternData', JSON.stringify(patternData));
  }

  loadUserLearningData(): void {
    try {
      // Clear existing data first
      this.userLearningData.clear();
      this.userPatterns.clear();
      this.userInteractions = [];
      
      // Load fresh data from localStorage
      const learningData = JSON.parse(localStorage.getItem('aiLearningData') || '{}');
      const patternData = JSON.parse(localStorage.getItem('aiPatternData') || '{}');
      const interactionData = JSON.parse(localStorage.getItem('aiUserInteractions') || '[]');
      
      this.userLearningData = new Map(Object.entries(learningData));
      this.userPatterns = new Map(Object.entries(patternData));
      this.userInteractions = interactionData;
    } catch (error) {
      console.error('Error loading AI learning data:', error);
    }
  }

  // Method to reset all AI learning data
  resetLearningData(): void {
    console.log('🧠 AI: Resetting all learning data...');
    this.userLearningData.clear();
    this.userPatterns.clear();
    this.userInteractions = [];
    
    localStorage.removeItem('aiLearningData');
    localStorage.removeItem('aiPatternData');
    localStorage.removeItem('aiUserInteractions');
    console.log('✅ AI: Learning data reset completed');
  }

  // Enhanced insights generation
  generateInsights(expenses: any[]): AIInsight[] {
    const insights: AIInsight[] = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    if (monthlyExpenses.length === 0) return insights;

    const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Generate various insights
    const spendingVelocity = this.analyzeSpendingVelocity(monthlyExpenses);
    if (spendingVelocity) insights.push(spendingVelocity);

    const categoryInsight = this.analyzeCategoryDominance(monthlyExpenses, totalSpent);
    if (categoryInsight) insights.push(categoryInsight);

    const savingsOpportunity = this.identifySavingsOpportunity(monthlyExpenses);
    if (savingsOpportunity) insights.push(savingsOpportunity);

    return insights;
  }

  private analyzeSpendingVelocity(expenses: any[]): AIInsight | null {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const projectedMonthlySpend = (totalSpent / dayOfMonth) * daysInMonth;
    
    if (projectedMonthlySpend > totalSpent * 1.5) {
      return {
        id: 'spending-velocity',
        type: 'budget_alert',
        title: 'High Spending Velocity',
        description: `At current pace, you'll spend ₹${projectedMonthlySpend.toLocaleString()} this month.`,
        actionable: true,
        priority: 'high',
        createdAt: new Date().toISOString()
      };
    }
    
    return null;
  }

  private analyzeCategoryDominance(expenses: any[], totalSpent: number): AIInsight | null {
    const categorySpending = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
    if (topCategory && (topCategory[1] as number) > totalSpent * 0.4) {
      const percentage = Math.round(((topCategory[1] as number) / totalSpent) * 100);
      return {
        id: 'category-dominance',
        type: 'spending_pattern',
        title: 'Category Spending Alert',
        description: `${topCategory[0]} accounts for ${percentage}% of your spending.`,
        actionable: true,
        priority: 'medium',
        createdAt: new Date().toISOString()
      };
    }
    
    return null;
  }

  private identifySavingsOpportunity(expenses: any[]): AIInsight | null {
    const subscriptions = expenses.filter(expense => 
      expense.isRecurring && 
      ['entertainment', 'education'].includes(expense.category)
    );

    if (subscriptions.length > 3) {
      const totalSubscriptionCost = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
      return {
        id: 'savings-opportunity',
        type: 'category_suggestion',
        title: 'Subscription Optimization',
        description: `${subscriptions.length} subscriptions cost ₹${totalSubscriptionCost}/month.`,
        actionable: true,
        priority: 'medium',
        createdAt: new Date().toISOString()
      };
    }
    
    return null;
  }
}

export const aiService = new AIService();