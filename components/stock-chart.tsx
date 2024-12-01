"use client"

import { getHoldingChart } from "@/app/actions";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const chartConfig = {
    value: {
      label: "Price",
      color: "hsl(var(--primary))",
    }
  } satisfies ChartConfig

export function StockChart({ id }: { id: string }) {
    const [timeframe, setTimeframe] = useState<"day" | "week" | "month" | "year" | null>(null)
    const [data, setData] = useState<any[]>([])

    useEffect(() => {
        if (!timeframe) return;
        
        const fetchData = async () => {
            const results = await getHoldingChart(id, timeframe);
if (results) {
    const chartData = results.map((point: any, index: number) => ({
        timestamp: index % 4 === 0 ? dayjs(point.t).format(
            timeframe === "day" ? "HH:mm" : 
            timeframe === "year" ? "MMM" : 
            "MM/DD"
        ) : null,
        value: Number(point.c)
    }));
    setData(chartData);
}
        };

        fetchData();
    }, [timeframe, id]);

    return (
        <div>
            <div className="flex justify-between items-center w-full mb-4">
                <h1 className="text-nowrap pr-36">Show chart &rarr;</h1>
                <Select
                    onValueChange={(value: "day" | "week" | "month" | "year") => {
                        setTimeframe(value);
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="day">1D</SelectItem>
                            <SelectItem value="week">1W</SelectItem>
                            <SelectItem value="month">1M</SelectItem>
                            <SelectItem value="year">1Y</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            {timeframe && data.length > 0 && (
            <div className="w-full">
                <ChartContainer config={chartConfig}>
                    <LineChart data={data}>
                        <XAxis dataKey="timestamp" />
                        <YAxis dataKey="value" />
                        <Tooltip />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#22c55e" 
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
                </div>
            )}
        </div>
    )
}