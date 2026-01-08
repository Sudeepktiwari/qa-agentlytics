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
    addons: {
      credits: {
        price: 0,
        amount: 0,
        maxPrice: 0,
        razorpayItemId: null,
      },
      leads: {
        price: 0,
        amount: 0,
        maxPrice: 0,
        razorpayItemId: null,
      },
    },
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
    addons: {
      credits: {
        price: 50,
        amount: 7000,
        maxPrice: 150,
        razorpayItemId: process.env.NEXT_PUBLIC_RAZORPAY_ADDON_CREDITS_ID, // Reusing existing ID for Growth
      },
      leads: {
        price: 0, // No lead add-ons for Growth
        amount: 0,
        maxPrice: 0,
        razorpayItemId: null,
      },
    },
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
    addons: {
      credits: {
        price: 100,
        amount: 16000,
        maxPrice: 300,
        razorpayItemId:
          process.env.NEXT_PUBLIC_RAZORPAY_ADDON_CREDITS_SCALE_ID ||
          process.env.NEXT_PUBLIC_RAZORPAY_ADDON_CREDITS_ID, // Fallback if not set
      },
      leads: {
        price: 100,
        amount: 100000,
        maxPrice: 300,
        razorpayItemId:
          process.env.NEXT_PUBLIC_RAZORPAY_ADDON_LEADS_SCALE_ID ||
          process.env.NEXT_PUBLIC_RAZORPAY_ADDON_LEADS_ID, // Fallback
      },
    },
  },
} as const;

// LEGACY CONSTANTS - To be removed after refactoring all usages
export const CREDIT_ADDONS = {
  UNIT_CREDITS: 7000,
  UNIT_PRICE_USD: 50,
  MAX_AMOUNT_USD: 150,
  RAZORPAY_ADDON_ITEM_ID: process.env.NEXT_PUBLIC_RAZORPAY_ADDON_CREDITS_ID,
} as const;

export const LEAD_ADDONS = {
  UNIT_LEADS: 1000,
  UNIT_PRICE_USD: 10,
  MAX_AMOUNT_USD: 500,
  RAZORPAY_ADDON_ITEM_ID: process.env.NEXT_PUBLIC_RAZORPAY_ADDON_LEADS_ID,
} as const;
