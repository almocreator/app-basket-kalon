import { auth } from "@/lib/auth";
import { getMatches } from "@/lib/actions";
import { MatchCard } from "@/components/match-card";
import { SignIn } from "@/components/auth/sign-in";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  const matches = await getMatches();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Próximos Partidos</h1>
        {session?.user && (
          <Button asChild>
            <Link href="/matches/new">Crear Partido</Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} currentUser={session?.user} />
        ))}
        {matches.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No hay partidos programados.
          </div>
        )}
      </div>
    </div>
  );
}
