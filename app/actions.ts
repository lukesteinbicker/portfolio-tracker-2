"use server"

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import dayjs from "dayjs";

export const signInAction = async (formData: FormData) => {
  const email = process.env.EMAIL!
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export type TreeLeaf = {
  type: 'leaf';
  id: string;
  name: string;
  value: number;
  purchase_price: number;
  price: number;
  shares_owned: number;
  market_cap: string;
  company_name: string;
  description: string;
};


export async function getCurrentPrice(symbol: string): Promise<number> {
  const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${process.env.POLYGON_API_KEY}`);
  
  if (!response.ok) {
    return 0;
  }
  
  const data = await response.json();
  
  if (!data.results || !data.results.length) {
    return 0;
  }
  
  return Number(data.results[0].c);
}

export const getHolding = async(id: string) => {
  const supabase = await createClient();
  const { data: holding, error } = await supabase
    .from('holdings')
    .select('id, symbol, purchase_price, shares_owned')
    .eq('id', id)
    .single()

  if (error || holding == null) {
    return null;
  }

  return holding;

}

export const getHoldingBySymbol = async(symbol: string) => {
  const supabase = await createClient();
  const { data: holding, error } = await supabase
    .from('holdings')
    .select('id, symbol, purchase_price, shares_owned')
    .eq('symbol', symbol)
    .single()

  if (error || holding == null) {
    return null;
  }

  return holding;
}


export async function getHoldings() {
  const supabase = await createClient();
  const { data: holdings, error } = await supabase
    .from('holdings')
    .select('id, symbol, purchase_price, shares_owned');

  if (error || !holdings) {
    return null;
  }
  const children: TreeLeaf[] = await Promise.all(holdings.map(async (holding) => {
    const currentPrice = await getCurrentPrice(holding.symbol);
    const currentValue = Math.round(currentPrice * holding.shares_owned);
    const response = await fetch(`https://api.polygon.io/v3/reference/tickers/${holding.symbol}?apiKey=${process.env.POLYGON_API_KEY}`)
    const data = await response.json();
    const formatter = Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 2,
      compactDisplay: 'short'
    });
    
    const companyName = response.ok ? data.results.name : "Unknown";
    const marketCap = response.ok ? String(formatter.format(data.results.market_cap)) : "0";
    const description = response.ok ? data.results.description : "Unknown";
    return {
      type: 'leaf' as const,
      id: holding.id,
      name: holding.symbol,
      value: currentValue,
      purchase_price: holding.purchase_price,
      price: currentPrice,
      shares_owned: holding.shares_owned,
      market_cap: marketCap,
      company_name: companyName,
      description: description
    };
  }));

  return children;
}

const getCurrentMarketTime = () => {
  const now = dayjs();
  const marketOpen = now.startOf('day').add(9.5, 'hour');
  const marketClose = now.startOf('day').add(16, 'hour');
  
  if (now.isBefore(marketOpen)) {
      return now.subtract(1, 'day');
  }
  return now;
};

const getTimeRange = (timeframe: "day" | "week" | "month" | "year") => {
  const currentMarketTime = getCurrentMarketTime();
  const now = dayjs();
  
  if (timeframe === "day") {
      const start = currentMarketTime.startOf("day").add(9.5, "hour");
      const end = now.isBefore(now.startOf('day').add(16, 'hour')) 
          ? now 
          : currentMarketTime.startOf("day").add(16, "hour");
      return { start: start.valueOf(), end: end.valueOf() };
  }
  
  return {
      start: currentMarketTime.subtract(1, timeframe).valueOf(),
      end: now.valueOf()
  };
};


export const getHoldingChart = async(id: string, timeframe: "day" | "week" | "month" | "year") => {
  const supabase = await createClient();
  const { data: holding, error } = await supabase
    .from('holdings')
    .select('id, symbol, purchase_price, shares_owned')
    .eq('id', id)
    .single();

    if (error || holding == null) {
      return null;
    }
    
    const { start, end } = getTimeRange(timeframe);
    const multiplier = timeframe == "day" ? 10 : timeframe == "week" ? 6 : timeframe == "month" ? 1 : 12
    const division = timeframe == "day" ? "minute" : timeframe == "week" ? "hour" : "day"
    const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${holding.symbol}/range/${multiplier}/${division}/${start}/${end}?adjusted=true&sort=asc&apiKey=${process.env.POLYGON_API_KEY}`)
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.results;
}

export interface HoldingFormValues {
  symbol: string;
  date: Date;
  price: number | null;
  shares: number;
}

export const addHolding = async(values: HoldingFormValues) => {
  const supabase = await createClient();
  if (values.price == null) {
    const { data, error } = await supabase
  .rpc('upsert_holdings', {
    p_symbol: values.symbol,
    p_purchase_price: (await getCurrentPrice(values.symbol)) * values.shares,
    p_shares_to_add: values.shares,
    p_date: values.date
  })

if (error) {
  console.error(error)
  return ["Error", "Something went wrong"];
}

return ["Success", "Holding added successfully"]
  }
  else {
  const { data, error } = await supabase
  .from('holdings')
  .upsert(
    { 
      symbol: values.symbol,
      purchase_price: values.price,
      shares_owned: values.shares,
      date: values.date
    }, 
    { onConflict: 'symbol' }
  )
  .select()

  if (error) {
    console.error(error)
    return ["Error", "Something went wrong"];
  }

  return ["Success", "Holding added successfully"]
}
}

export const deleteHolding = async(id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
  .from('holdings')
  .delete()
  .eq('id', id)

  if (error) {
    console.error(error)
    return ["Error", "Something went wrong"];
  }

  return ["Success", "Holding deleted successfully"]
}