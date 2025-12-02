export type Prediction = {
  id: string;
  slug: string;
  title: string;
  country: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  liquidity: "Low" | "Medium" | "High";
  volume: number;
  expiry: string;
  marketDescription: string;
  timeline: string;
  source?: string;
  sentiment: number;
};

export const predictions: Prediction[] = [
  {
    id: "worldcup-africa-round16",
    slug: "worldcup-africa-round16",
    title: "Will an African team reach the World Cup Round of 16?",
    country: "Africa",
    category: "Sports",
    yesPrice: 0.63,
    noPrice: 0.37,
    liquidity: "High",
    volume: 420000,
    expiry: "2026-07-01",
    marketDescription:
      "Traders are pricing whether any African national team will advance to the Round of 16 at the next FIFA World Cup.",
    timeline: "Tournament concludes July 2026.",
    source: "https://www.fifa.com",
    sentiment: 62,
  },
  {
    id: "uae-visa-nigeria-2025",
    slug: "uae-visa-nigeria-2025",
    title: "Will UAE lift visa restrictions for Nigerians in 2025?",
    country: "Nigeria",
    category: "Politics",
    yesPrice: 0.48,
    noPrice: 0.52,
    liquidity: "Medium",
    volume: 210000,
    expiry: "2025-12-31",
    marketDescription:
      "Tracks diplomatic negotiations between the UAE and Nigeria focused on easing travel restrictions.",
    timeline: "Decision expected after bilateral summit in Q4 2025.",
    source: "https://www.reuters.com",
    sentiment: 45,
  },
  {
    id: "big-brother-africa-winner",
    slug: "big-brother-africa-winner",
    title: "Who will win Big Brother Africa?",
    country: "Africa",
    category: "Entertainment",
    yesPrice: 0.35,
    noPrice: 0.65,
    liquidity: "Medium",
    volume: 95000,
    expiry: "2025-09-10",
    marketDescription:
      "Entertainment desk is tracking buzz, social shares, and regional auditions to spot the likely winner.",
    timeline: "Live finale scheduled for September 2025.",
    sentiment: 32,
  },
  {
    id: "ghana-ruling-party-2025",
    slug: "ghana-ruling-party-2025",
    title: "Will Ghana experience a change of ruling party in 2025?",
    country: "Ghana",
    category: "Politics",
    yesPrice: 0.41,
    noPrice: 0.59,
    liquidity: "High",
    volume: 310000,
    expiry: "2025-12-31",
    marketDescription:
      "Measures whether opposition alliances can unseat the current ruling party after national elections.",
    timeline: "General election window closes December 2025.",
    sentiment: 40,
  },
  {
    id: "kenya-crypto-tax-2026",
    slug: "kenya-crypto-tax-2026",
    title: "Will Kenya introduce crypto tax in 2026?",
    country: "Kenya",
    category: "Crypto",
    yesPrice: 0.57,
    noPrice: 0.43,
    liquidity: "Medium",
    volume: 180000,
    expiry: "2026-12-31",
    marketDescription:
      "Forex and treasury desks monitor Kenya's Finance Bill discussions on digital asset taxation.",
    timeline: "Budget vote expected in Q2 2026.",
    sentiment: 55,
  },
  {
    id: "south-africa-rate-cut-q3",
    slug: "south-africa-rate-cut-q3",
    title: "Will South Africa’s interest rate decrease before Q3?",
    country: "South Africa",
    category: "Business",
    yesPrice: 0.33,
    noPrice: 0.67,
    liquidity: "High",
    volume: 265000,
    expiry: "2025-09-30",
    marketDescription:
      "Tracks monetary policy expectations for the South African Reserve Bank before the third quarter decision.",
    timeline: "Monetary Policy Committee meets June 2025.",
    sentiment: 28,
  },
  {
    id: "mtn-outperform-safaricom",
    slug: "mtn-outperform-safaricom",
    title: "Will MTN surpass Safaricom in stock performance by year-end?",
    country: "Africa",
    category: "Business",
    yesPrice: 0.46,
    noPrice: 0.54,
    liquidity: "Medium",
    volume: 132000,
    expiry: "2025-12-31",
    marketDescription:
      "Equity traders compare MTN Group to Safaricom performance on respective home exchanges.",
    timeline: "Performance benchmarked on December 31, 2025.",
    sentiment: 49,
  },
  {
    id: "davido-album-2025",
    slug: "davido-album-2025",
    title: "Will Davido release an album before December?",
    country: "Nigeria",
    category: "Entertainment",
    yesPrice: 0.71,
    noPrice: 0.29,
    liquidity: "High",
    volume: 154000,
    expiry: "2025-12-01",
    marketDescription:
      "Entertainment insiders monitor studio sessions and label schedules for Davido's next release.",
    timeline: "Album drop must occur before December 1, 2025.",
    sentiment: 70,
  },
  {
    id: "zambia-imf-second-tranche",
    slug: "zambia-imf-second-tranche",
    title: "Will Zambia secure IMF second tranche?",
    country: "Zambia",
    category: "Business",
    yesPrice: 0.52,
    noPrice: 0.48,
    liquidity: "Medium",
    volume: 98000,
    expiry: "2025-11-15",
    marketDescription:
      "Tracks fiscal reforms and debt restructuring progress tied to the IMF program.",
    timeline: "Program review scheduled November 2025.",
    sentiment: 51,
  },
  {
    id: "ethiopia-peace-2025",
    slug: "ethiopia-peace-2025",
    title: "Will Ethiopia reach peace agreement in 2025?",
    country: "Ethiopia",
    category: "Politics",
    yesPrice: 0.37,
    noPrice: 0.63,
    liquidity: "Low",
    volume: 76000,
    expiry: "2025-12-31",
    marketDescription:
      "Monitors AU and IGAD mediation status for a comprehensive peace deal within Ethiopia.",
    timeline: "Talks expected to reconvene mid-2025.",
    sentiment: 33,
  },
];

export const countries = [
  "Nigeria",
  "South Africa",
  "Kenya",
  "Ghana",
  "Zambia",
  "Egypt",
  "Morocco",
  "Uganda",
  "Tanzania",
  "Ethiopia",
  "Africa",
] as const;

export const categories = [
  "Politics",
  "Civics",
  "Sports",
  "Culture",
] as const;

