import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CreateHolding } from "@/components/create-holding";
import MainDashboard from "@/components/main-dashboard";
import { getHoldings } from "../actions";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const holdingsData = await getHoldings();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6 my-10 px-4">
      <div className="flex items-center justify-between mx-auto w-full">
        <div>
        <h1 className="text-4xl">Portfolio</h1>
        <h3 className="text-sm text-muted-foreground">API calls are limited to 5 per minute. Contact lukesteinbicker@gmail.com for full access.</h3>
        </div>
        <CreateHolding />
      </div>
      <div className="mx-auto w-full">
        <MainDashboard initialData={holdingsData} />
      </div>
    </div>
  );
}
