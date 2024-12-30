import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CreateHolding } from "@/components/create-holding";
import MainDashboard from "@/components/main-dashboard";
import CreateHoldingTerminal from "@/components/create-holding-terminal";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6 my-10 px-4">
      <div className="flex items-center justify-between mx-auto w-full">
        <h1 className="text-4xl">Portfolio</h1>
        <div className="flex items-center gap-4">
        <CreateHoldingTerminal />
        <CreateHolding />
        </div>
      </div>
      <div className="mx-auto w-full">
        <MainDashboard />
      </div>
    </div>
  );
}
