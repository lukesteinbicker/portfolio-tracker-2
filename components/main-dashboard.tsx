"use client"

import React, { useState, useEffect } from 'react';
import Treemap from '@/components/ui/treemap';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DeleteHolding } from './delete-holding';
import { StockChart } from './stock-chart';
import { EditHolding } from './edit-holding';
import { getHoldings, TreeLeaf } from '@/app/actions';
import { Skeleton } from './ui/skeleton';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

type SelectedItem = {
  name: string;
  id: string;
  purchase_price: number;
  price: number;
  market_cap: string;
  company_name: string;
  shares_owned: number;
  description: string;
  short: boolean;
} | null;

export default function MainDashboard() {
  const [holdingsData, setHoldingsData] = useState<TreeLeaf[] | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);

  useEffect(() => {
    const fetchHoldings = async () => {
      const data = await getHoldings();
      setHoldingsData(data);
    };
    fetchHoldings();
  }, []);

  const handleItemClick = (item: SelectedItem) => {
    setSelectedItem(item);
  };

  if (!holdingsData) {
    return (
      <div className="flex flex-col lg:flex-row w-full gap-4">
        <div className="w-full lg:w-2/3">
        <Skeleton className="w-full h-[500px] rounded-md" />
        </div>
        <div className="w-full lg:w-1/3">
        <Skeleton className="w-full h-[500px] rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row w-full gap-4">
      <div className="w-full lg:w-2/3">
        <Treemap 
          data={{ name: 'root', type: 'node', value: 0, children: holdingsData }}
          onItemClick={handleItemClick}
        />
      </div>
      <Card className="w-full lg:w-1/3 h-fit">
      <CardHeader>
  <div className="flex items-center justify-between w-full">
    <CardTitle className="flex items-center gap-2 min-w-0">
      <span className="shrink-0">{selectedItem ? selectedItem.name : 'No item selected'}</span>
      {selectedItem && (
        <span className="text-muted-foreground text-sm truncate">
          - {selectedItem.company_name}
        </span>
      )}
    </CardTitle>
    {selectedItem && (
      <div className="inline-flex items-center gap-2 shrink-0 ml-2">
        <EditHolding id={selectedItem.id} />
        <DeleteHolding id={selectedItem.id}/>
      </div>
    )}
  </div>
</CardHeader>
        <CardContent>
  {selectedItem ? (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-2 gap-4">
        
      <div className="space-y-2">
  <Label>Percent Change</Label>
  <p className="text-muted-foreground">
    {selectedItem.short == true
      ? (selectedItem.price - (selectedItem.purchase_price / selectedItem.shares_owned) > 0 ? "-" : "+")
      : (selectedItem.price - (selectedItem.purchase_price / selectedItem.shares_owned) < 0 ? "-" : "+")}
    {Math.abs((((selectedItem.price * selectedItem.shares_owned) - selectedItem.purchase_price)/selectedItem.purchase_price) * 100).toFixed(2)}%
  </p>
</div>

<div className="space-y-2">
  <Label>Dollar Change</Label>
  <p className="text-muted-foreground">
    {selectedItem.short == true
      ? (selectedItem.price - (selectedItem.purchase_price / selectedItem.shares_owned) > 0 ? "-" : "+")
      : (selectedItem.price - (selectedItem.purchase_price / selectedItem.shares_owned) < 0 ? "-" : "+")}
    ${Math.abs(selectedItem.price - (selectedItem.purchase_price / selectedItem.shares_owned)).toFixed(2)}
  </p>
</div>

        
        <Separator className="col-span-2" />

        <div className="space-y-2">
          <Label>Purchase Price</Label>
          <p className="text-muted-foreground">${selectedItem.purchase_price / selectedItem.shares_owned}</p>
        </div>
        
        <div className="space-y-2">
          <Label>Current Price</Label>
          <p className="text-muted-foreground">${selectedItem.price}</p>
        </div>

        <Separator className="col-span-2" />
        
        <div className="space-y-2">
          <Label>Shares Owned</Label>
          <p className="text-muted-foreground">{selectedItem.shares_owned}</p>
        </div>

        <div className="space-y-2">
          <Label>Market Cap</Label>
          <p className="text-muted-foreground">{selectedItem.market_cap}</p>
        </div>
      
      </div>

      <StockChart id={selectedItem.id} />
    </div>
  ) : (
    <p>Select an item to view its details.</p>
  )}
</CardContent>
      </Card>
    </div>
  );
}
