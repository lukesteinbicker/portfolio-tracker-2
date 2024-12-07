"use client"

import React, { useState } from 'react';
import Treemap from '@/components/ui/treemap';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DeleteHolding } from './delete-holding';
import { StockChart } from './stock-chart';
import { EditHolding } from './edit-holding';

type SelectedItem = {
  name: string;
  id: string;
  value: number;
  purchase_price: number;
} | null;

export default function MainDashboard({initialData} : {initialData: any}) {
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);

  const handleItemClick = (item: SelectedItem) => {
    setSelectedItem(item);
  };
  if (initialData) {
  return (
    <div className="flex flex-col lg:flex-row w-full gap-4">
  <div className="w-full lg:w-2/3">
    <Treemap 
      data={initialData}
      onItemClick={handleItemClick}
    />
    </div>
  <Card className="w-full lg:w-1/3 h-fit">
    <CardHeader>
      <div className="inline-flex items-center justify-between">
        <CardTitle>{selectedItem ? selectedItem.name : 'No item selected'}</CardTitle>
        {selectedItem ? <div className="inline-flex items-center gap-2"><EditHolding id={selectedItem.id} /><DeleteHolding id={selectedItem.id}/></div> : <></>}
      </div>
    </CardHeader>
    <CardContent>
      {selectedItem ? (
        <div className="w-full">
        <h2 className="text-muted-foreground mb-2">Currently valued at ${selectedItem.value}, {(((selectedItem.value - selectedItem.purchase_price)/selectedItem.purchase_price) * 100).toFixed(2)}% from purchase</h2>
        <StockChart id={selectedItem.id} />
        </div>
      ) : (
        <p>Select an item to view its details.</p>
      )}
    </CardContent>
  </Card>
</div>
  );
} else {
    return <></>
}
};