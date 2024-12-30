"use client"

import React, { useState, useEffect } from 'react';
import Treemap from '@/components/ui/treemap';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DeleteHolding } from './delete-holding';
import { StockChart } from './stock-chart';
import { EditHolding } from './edit-holding';
import { getHoldings, TreeLeaf } from '@/app/actions';
import { Skeleton } from './ui/skeleton';
import { ProfileForm } from './terminal';

type SelectedItem = {
  name: string;
  id: string;
  value: number;
  purchase_price: number;
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
          <div className="inline-flex items-center justify-between">
            <CardTitle>{selectedItem ? selectedItem.name : 'No item selected'}</CardTitle>
            {selectedItem && (
              <div className="inline-flex items-center gap-2">
                <EditHolding id={selectedItem.id} />
                <DeleteHolding id={selectedItem.id}/>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedItem ? (
            <div className="w-full">
              <h2 className="text-muted-foreground mb-2">
                Currently valued at ${selectedItem.value}, {(((selectedItem.value - selectedItem.purchase_price)/selectedItem.purchase_price) * 100).toFixed(2)}% from purchase
              </h2>
              <StockChart id={selectedItem.id} />
            </div>
          ) : (
            <p>Select an item to view its details.</p>
          )}
        </CardContent>
      </Card>

      <ProfileForm></ProfileForm>

      
    </div>
  );
}
