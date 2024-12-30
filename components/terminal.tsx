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
import { fetchPrice, addHolding, deleteHolding, HoldingFormValues } from "@/app/actions"
import dayjs from "dayjs"

 
const formSchema = z.object({
  username: z.string()
    .regex(
      /^(add|del)\s+[a-zA-Z]+\s+\d+$/,
      "Command must be in format: [add/del] [ticker] [shares]"
    )
    .refine((val) => {
      const parts = val.split(/\s+/);
      return parts.length === 3 && Number.isInteger(Number(parts[2]));
    }, {
      message: "Must have exactly 3 parts and end with a valid integer"
    })
});


 
export function ProfileForm() {
  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          username: "",
        },
      })
      
      const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const [action, ticker, shares] = values.username.split(" ")
        const price = await fetchPrice(ticker)
        const sharesNum = parseInt(shares)

        if (action === "add") {
          const holdingData: HoldingFormValues = {
            symbol: ticker,
            date: new Date(),
            shares: sharesNum,
            price: price
          };
          addHolding(holdingData)
        } else if (action === "del") {

        }

        console.log(values)
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
              [add/del] [ticker] [shares]
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

