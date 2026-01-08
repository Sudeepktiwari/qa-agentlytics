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
    // Map specific add-on combinations to separate Razorpay Plan IDs
    // Format: "${creditUnits}_${leadUnits}" => "plan_id"
    // 1 unit of credits = 7,000 credits
    variantIds: {
      "1_0": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_GROWTH_1C || "", // +$50
      "2_0": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_GROWTH_2C || "", // +$100
      "3_0": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_GROWTH_3C || "", // +$150
    },
    addons: {
      credits: {
        price: 50,
        amount: 7000,
        maxPrice: 150,
        razorpayItemId: null, // Not using Add-on items
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
    // 1 unit credits = 16k, 1 unit leads = 100k
    variantIds: {
      // Credits Only
      "1_0": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE_1C || "", // +$100
      "2_0": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE_2C || "", // +$200
      "3_0": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE_3C || "", // +$300

      // Leads Only
      "0_1": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE_1L || "", // +$100
      "0_2": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE_2L || "", // +$200
      "0_3": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE_3L || "", // +$300

      // Mixed: 1 Credit Unit + X Leads
      "1_1": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE_1C_1L || "", // +$200
      "1_2": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE_1C_2L || "", // +$300
      "1_3": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE_1C_3L || "", // +$400

      // Mixed: 2 Credit Units + X Leads
      "2_1": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE_2C_1L || "", // +$300
      "2_2": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE_2C_2L || "", // +$400
      "2_3": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE_2C_3L || "", // +$500

      // Mixed: 3 Credit Units + X Leads
      "3_1": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE_3C_1L || "", // +$400
      "3_2": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE_3C_2L || "", // +$500
      "3_3": process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE_3C_3L || "", // +$600
    },
    addons: {
      credits: {
        price: 100,
        amount: 16000,
        maxPrice: 300,
        razorpayItemId: null,
      },
      leads: {
        price: 100,
        amount: 100000,
        maxPrice: 300,
        razorpayItemId: null,
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
