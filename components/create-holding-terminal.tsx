import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "./ui/button"
import { Terminal as TerminalIcon } from "lucide-react"
import { Terminal } from "./terminal"
  
export default function CreateHoldingTerminal() {return (
<Sheet>
  <SheetTrigger asChild><Button variant="outline"><TerminalIcon/></Button></SheetTrigger>
  <SheetContent>
    <SheetHeader>
    <Terminal />
    </SheetHeader>
  </SheetContent>
</Sheet>
)
}
