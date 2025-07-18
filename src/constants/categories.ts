import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { 
    id: 'food', 
    name: 'Food & Dining', 
    icon: 'UtensilsCrossed', 
    color: '#10B981',
    keywords: [
      // Food delivery & restaurants
      'food', 'restaurant', 'cafe', 'hotel', 'dhaba', 'eatery', 'canteen', 'mess',
      'swiggy', 'zomato', 'dominos', 'kfc', 'mcdonalds', 'pizza hut', 'subway', 'burger king',
      'starbucks', 'cafe coffee day', 'barista', 'costa coffee', 'dunkin donuts',
      'haldirams', 'bikanervala', 'sagar ratna', 'saravana bhavan', 'udupi',
      
      // Food items
      'pizza', 'burger', 'biryani', 'biriyani', 'dal', 'rice', 'roti', 'paratha', 'naan',
      'curry', 'sabzi', 'samosa', 'dosa', 'idli', 'vada', 'uttapam', 'poha', 'upma',
      'chole', 'rajma', 'paneer', 'chicken', 'mutton', 'fish', 'egg', 'tandoori',
      'masala', 'gravy', 'fry', 'roast', 'kebab', 'tikka', 'korma', 'butter chicken',
      
      // Groceries & essentials
      'grocery', 'groceries', 'vegetables', 'fruits', 'milk', 'bread', 'eggs', 'butter',
      'oil', 'ghee', 'sugar', 'salt', 'spices', 'masala', 'atta', 'flour', 'pulses',
      'kirana', 'supermarket', 'big bazaar', 'reliance fresh', 'more', 'dmart',
      'spencer', 'easyday', 'star bazaar', 'hypercity', 'nature basket',
      
      // Beverages
      'tea', 'coffee', 'chai', 'lassi', 'juice', 'water', 'soda', 'cold drink',
      'beer', 'wine', 'whiskey', 'rum', 'vodka', 'alcohol', 'drinks',
      
      // Meals
      'breakfast', 'lunch', 'dinner', 'snacks', 'tiffin', 'meal', 'feast', 'party',
      'biscuits', 'chocolate', 'sweets', 'mithai', 'ice cream', 'cake', 'pastry'
    ],
    aiTrainingData: [
      'grocery shopping at dmart', 'swiggy food delivery', 'restaurant bill payment',
      'cafe coffee with friends', 'street food evening snacks', 'vegetables from market',
      'milk from dairy', 'bakery items purchase', 'biryani from local restaurant',
      'pizza order from dominos', 'breakfast at hotel', 'lunch at office canteen'
    ]
  },
  { 
    id: 'fuel', 
    name: 'Fuel & Transport', 
    icon: 'Car', 
    color: '#F59E0B',
    keywords: [
      // Fuel
      'petrol', 'diesel', 'fuel', 'gas', 'cng', 'lpg', 'patrol', 'petroll',
      'indian oil', 'bharat petroleum', 'hindustan petroleum', 'reliance petrol',
      'shell', 'essar', 'hp petrol', 'iocl', 'bpcl', 'hpcl',
      
      // Ride sharing & taxis
      'uber', 'ola', 'rapido', 'auto', 'taxi', 'cab', 'rickshaw', 'auto rickshaw',
      'meru', 'mega cabs', 'tab cab', 'quick ride', 'bla bla car',
      
      // Public transport
      'bus', 'train', 'metro', 'local', 'irctc', 'railway', 'bmtc', 'best',
      'dtc', 'ksrtc', 'msrtc', 'tsrtc', 'apsrtc', 'redbus', 'abhibus',
      'metro card', 'smart card', 'travel card', 'season ticket',
      
      // Travel booking
      'makemytrip', 'goibibo', 'cleartrip', 'yatra', 'ixigo', 'paytm travel',
      'booking', 'flight', 'hotel booking', 'train booking', 'bus booking',
      
      // Vehicle maintenance
      'service', 'repair', 'maintenance', 'garage', 'mechanic', 'spare parts',
      'tyre', 'battery', 'oil change', 'washing', 'parking', 'toll', 'challan',
      'insurance', 'rc', 'puc', 'registration', 'license', 'permit'
    ],
    aiTrainingData: [
      'petrol pump fill up', 'uber ride to office', 'auto rickshaw fare',
      'bus ticket booking', 'train reservation irctc', 'metro card recharge',
      'parking fee payment', 'toll plaza charges', 'bike service cost',
      'car maintenance expense', 'flight booking makemytrip'
    ]
  },
  { 
    id: 'bills', 
    name: 'Bills & Utilities', 
    icon: 'Receipt', 
    color: '#3B82F6',
    keywords: [
      // Electricity
      'electricity', 'electric', 'current', 'bijli', 'power', 'eb bill',
      'tata power', 'adani electricity', 'bescom', 'mseb', 'kseb', 'tneb',
      'pseb', 'jseb', 'wbsedcl', 'apdcl', 'dhbvn', 'uhbvn',
      
      // Water & Gas
      'water', 'water bill', 'bwssb', 'mcgm', 'dwb', 'phed', 'gas', 'gas bill',
      'lpg', 'cylinder', 'indane', 'hp gas', 'bharat gas', 'piped gas',
      
      // Internet & Telecom
      'internet', 'wifi', 'broadband', 'fiber', 'net', 'connection',
      'airtel', 'jio', 'vodafone', 'vi', 'bsnl', 'idea', 'reliance',
      'act fibernet', 'hathway', 'tikona', 'you broadband', 'spectranet',
      'mobile', 'phone', 'recharge', 'postpaid', 'prepaid', 'plan',
      'data', 'talk time', 'sms', 'roaming', 'international',
      
      // DTH & Cable
      'dth', 'cable', 'tv', 'tata sky', 'dish tv', 'videocon', 'sun direct',
      'airtel digital tv', 'den networks', 'hathway cable',
      
      // Maintenance & Society
      'maintenance', 'society', 'apartment', 'housing', 'association',
      'common area', 'lift', 'generator', 'security', 'cleaning',
      'water tank', 'bore well', 'pump', 'gardening',
      
      // General bills
      'bill', 'utility', 'payment', 'due', 'invoice', 'receipt', 'charges'
    ],
    aiTrainingData: [
      'electricity bill payment', 'water bill quarterly', 'internet bill airtel',
      'mobile recharge jio', 'society maintenance charges', 'gas cylinder booking',
      'dth recharge tata sky', 'broadband bill payment', 'postpaid bill vodafone'
    ]
  },
  { 
    id: 'kids', 
    name: 'Kids & Family', 
    icon: 'Baby', 
    color: '#EC4899',
    keywords: [
      // Children
      'kids', 'children', 'child', 'baby', 'infant', 'toddler', 'son', 'daughter',
      
      // Education
      'school', 'fees', 'tuition', 'coaching', 'classes', 'teacher', 'education',
      'admission', 'books', 'uniform', 'bag', 'stationery', 'notebook', 'pen',
      'pencil', 'exam', 'test', 'project', 'homework', 'study material',
      'cbse', 'icse', 'state board', 'nursery', 'kindergarten', 'primary',
      'secondary', 'higher secondary', 'college', 'university',
      
      // Baby care
      'diapers', 'pampers', 'huggies', 'baby food', 'formula', 'cerelac',
      'milk powder', 'baby oil', 'baby soap', 'baby shampoo', 'baby cream',
      'baby clothes', 'baby toys', 'pram', 'stroller', 'car seat',
      
      // Healthcare
      'vaccination', 'vaccine', 'doctor', 'pediatrician', 'checkup',
      'medicines', 'syrup', 'tablets', 'hospital', 'clinic',
      
      // Toys & Entertainment
      'toys', 'games', 'puzzle', 'doll', 'car toy', 'lego', 'blocks',
      'cricket bat', 'football', 'bicycle', 'tricycle', 'swing',
      'playground', 'park', 'zoo', 'museum', 'movie', 'cartoon',
      
      // Activities
      'swimming', 'dance', 'music', 'piano', 'guitar', 'drawing',
      'painting', 'craft', 'art', 'sports', 'karate', 'chess'
    ],
    aiTrainingData: [
      'school fees payment', 'baby diapers purchase', 'kids toys shopping',
      'tuition fees monthly', 'vaccination at clinic', 'children books buying',
      'school uniform stitching', 'baby food cerelac', 'kids birthday party'
    ]
  },
  { 
    id: 'rent', 
    name: 'Rent & Housing', 
    icon: 'Home', 
    color: '#8B5CF6',
    keywords: [
      // Rent
      'rent', 'house rent', 'flat rent', 'apartment rent', 'room rent',
      'pg', 'paying guest', 'hostel', 'accommodation', 'stay',
      
      // Housing costs
      'deposit', 'security deposit', 'advance', 'brokerage', 'commission',
      'agreement', 'registration', 'stamp duty', 'lawyer', 'legal',
      
      // Loans & EMI
      'home loan', 'housing loan', 'emi', 'equated monthly installment',
      'sbi', 'hdfc', 'icici', 'axis', 'kotak', 'pnb', 'bob', 'canara',
      'lic housing', 'bajaj finserv', 'tata capital', 'mahindra finance',
      
      // Property related
      'property', 'real estate', 'builder', 'construction', 'flat',
      'villa', 'bungalow', '1bhk', '2bhk', '3bhk', '4bhk', 'studio',
      'duplex', 'penthouse', 'independent house',
      
      // Utilities included in housing
      'housing society', 'gated community', 'township', 'complex',
      'maintenance included', 'furnished', 'semi furnished', 'unfurnished'
    ],
    aiTrainingData: [
      'monthly house rent', 'flat rent payment', 'pg accommodation fees',
      'home loan emi payment', 'security deposit for flat', 'brokerage charges',
      'hostel fees payment', 'society maintenance rent'
    ]
  },
  { 
    id: 'entertainment', 
    name: 'Entertainment', 
    icon: 'Tv', 
    color: '#EF4444',
    keywords: [
      // Streaming services
      'netflix', 'amazon prime', 'prime video', 'hotstar', 'disney hotstar',
      'zee5', 'sony liv', 'voot', 'alt balaji', 'mx player', 'jio cinema',
      'eros now', 'hungama', 'youtube premium', 'youtube music',
      
      // Music streaming
      'spotify', 'gaana', 'jiosaavn', 'wynk', 'amazon music', 'apple music',
      'hungama music', 'saregama', 'music', 'songs', 'playlist',
      
      // Movies & Cinema
      'movie', 'cinema', 'theatre', 'multiplex', 'pvr', 'inox', 'cinepolis',
      'carnival', 'fun cinemas', 'wave cinemas', 'ticket', 'booking',
      'bookmyshow', 'paytm movies', '3d', 'imax', 'recliner',
      
      // Gaming
      'game', 'gaming', 'playstation', 'xbox', 'nintendo', 'steam',
      'pubg', 'free fire', 'cod', 'fifa', 'pes', 'fortnite', 'among us',
      'mobile game', 'pc game', 'console', 'controller', 'headset',
      
      // Events & Shows
      'concert', 'show', 'event', 'comedy', 'stand up', 'play', 'drama',
      'dance', 'music concert', 'festival', 'exhibition', 'fair',
      'amusement park', 'water park', 'adventure', 'theme park',
      
      // Sports & Recreation
      'cricket', 'football', 'tennis', 'badminton', 'swimming', 'gym',
      'fitness', 'yoga', 'zumba', 'sports', 'match', 'tournament',
      'club', 'membership', 'subscription', 'entertainment'
    ],
    aiTrainingData: [
      'netflix monthly subscription', 'movie ticket booking pvr', 'spotify premium plan',
      'amazon prime yearly', 'concert ticket purchase', 'gaming subscription',
      'youtube premium family', 'bookmyshow movie booking', 'hotstar vip plan'
    ]
  },
  { 
    id: 'education', 
    name: 'Education', 
    icon: 'GraduationCap', 
    color: '#06B6D4',
    keywords: [
      // Online learning
      'education', 'course', 'training', 'certification', 'learning',
      'udemy', 'coursera', 'edx', 'khan academy', 'skillshare', 'pluralsight',
      'linkedin learning', 'masterclass', 'unacademy', 'byjus', 'vedantu',
      'whitehat jr', 'toppr', 'doubtnut', 'embibe', 'meritnation',
      
      // Books & Materials
      'books', 'ebook', 'kindle', 'textbook', 'reference', 'guide',
      'study material', 'notes', 'question bank', 'previous papers',
      'amazon books', 'flipkart books', 'sapna book house',
      
      // Exams & Tests
      'exam', 'test', 'entrance', 'competitive', 'jee', 'neet', 'cat',
      'gate', 'upsc', 'ssc', 'bank exam', 'railway exam', 'ielts',
      'toefl', 'gre', 'gmat', 'sat', 'application fee', 'form fee',
      
      // Professional development
      'workshop', 'seminar', 'conference', 'webinar', 'bootcamp',
      'coding', 'programming', 'data science', 'machine learning',
      'digital marketing', 'graphic design', 'photography',
      
      // Language learning
      'language', 'english', 'hindi', 'spanish', 'french', 'german',
      'duolingo', 'babbel', 'rosetta stone', 'speaking', 'grammar',
      
      // Institutional fees
      'college', 'university', 'institute', 'academy', 'school',
      'fees', 'tuition', 'admission', 'semester', 'annual'
    ],
    aiTrainingData: [
      'udemy course purchase', 'coursera specialization', 'books from amazon',
      'exam application fee', 'online certification program', 'coaching classes fees',
      'educational app subscription', 'study material purchase', 'workshop registration'
    ]
  },
  { 
    id: 'health', 
    name: 'Health & Medical', 
    icon: 'Heart', 
    color: '#F97316',
    keywords: [
      // Hospitals & Clinics
      'doctor', 'hospital', 'clinic', 'medical', 'health', 'healthcare',
      'apollo', 'fortis', 'max healthcare', 'manipal', 'narayana health',
      'aiims', 'pgimer', 'christian medical college', 'tata memorial',
      'consultation', 'checkup', 'visit', 'appointment', 'opd',
      
      // Specialists
      'cardiologist', 'neurologist', 'orthopedic', 'gynecologist',
      'pediatrician', 'dermatologist', 'ophthalmologist', 'ent',
      'psychiatrist', 'dentist', 'dental', 'orthodontist',
      
      // Pharmacy & Medicines
      'medicine', 'pharmacy', 'medical store', 'chemist', 'drugs',
      'apollo pharmacy', 'medplus', 'netmeds', '1mg', 'pharmeasy',
      'tablets', 'capsules', 'syrup', 'injection', 'drops',
      'antibiotics', 'painkiller', 'vitamin', 'supplement',
      
      // Tests & Diagnostics
      'test', 'lab', 'pathology', 'blood test', 'urine test', 'x-ray',
      'mri', 'ct scan', 'ultrasound', 'ecg', 'echo', 'endoscopy',
      'dr lal pathlabs', 'srl diagnostics', 'metropolis', 'thyrocare',
      
      // Treatments & Procedures
      'treatment', 'therapy', 'physiotherapy', 'surgery', 'operation',
      'procedure', 'vaccination', 'immunization', 'injection',
      'dialysis', 'chemotherapy', 'radiation', 'laser',
      
      // Insurance & Health plans
      'health insurance', 'medical insurance', 'mediclaim',
      'cashless', 'reimbursement', 'claim', 'premium',
      
      // Wellness & Fitness
      'gym', 'fitness', 'yoga', 'meditation', 'spa', 'massage',
      'wellness', 'health checkup', 'master health checkup'
    ],
    aiTrainingData: [
      'doctor consultation fee', 'medicine purchase apollo pharmacy',
      'blood test at lab', 'dental treatment cost', 'health checkup package',
      'physiotherapy session', 'vaccination charges', 'medical insurance premium',
      'hospital admission bill', 'eye checkup ophthalmologist'
    ]
  },
  { 
    id: 'shopping', 
    name: 'Shopping', 
    icon: 'ShoppingBag', 
    color: '#84CC16',
    keywords: [
      // E-commerce platforms
      'shopping', 'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa',
      'jabong', 'snapdeal', 'paytm mall', 'shopclues', 'tata cliq',
      'reliance digital', 'croma', 'vijay sales', 'ezone',
      
      // Clothing & Fashion
      'clothes', 'dress', 'shirt', 'pant', 'jeans', 'top', 'kurti',
      'saree', 'lehenga', 'suit', 'jacket', 'coat', 'sweater',
      'underwear', 'innerwear', 'bra', 'panty', 'socks', 'tie',
      'belt', 'wallet', 'purse', 'handbag', 'backpack',
      
      // Footwear
      'shoes', 'sandals', 'slippers', 'boots', 'sneakers', 'heels',
      'formal shoes', 'sports shoes', 'running shoes', 'chappal',
      'nike', 'adidas', 'puma', 'reebok', 'bata', 'liberty',
      
      // Electronics
      'mobile', 'phone', 'smartphone', 'iphone', 'samsung', 'oneplus',
      'xiaomi', 'oppo', 'vivo', 'realme', 'laptop', 'computer',
      'tablet', 'ipad', 'headphones', 'earphones', 'speaker',
      'tv', 'television', 'led', 'smart tv', 'refrigerator',
      'washing machine', 'ac', 'air conditioner', 'microwave',
      
      // Home & Kitchen
      'home', 'kitchen', 'utensils', 'cookware', 'pressure cooker',
      'mixer', 'grinder', 'blender', 'toaster', 'kettle', 'iron',
      'vacuum cleaner', 'furniture', 'sofa', 'bed', 'mattress',
      'curtains', 'bedsheet', 'pillow', 'blanket', 'towel',
      
      // Beauty & Personal care
      'cosmetics', 'makeup', 'lipstick', 'foundation', 'mascara',
      'perfume', 'deodorant', 'shampoo', 'conditioner', 'soap',
      'face wash', 'moisturizer', 'sunscreen', 'cream', 'lotion',
      
      // Accessories & Jewelry
      'watch', 'jewelry', 'gold', 'silver', 'diamond', 'ring',
      'necklace', 'earrings', 'bracelet', 'chain', 'pendant',
      'sunglasses', 'glasses', 'spectacles', 'contact lens',
      
      // Books & Stationery
      'books', 'novel', 'magazine', 'newspaper', 'pen', 'pencil',
      'notebook', 'diary', 'calendar', 'stationery', 'office supplies',
      
      // Gifts & Occasions
      'gift', 'birthday', 'anniversary', 'wedding', 'festival',
      'diwali', 'christmas', 'valentine', 'mothers day', 'fathers day'
    ],
    aiTrainingData: [
      'amazon shopping order', 'flipkart mobile purchase', 'myntra clothes shopping',
      'shoes buying from store', 'laptop purchase online', 'grocery shopping mall',
      'cosmetics from nykaa', 'electronics from croma', 'furniture shopping',
      'gift purchase for birthday', 'watch buying', 'jewelry shopping'
    ]
  },
  { 
    id: 'personal_care', 
    name: 'Personal Care', 
    icon: 'Scissors', 
    color: '#A855F7',
    keywords: [
      // Salon & Beauty services
      'salon', 'beauty parlour', 'parlour', 'spa', 'beauty salon',
      'haircut', 'hair cut', 'hair style', 'hair color', 'hair treatment',
      'facial', 'cleanup', 'bleach', 'waxing', 'threading', 'eyebrow',
      'manicure', 'pedicure', 'nail art', 'nail polish', 'massage',
      
      // Men's grooming
      'barber', 'shave', 'beard', 'mustache', 'trimming', 'grooming',
      'hair wash', 'head massage', 'beard oil', 'aftershave',
      
      // Beauty treatments
      'beauty', 'skincare', 'skin care', 'anti aging', 'wrinkle',
      'acne treatment', 'pigmentation', 'tan removal', 'skin whitening',
      'laser treatment', 'botox', 'filler', 'chemical peel',
      
      // Personal hygiene products
      'shampoo', 'conditioner', 'hair oil', 'soap', 'body wash',
      'face wash', 'scrub', 'moisturizer', 'lotion', 'cream',
      'sunscreen', 'deodorant', 'perfume', 'cologne', 'talcum powder',
      'toothpaste', 'toothbrush', 'mouthwash', 'dental floss',
      
      // Cosmetics
      'makeup', 'cosmetics', 'foundation', 'concealer', 'powder',
      'blush', 'highlighter', 'contour', 'eyeshadow', 'eyeliner',
      'mascara', 'lipstick', 'lip gloss', 'lip balm', 'nail polish',
      
      // Hair care
      'hair', 'hair care', 'hair mask', 'hair serum', 'hair gel',
      'hair spray', 'hair cream', 'dandruff', 'hair fall', 'baldness',
      
      // Personal accessories
      'razor', 'blade', 'shaving cream', 'shaving gel', 'trimmer',
      'hair dryer', 'straightener', 'curler', 'brush', 'comb',
      'mirror', 'tweezers', 'nail cutter', 'scissors'
    ],
    aiTrainingData: [
      'salon haircut and styling', 'facial at beauty parlour', 'spa massage session',
      'cosmetics shopping spree', 'skincare products purchase', 'grooming kit buying',
      'barber shop visit', 'beauty treatment package', 'personal care items',
      'makeup products shopping', 'hair care treatment', 'nail art session'
    ]
  },
  { 
    id: 'investments', 
    name: 'Investments & Savings', 
    icon: 'TrendingUp', 
    color: '#059669',
    keywords: [
      // Mutual funds & SIP
      'investment', 'invest', 'mutual fund', 'mf', 'sip', 'systematic investment',
      'equity', 'debt', 'hybrid', 'elss', 'tax saving', 'large cap',
      'mid cap', 'small cap', 'index fund', 'etf', 'nav', 'aum',
      'zerodha', 'groww', 'paytm money', 'kuvera', 'coin', 'et money',
      
      // Fixed deposits & Savings
      'fd', 'fixed deposit', 'rd', 'recurring deposit', 'savings',
      'bank deposit', 'term deposit', 'cumulative', 'non cumulative',
      'interest', 'maturity', 'principal', 'compound interest',
      
      // Stocks & Trading
      'stocks', 'shares', 'equity', 'trading', 'demat', 'broker',
      'brokerage', 'nse', 'bse', 'sensex', 'nifty', 'ipo', 'dividend',
      'capital gains', 'portfolio', 'upstox', 'angel broking',
      '5paisa', 'iifl', 'kotak securities', 'hdfc securities',
      
      // Gold & Commodities
      'gold', 'silver', 'digital gold', 'gold etf', 'sovereign gold bond',
      'sgb', 'commodity', 'precious metals', 'jewelry investment',
      
      // Insurance & Pension
      'insurance', 'life insurance', 'term insurance', 'endowment',
      'ulip', 'money back', 'pension', 'annuity', 'retirement',
      'ppf', 'public provident fund', 'epf', 'provident fund',
      'nps', 'national pension scheme', 'atal pension yojana',
      
      // Tax saving instruments
      'tax saving', '80c', 'elss', 'ppf', 'nsc', 'national savings certificate',
      'tax benefit', 'deduction', 'exemption', 'rebate',
      
      // Real estate
      'real estate', 'property', 'reit', 'land', 'plot', 'apartment',
      'commercial property', 'residential property', 'rental income',
      
      // Crypto & Digital assets
      'crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 'digital currency',
      'blockchain', 'wazirx', 'coinbase', 'binance', 'coindcx'
    ],
    aiTrainingData: [
      'mutual fund sip payment', 'fixed deposit investment', 'stock purchase zerodha',
      'gold etf investment', 'insurance premium payment', 'ppf contribution',
      'nps monthly contribution', 'real estate investment', 'crypto purchase',
      'tax saving investment', 'retirement planning', 'portfolio rebalancing'
    ]
  },
  { 
    id: 'miscellaneous', 
    name: 'Others', 
    icon: 'MoreHorizontal', 
    color: '#6B7280',
    keywords: [
      'other', 'miscellaneous', 'misc', 'general', 'various', 'different',
      'random', 'unknown', 'uncategorized', 'others', 'mixed', 'sundry',
      'cash', 'withdrawal', 'atm', 'bank charges', 'service charges',
      'penalty', 'fine', 'late fee', 'processing fee', 'convenience fee',
      'donation', 'charity', 'temple', 'church', 'mosque', 'gurudwara',
      'religious', 'festival', 'celebration', 'party', 'event',
      'emergency', 'urgent', 'unexpected', 'repair', 'maintenance'
    ],
    aiTrainingData: [
      'miscellaneous expense', 'other charges', 'general expense',
      'various items purchase', 'cash withdrawal', 'bank service charges',
      'donation to charity', 'emergency expense', 'unexpected cost'
    ]
  }
];

export const CATEGORY_SUGGESTIONS: Record<string, string> = {
  // Food related - expanded
  'grocery': 'food', 'groceries': 'food', 'kirana': 'food', 'supermarket': 'food',
  'restaurant': 'food', 'hotel': 'food', 'dhaba': 'food', 'eatery': 'food',
  'swiggy': 'food', 'zomato': 'food', 'dominos': 'food', 'pizza': 'food',
  'kfc': 'food', 'mcdonalds': 'food', 'burger king': 'food', 'subway': 'food',
  'biryani': 'food', 'biriyani': 'food', 'dal': 'food', 'rice': 'food',
  'cafe': 'food', 'coffee': 'food', 'tea': 'food', 'chai': 'food',
  'breakfast': 'food', 'lunch': 'food', 'dinner': 'food', 'snacks': 'food',
  'milk': 'food', 'vegetables': 'food', 'fruits': 'food', 'bread': 'food',
  'haldirams': 'food', 'bikanervala': 'food', 'starbucks': 'food',
  
  // Transport related - expanded
  'petrol': 'fuel', 'diesel': 'fuel', 'fuel': 'fuel', 'gas': 'fuel',
  'uber': 'fuel', 'ola': 'fuel', 'rapido': 'fuel', 'auto': 'fuel',
  'taxi': 'fuel', 'cab': 'fuel', 'rickshaw': 'fuel', 'bus': 'fuel',
  'train': 'fuel', 'metro': 'fuel', 'irctc': 'fuel', 'redbus': 'fuel',
  'parking': 'fuel', 'toll': 'fuel', 'makemytrip': 'fuel', 'goibibo': 'fuel',
  
  // Bills related - expanded
  'electricity': 'bills', 'electric': 'bills', 'current': 'bills', 'bijli': 'bills',
  'water': 'bills', 'internet': 'bills', 'wifi': 'bills', 'broadband': 'bills',
  'mobile': 'bills', 'phone': 'bills', 'recharge': 'bills', 'airtel': 'bills',
  'jio': 'bills', 'vodafone': 'bills', 'bsnl': 'bills', 'idea': 'bills',
  'maintenance': 'bills', 'society': 'bills', 'dth': 'bills', 'cable': 'bills',
  
  // Entertainment - expanded
  'netflix': 'entertainment', 'amazon prime': 'entertainment', 'prime video': 'entertainment',
  'hotstar': 'entertainment', 'zee5': 'entertainment', 'sony liv': 'entertainment',
  'spotify': 'entertainment', 'gaana': 'entertainment', 'jiosaavn': 'entertainment',
  'movie': 'entertainment', 'cinema': 'entertainment', 'pvr': 'entertainment',
  'inox': 'entertainment', 'bookmyshow': 'entertainment', 'game': 'entertainment',
  
  // Health - expanded
  'doctor': 'health', 'hospital': 'health', 'clinic': 'health', 'medical': 'health',
  'medicine': 'health', 'pharmacy': 'health', 'apollo': 'health', 'fortis': 'health',
  'medplus': 'health', '1mg': 'health', 'netmeds': 'health', 'test': 'health',
  'checkup': 'health', 'vaccination': 'health', 'dental': 'health',
  
  // Shopping - expanded
  'amazon': 'shopping', 'flipkart': 'shopping', 'myntra': 'shopping',
  'ajio': 'shopping', 'nykaa': 'shopping', 'snapdeal': 'shopping',
  'clothes': 'shopping', 'dress': 'shopping', 'shirt': 'shopping',
  'shoes': 'shopping', 'mobile': 'shopping', 'laptop': 'shopping',
  'electronics': 'shopping', 'cosmetics': 'shopping', 'makeup': 'shopping',
  
  // Education - expanded
  'course': 'education', 'udemy': 'education', 'coursera': 'education',
  'byjus': 'education', 'unacademy': 'education', 'books': 'education',
  'fees': 'education', 'tuition': 'education', 'coaching': 'education',
  'exam': 'education', 'certification': 'education', 'training': 'education',
  
  // Personal care - expanded
  'salon': 'personal_care', 'haircut': 'personal_care', 'spa': 'personal_care',
  'beauty': 'personal_care', 'parlour': 'personal_care', 'facial': 'personal_care',
  'massage': 'personal_care', 'grooming': 'personal_care', 'barber': 'personal_care',
  
  // Investment - expanded
  'sip': 'investments', 'mutual fund': 'investments', 'mf': 'investments',
  'stocks': 'investments', 'shares': 'investments', 'fd': 'investments',
  'fixed deposit': 'investments', 'insurance': 'investments', 'ppf': 'investments',
  'investment': 'investments', 'zerodha': 'investments', 'groww': 'investments',
  
  // Kids - expanded
  'school': 'kids', 'baby': 'kids', 'children': 'kids', 'kids': 'kids',
  'diapers': 'kids', 'toys': 'kids', 'vaccination': 'kids', 'uniform': 'kids',
  
  // Rent - expanded
  'rent': 'rent', 'house rent': 'rent', 'flat rent': 'rent', 'pg': 'rent',
  'hostel': 'rent', 'home loan': 'rent', 'emi': 'rent', 'housing': 'rent'
};