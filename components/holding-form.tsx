"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { addHolding, getHolding } from "@/app/actions"
import { toast } from "./hooks/use-toast"
import { useState } from "react"; 
import Datepicker from "react-tailwindcss-datepicker"; 
import { Input } from "./ui/input"
import amex from "./data/amex_tickers.json"
import nasdaq from "./data/nasdaq_tickers.json"
import nyse from "./data/nyse_tickers.json"

const formSchema = z.object({
  exchange: z.enum(["nyse", "nasdaq", "amex"], {
    required_error: "Field empty"
  }),
  symbol: z.string().min(1, {
    message: "Field empty",
  }),
  date: z.date({
    required_error: "Field empty",
  }),
  price: z.coerce.number({
    required_error: "Field empty",
    invalid_type_error: "Invalid value",
  }).nonnegative({
    message: "Negative value"
  }),
  shares: z.coerce.number({
    required_error: "Empty",
    invalid_type_error: "Invalid value",
  }).nonnegative({
    message: "Negative value"
  }),
})

interface HoldingFormValues {
  exchange: z.infer<typeof formSchema>["exchange"];
  symbol: string;
  date: Date;
  price: number;
  shares: number;
}

export function HoldingForm({id} : {id: string | null}) {
  const [symbol, setSymbol] = useState("")
  const [tickers, setTickers] = useState(nysetickers)
  const [value, setValue] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: new Date(),
    endDate: new Date()
  });

  const form = useForm<HoldingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: async () => {
      if (id) {
        const holding = await getHolding(id)
        if (holding != null) {
          let exchange: "nyse" | "nasdaq" | "amex" = "nyse"
          if (amex.includes(holding.symbol)) {
            exchange = "amex"
          } else if (nasdaq.includes(holding.symbol)) {
            exchange = "nasdaq"
          } else if (nyse.includes(holding.symbol)) {
            exchange = "nyse"
          }
  
          return {
            exchange,
            symbol: holding.symbol,
            date: new Date(),
            price: holding.purchase_price,
            shares: holding.shares_owned,
          }
        }
      }
      return {
        exchange: "nyse",
        symbol: "",
        date: new Date(),
        price: 0,
        shares: 0,
      }
    }
  })
  
  async function onSubmit(values: HoldingFormValues) {
    if (values.exchange == "nyse") {
      if (!nyse.includes(values.symbol)) {
        toast({
          title: "Error",
          description: "Symbol not listed on NYSE"
        })
        return
      }
    }
    if (values.exchange == "nasdaq") {
      if (!nasdaq.includes(values.symbol)) {
        toast({
          title: "Error",
          description: "Symbol not listed on Nasdaq"
        })
        return
      }
    }
    if (values.exchange == "amex") {
      if (!amex.includes(values.symbol)) {
        toast({
          title: "Error",
          description: "Symbol not listed on AMEX"
        })
        return
      }
    }
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="col-span-1">
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
  value={field.value}
  disabled={id !== null}
  defaultValue={field.value}
>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
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
                      <Input
                          type="text"
                          disabled={id !== null}
                          {...field}
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
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
  
          <div className="col-span-1">
          <FormField
  control={form.control}
  name="date"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="whitespace-nowrap overflow-hidden text-ellipsis">
        Transaction Date
      </FormLabel>
      <FormControl>         
        <Datepicker 
          asSingle={true}
          value={value}
          onChange={newValue => {
            setValue(newValue || { startDate: null, endDate: null });
            field.onChange(newValue?.startDate);
          }}
          useRange={false}
        /> 
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
          </div>
        </div>
        <SubmitButton>Submit</SubmitButton>
      </form>
    </Form>
  )
}