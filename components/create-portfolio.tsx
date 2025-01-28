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
import { ListPlus } from "lucide-react"
import { PortfolioForm } from "./portfolio-form"

export function CreatePortfolio() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline"><ListPlus/></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create portfolio</DialogTitle>
          <DialogDescription>
            Enter relevant information below
          </DialogDescription>
        </DialogHeader>
        <PortfolioForm id={null}/>
      </DialogContent>
    </Dialog>
  )
}