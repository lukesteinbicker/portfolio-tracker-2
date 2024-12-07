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
import { Pen } from "lucide-react"
import { HoldingForm } from "./holding-form"

export function EditHolding({id} : {id: string}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline"><Pen/></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit holding</DialogTitle>
          <DialogDescription>
            Enter relevant information below
          </DialogDescription>
        </DialogHeader>
        <HoldingForm id={id} />
      </DialogContent>
    </Dialog>
  )
}