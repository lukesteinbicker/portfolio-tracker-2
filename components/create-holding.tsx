import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pen, Plus, Trash } from "lucide-react"
import { HoldingForm } from "./holding-form"

export function CreateHolding() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline"><Plus/></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create holding</DialogTitle>
          <DialogDescription>
            Enter relevant information below
          </DialogDescription>
        </DialogHeader>
        <HoldingForm />
      </DialogContent>
    </Dialog>
  )
}