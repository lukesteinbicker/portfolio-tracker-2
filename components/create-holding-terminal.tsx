import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "./ui/button"
import { Terminal as TerminalIcon } from "lucide-react"
import { Terminal } from "./terminal"
  
export default function CreateHoldingTerminal() {return (
<Sheet>
  <SheetTrigger><Button variant="outline"><TerminalIcon/></Button></SheetTrigger>
  <SheetContent>
    <Terminal />
  </SheetContent>
</Sheet>
)
}
