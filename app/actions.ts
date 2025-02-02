"use server"

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import dayjs from "dayjs";

export const checkUUID = async() => {
  const supabase = await createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (!session || sessionError)
      return true;

  const { data: {user}, error} = await supabase.auth.getUser();
  if (user) {
    return user.id == process.env.VIEWER_UUID;
  }
  else {
    return false;
  }
}

export const signInAction = async (formData: FormData) => {
  const email = formData.get("adminUser") ? "lukesteinbicker@gmail.com" : "miiportfoliouva@gmail.com";
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
  short: boolean;
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
    .select('id, symbol, purchase_price, shares_owned, portfolio_id')
    .eq('id', id)
    .single()

  if (error || holding == null) {
    return null;
  }

  return holding;

}


export async function getHoldings(portfolioid: string) {
  const supabase = await createClient();
  const { data: holdings, error } = await supabase
    .from('holdings')
    .select('id, symbol, purchase_price, shares_owned, short')
    .eq('portfolio_id', portfolioid);


  if (error || !holdings) {
    return null;
  }
  const children: TreeLeaf[] = await Promise.all(holdings.map(async (holding) => {
    const holdingSymbol = holding.symbol
    const currentPrice = await getCurrentPrice(holdingSymbol);
    const currentValue = Math.round(currentPrice * holding.shares_owned);


    const response = await fetch(`https://api.polygon.io/v3/reference/tickers/${holdingSymbol}?apiKey=${process.env.POLYGON_API_KEY}`)
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
      description: description,
      short: holding.short
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
  portfolio_id: string;
  symbol: string;
  date: Date;
  price: number | null;
  shares: number;
}

export interface PortfolioFormValues {
  name: string;
  description: string;
}

export const addHolding = async(values: HoldingFormValues) => {
  const supabase = await createClient();
  const purchasePrice = values.price ?? (await getCurrentPrice(values.symbol)) * values.shares;
  
  const { data, error } = await supabase
    .rpc('upsert_holdings', {
      p_symbol: values.symbol,
      p_purchase_price: purchasePrice,
      p_shares_to_add: values.shares,
      p_date: values.date,
      p_portfolio_id: values.portfolio_id,
      p_short: false
    });

  if (error) {
    console.error(error)
    return ["Error", "Something went wrong"];
  }

  return ["Success", "Holding added successfully"]
}

export const addExistingHolding = async(values: HoldingFormValues) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('holdings')
    .upsert({
      symbol: values.symbol,
      portfolio_id: values.portfolio_id,
      purchase_price: values.price,
      shares_owned: values.shares,
      date: values.date
    }, {
      onConflict: 'symbol,portfolio_id'
    })
    .select();

  if (error) {
    console.error(error);
    return ["Error", "Something went wrong"];
  }

  return ["Success", "Holding added successfully"];
}


export const addShortHolding = async(values: HoldingFormValues) => {
  const supabase = await createClient();
  const purchasePrice = values.price ?? (await getCurrentPrice(values.symbol)) * values.shares;

  const { data, error } = await supabase
    .rpc('upsert_holdings', {
      p_symbol: values.symbol,
      p_purchase_price: purchasePrice,
      p_shares_to_add: values.shares,
      p_date: values.date,
      p_portfolio_id: values.portfolio_id,
      p_short: true
    });

  if (error) {
    console.error(error)
    return ["Error", "Something went wrong"];
  }

  return ["Success", "Holding added successfully"]
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

export const addPortfolio = async(values: PortfolioFormValues) => {
  const supabase = await createClient();
  const { data, error } = await supabase
  .from('portfolio')
  .insert({
    name: values.name,
    description: values.description
  })
  .select()

  if (error) {
    console.error(error)
    return ["Error", "Something went wrong"];
  }

  return ["Success", "Portfolio added successfully"]
}

export const deletePortfolio = async(id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
  .from('portfolio')
  .delete()
  .eq('id', id)

  if (error) {
    console.error(error)
    return ["Error", "Something went wrong"];
  }

  return ["Success", "Portfolio deleted successfully"]
}

export async function getPortfolios() {
  const supabase = await createClient();
  const { data: portfolio, error } = await supabase
    .from('portfolio')
    .select('id, name, description');

  if (error || !portfolio) {
    return null;
  }
  
  return (portfolio);
}

export const getPortfolio = async(id: string) => {
  const supabase = await createClient();
  const { data: portfolio, error } = await supabase
    .from('portfolio')
    .select('id, name, description')
    .eq('id', id)
    .single()

  if (error || portfolio == null) {
    return null;
  }

  return portfolio;

}

export const editPortfolio = async(values: PortfolioFormValues, id: string | null) => {
  if (id == null) {
    return ["Error", "Something went wrong"];
  }
  const supabase = await createClient();
  const { data, error } = await supabase
  .from('portfolio')
  .update({ name: values.name, description: values.description })
  .eq('id', id)
  .select()

  if (error) {
    console.error(error)
    return ["Error", "Something went wrong"];
  }

  return ["Success", "Portfolio edited successfully"]
}