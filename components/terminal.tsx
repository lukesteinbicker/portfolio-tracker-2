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
import { addHolding, HoldingFormValues, addShortHolding } from "@/app/actions"
import { useToast } from "./hooks/use-toast"
import amex from "./data/amex_tickers.json"
import nasdaq from "./data/nasdaq_tickers.json"
import nyse from "./data/nyse_tickers.json"
import dayjs from "dayjs"
import { usePathname } from "next/navigation"

 
const formSchema = z.object({
  command: z.string()
    .regex(
      /^(buy|short)\s+[a-zA-Z]+\s+[-]?\d+(\.\d+)?$/,
      "Command must be in format: [buy/short] [ticker] [shares]"
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
      
      const pathname = usePathname()
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
        const portfolioid = pathname.substring(pathname.lastIndexOf('/') + 1);

        const holdingData: HoldingFormValues = {
            portfolio_id: portfolioid,
            symbol: ticker.toUpperCase(),
            date: dayjs().toDate(),
            shares: sharesNum,
            price: null
          };

        let response;
        if (action === "buy") {
          response = await addHolding(holdingData)
          toast({
            title: response[0],
            description: response[1],
          })
        } else if (action === "short") {
          response = await addShortHolding(holdingData)
          toast({
            title: response[0],
            description: response[1],
          })
        } else {
          toast({
            title: "Error",
            description: "Invalid command: Make sure to enter only buy or short",
          })
        }
        
        
        
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
              [buy/short] [ticker] [shares]
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

