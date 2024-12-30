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
 
const formSchema = z.object({
  username: z.string()
    .regex(
      /^(add|del)\s+(amex|nyse|nasdaq)\s+[a-zA-Z]+\s+\d+$/,
      "Command must be in format: [add/del] [exchange] [ticker] [shares]"
    )
    .refine((val) => {
      const parts = val.split(/\s+/);
      return parts.length === 4 && Number.isInteger(Number(parts[3]));
    }, {
      message: "Must have exactly 4 parts and end with a valid integer"
    })
});

 
export function ProfileForm() {
  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          username: "",
        },
      })
      
      const onSubmit = (values: z.infer<typeof formSchema>) => {
        // Handle form submission
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
              [add/del] [exchange] [ticker] [shares]
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

