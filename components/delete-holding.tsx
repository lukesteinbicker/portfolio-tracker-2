import { deleteHolding } from "@/app/actions"
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

export function DeleteHolding({id} : {id: string}) {

  async function submitDeletion() {
    const response = await deleteHolding(id)
    toast({
      title: response[0],
      description: response[1]})
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline"><Trash /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete holding</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this holding permanently?
          </DialogDescription>
        </DialogHeader>
        <Button variant="destructive" type="submit" onClick={submitDeletion}>Delete</Button>
      </DialogContent>
    </Dialog>
  )
}
