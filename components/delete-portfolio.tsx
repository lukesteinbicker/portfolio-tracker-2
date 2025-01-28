import { deleteHolding, deletePortfolio } from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash } from "lucide-react"
import { toast } from "./hooks/use-toast"

export function DeletePortfolio({id} : {id: string}) {

  async function submitDeletion() {
    const response = await deletePortfolio(id)
    toast({
      title: response[0],
      description: response[1]})
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Trash /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete portfolio</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this portfolio permanently?
          </DialogDescription>
        </DialogHeader>
        <Button variant="destructive" type="submit" onClick={submitDeletion}>Delete</Button>
      </DialogContent>
    </Dialog>
  )
}
