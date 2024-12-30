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
import { fetchPrice, addHolding, deleteHolding, HoldingFormValues, getHoldingBySymbol } from "@/app/actions"
import { useToast } from "./hooks/use-toast"

 
const formSchema = z.object({
  username: z.string()
    .regex(
      /^(trade)\s+[a-zA-Z]+\s+[-]?\d+$/,
      "Command must be in format: [trade] [ticker] [shares]"
    )
    .refine((val) => {
      const parts = val.split(/\s+/);
      return parts.length === 3 && Number.isInteger(Number(parts[2]));
    }, {
      message: "Must have exactly 3 parts and end with a valid integer"
    })
});


 
export function Terminal() {
  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          username: "",
        },
      })
      
      const { toast } = useToast();
      const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const [action, ticker, shares] = values.username.split(" ")
        const price = await fetchPrice(ticker)
        const sharesNum = parseInt(shares)
        

        const oldHolding = await getHoldingBySymbol(ticker)
        if (oldHolding) {
          // Failure message and end request if user attempts to execute illegal trade
          if (oldHolding.shares_owned + sharesNum < 0) {
            toast({
              title: "Failed",
              description: "Cannot sell more shares than the amount owned.",
            })
            return
          }
          const holdingData: HoldingFormValues = {
            symbol: ticker,
            date: new Date(),
            shares: sharesNum + oldHolding.shares_owned,
            price: price
          };
          addHolding(holdingData)
        }
        else {
          const holdingData: HoldingFormValues = {
            symbol: ticker,
            date: new Date(),
            shares: sharesNum,
            price: price
          };
          addHolding(holdingData)
        }
        
        toast({
          title: "Success",
          description: "Executed trade. Refresh to update dashboard.",
        })
        
      }
 
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
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

