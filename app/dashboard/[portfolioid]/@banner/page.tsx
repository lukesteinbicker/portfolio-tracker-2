"use client"

import { CreateHolding } from "@/components/create-holding";
import CreateHoldingTerminal from "@/components/create-holding-terminal";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from "@/components/ui/command"
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { useEffect, useState } from "react";
import Link from "next/link";
import { getPortfolios } from "@/app/actions";
import { CreatePortfolio } from "@/components/create-portfolio";
import { DeletePortfolio } from "@/components/delete-portfolio";
import { EditPortfolio } from "@/components/edit-portfolio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { checkUUID } from "@/app/actions";

interface PortfolioFormValues {
    id: string;
    name: string;
}

export default function Page () {

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [portfoliosData, setPortfoliosData] = useState<PortfolioFormValues[] | null>()
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchPortfolios = async () => {
          const data = await getPortfolios();
          console.log(data)
          setPortfoliosData(data);
        };
        fetchPortfolios();
      }, []);

    useEffect(() => {
      async function setAdminStatus() {
        setIsAdmin(!(await checkUUID()));
      }
      setAdminStatus();
    }, []);


    return (
    <>
    <div className="flex items-center gap-2">
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[150px] justify-between"
        >
          {value
            ? portfoliosData?.find((portfolio) => portfolio.name === value)?.name
            : "Select..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] max-h-[400px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No portfolio found.</CommandEmpty>
            <CommandGroup>
            <ScrollArea>
              {portfoliosData?.map((portfolio) => (
                <span className="flex items-center">
                <Link className="w-full mr-2" href={`/dashboard/${portfolio.id}`}>
                <CommandItem
                  key={portfolio.id}
                  value={portfolio.name}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  {portfolio.name}
                </CommandItem>
                </Link>
                <div className="flex items-center gap-2">
                {isAdmin && <EditPortfolio id={portfolio.id} />}
                {isAdmin && <DeletePortfolio id={portfolio.id} />}
                </div>
                </span>
              ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    {isAdmin && <CreatePortfolio />}
    </div>
            <div className="flex items-center gap-2">
            {isAdmin && <CreateHoldingTerminal />}
            {isAdmin && <CreateHolding />}
            </div>
    </>
    )
}