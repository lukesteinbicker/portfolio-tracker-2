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
  shares_owned: number;
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
    return {
      type: 'leaf' as const,
      id: holding.id,
      name: holding.symbol,
      value: currentValue,
      purchase_price: holding.purchase_price,
      shares_owned: holding.shares_owned
    };
  }));

  return children;
}

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
    
    const start = timeframe == "day" ? dayjs().startOf("day").valueOf() : dayjs().subtract(1, timeframe).valueOf()
    const end = dayjs().valueOf()
    const multiplier = timeframe == "day" ? 30 : timeframe == "week" ? 1 : timeframe == "month" ? 1 : 13
    const division = timeframe == "day" ? "minute" : "day"
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
  price: number;
  shares: number;
}

export const addHolding = async(values: HoldingFormValues) => {
  const supabase = await createClient();
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


  
export async function fetchPrice(ticker: string): Promise<any> {
  const BASE_URL = "https://api.polygon.io/v1/open-close"
  const date = dayjs().format('YYYY-MM-DD');
  const url = `${BASE_URL}/${ticker}/${date}?adjusted=true&apiKey=${process.env.POLYGON_API_KEY}`;
  const response = await fetch(url);
  if (response.status === 200) {
    const data = await response.json();
    if (data.status === "OK") {
      return data.open;
    }
    if (data.status === "NOT_FOUND") {
      return ["Error", "Something went wrong"];
    }
  }
}