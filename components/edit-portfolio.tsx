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
import { PortfolioForm } from "./portfolio-form"

export function EditPortfolio({id} : {id: string}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Pen/></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit portfolio</DialogTitle>
          <DialogDescription>
            Enter relevant information below
          </DialogDescription>
        </DialogHeader>
        <PortfolioForm id={id} />
      </DialogContent>
    </Dialog>
  )
}