import { getPortfolios } from "@/app/actions";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function Page() {
    const portfoliosData = await getPortfolios();

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {portfoliosData?.map((portfolio) => (
                <Link href={`/dashboard/${portfolio.id}`}>
                <Card key={portfolio.id}>
                    <CardTitle className="p-6">
                        
                            {portfolio.name}
                        
                    </CardTitle>
                    <CardContent className="text-muted-foreground">
                        {portfolio.description}
                    </CardContent>
                </Card>
                </Link>
            ))}
        </div>
    );
}
