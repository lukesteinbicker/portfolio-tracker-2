"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { addHolding, HoldingFormValues, getHoldingBySymbol } from "@/app/actions"
import { useToast } from "./hooks/use-toast"
import amex from "./data/amex_tickers.json"
import nasdaq from "./data/nasdaq_tickers.json"
import nyse from "./data/nyse_tickers.json"
import dayjs from "dayjs"

 
const formSchema = z.object({
  command: z.string()
    .regex(
      /^(trade)\s+[a-zA-Z]+\s+[-]?\d+(\.\d+)?$/,
      "Command must be in format: trade [ticker] [shares]"
    )
    .refine((val) => {
      const parts = val.split(/\s+/);
      return parts.length === 3 && Number.isFinite(Number(parts[2]));
    }, {
      message: "Must have exactly 3 parts and end with a valid number"
    })
});


 
export function Terminal() {
  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          command: "",
        },
      })
      
      const { toast } = useToast();
      const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const [action, ticker, shares] = values.command.split(" ")
        const sharesNum = parseFloat(shares)
        
        if (!amex.includes(ticker.toUpperCase()) && !nasdaq.includes(ticker.toUpperCase()) && !nyse.includes(ticker.toUpperCase())) {
          toast({
            title: "Error",
            description: "Symbol not listed on any exchange.",
          })
          return
        }

        const holdingData: HoldingFormValues = {
            symbol: ticker.toUpperCase(),
            date: dayjs().toDate(),
            shares: sharesNum,
            price: null
          };
      const response = await addHolding(holdingData)
        
        toast({
          title: response[0],
          description: response[1],
        })
        
      }
 
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="command"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terminal</FormLabel>
              <FormDescription>
                Enter commands in the format:
                <br />
              trade [ticker] [shares]
              </FormDescription>
              <FormControl>
                <Input placeholder="Command" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

