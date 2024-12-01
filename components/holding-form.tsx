"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { DatePicker, DateTimePicker } from '@mantine/dates'
import { Autocomplete, Grid, Input } from '@mantine/core'
import amextickers from './data/amex_tickers.json'
import nysetickers from './data/nyse_tickers.json'
import nasdaqtickers from './data/nasdaq_tickers.json'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { SubmitButton } from "./submit-button"
import { addHolding } from "@/app/actions"
import { toast } from "./hooks/use-toast"

const formSchema = z.object({
  exchange: z.enum(["nyse", "nasdaq", "amex"], {
    required_error: "Exchange name is required"
  }),
  symbol: z.string().min(1, {
    message: "Symbol name is required.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  price: z.coerce.number({
    required_error: "Please enter a price.",
    invalid_type_error: "Price must be a number.",
  }),
  shares: z.coerce.number({
    required_error: "Please enter the number of shares.",
    invalid_type_error: "Number of shares must be a number.",
  }),
})

interface HoldingFormValues {
  exchange: z.infer<typeof formSchema>["exchange"];
  symbol: string;
  date: Date;
  price: number;
  shares: number;
}

export function HoldingForm() {
  const [symbol, setSymbol] = useState("")
  const [tickers, setTickers] = useState(nysetickers)
  const [value, setValue] = useState<Date | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exchange: "nyse" as const,
      symbol: "",
      date: new Date(),
      price: 0,
      shares: 0,
    },
  })

  async function onSubmit(values: HoldingFormValues) {
    try {
      const response = await addHolding(values)
      toast({
        title: response[0],
        description: response[1]
      })
    } catch (error) {
      toast({title: "Error submitting form"})
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Grid>
          <Grid.Col span={{ base: 12, lg: 6 }}>
          <div className="flex mb-4">
              <div className="flex-1 pr-2">
              <FormField
                control={form.control}
                name="exchange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="whitespace-nowrap overflow-hidden text-ellipsis">Exchange</FormLabel>
                    <Select
                      onValueChange={(value: "nyse" | "nasdaq" | "amex") => {
                        field.onChange(value);
                        setTickers(
                          value === "nyse" 
                            ? nysetickers 
                            : value === "nasdaq" 
                              ? nasdaqtickers 
                              : amextickers
                        );
                      }}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Exchange</SelectLabel>
                          <SelectItem value="nyse">NYSE</SelectItem>
                          <SelectItem value="nasdaq">Nasdaq</SelectItem>
                          <SelectItem value="amex">AMEX</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1 pr-2">
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="whitespace-nowrap overflow-hidden text-ellipsis">Stock Symbol</FormLabel>
                    <FormControl>
                      <Autocomplete
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value)
                          setSymbol(value)
                        }}
                        data={tickers}
                        placeholder="Search"
                        limit={5}
                        comboboxProps={{ withinPortal: false }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
            </div>
  
            <div className="flex mb-4">
          <div className="flex-1 pr-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="whitespace-nowrap overflow-hidden text-ellipsis">Total purchase price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        disabled={symbol==""}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <div className="flex-1 pr-2">
              <FormField
                control={form.control}
                name="shares"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="whitespace-nowrap overflow-hidden text-ellipsis">Number of Shares</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        disabled={symbol==""}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            </div>
          </Grid.Col>
  
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="whitespace-nowrap overflow-hidden text-ellipsis">Transaction Date</FormLabel>
                  <FormControl>
                    <DatePicker
                    {...field}
                      value={value}
                      onChange={setValue}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Grid.Col>
        </Grid>
        <SubmitButton disabled={symbol==""}>Submit</SubmitButton>
      </form>
    </Form>
  )
}