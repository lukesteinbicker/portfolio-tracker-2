"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { editPortfolio, getPortfolio } from "@/app/actions"
import { toast } from "./hooks/use-toast"
import { Input } from "./ui/input"
import { Textarea } from "./ui/text-area"

export interface PortfolioFormValues {
    name: string;
    description: string;
  }

  const formSchema = z.object({
    name: z.string()
      .min(1, { message: "Field empty" })
      .max(20, { message: "Maximum of 20 characters allowed" }),
    description: z.string()
      .min(1, { message: "Field empty" })
      .max(100, { message: "Maximum of 100 characters allowed" })
  })


export function PortfolioForm({id} : {id: string | null}) {

  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: async () => {
      if (id) {
        const portfolio = await getPortfolio(id)
        if (portfolio != null) {
  
          return {
            name: portfolio.name,
            description: portfolio.description
          }
        }
      }
      return {
        name: "",
        description: ""
      }
    }
  })
  
  async function onSubmit(values: PortfolioFormValues) {
    try {
      const response = await editPortfolio(values, id)
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <SubmitButton>Submit</SubmitButton>
      </form>
    </Form>
)
}