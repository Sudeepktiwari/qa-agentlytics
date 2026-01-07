export const PRICING = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    amount: 0,
    cadence: "",
    totalLeads: 20,
    creditsPerMonth: 500,
    websites: 1,
    razorpayPlanId: null,
  },
  growth: {
    id: "growth",
    name: "Growth",
    price: "$49",
    amount: 49,
    cadence: "month",
    totalLeads: 25_000,
    creditsPerMonth: 7_000,
    websites: 1,
    razorpayPlanId: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_GROWTH,
  },
  scale: {
    id: "scale",
    name: "Scale",
    price: "$99",
    amount: 99,
    cadence: "month",
    totalLeads: 100_000,
    creditsPerMonth: 16_000,
    websites: 3,
    razorpayPlanId: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE,
  },
} as const;

export const CREDIT_ADDONS = {
  // We can define steps for the slider. 
  // Each step maps to a Razorpay Add-on Item ID (or plan ID if structured differently).
  // For simplicity, we assume we create a single "1,000 Credits Add-on" item in Razorpay 
  // and just change the quantity.
  // 1 unit = 1,000 credits = $5 (example)
  
  UNIT_CREDITS: 1000,
  UNIT_PRICE_USD: 5, // $5 per 1k credits
  MAX_AMOUNT_USD: 300,
  
  // If using specific plan IDs for different tiers (optional, but quantity is easier)
  // For this implementation, we will use quantity of a single "base" add-on item.
  RAZORPAY_ADDON_ITEM_ID: process.env.NEXT_PUBLIC_RAZORPAY_ADDON_CREDITS_ID
} as const;
