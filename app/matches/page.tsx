import { auth } from "@/lib/auth";
import { getMatches } from "@/lib/actions";
import { CreateMatchForm } from "@/components/create-match-form";
import { MatchCard } from "@/components/match-card";
import { redirect } from "next/navigation";

export default async function MatchesPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/api/auth/signin"); // Simple redirect for now
    }

    const matches = await getMatches();

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Próximos Partidos</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 hidden md:inline">Hola, {session.user.name}</span>
                    {session.user.image && (
                        <img src={session.user.image} className="w-8 h-8 rounded-full" alt="avatar" />
                    )}
                </div>
            </div>

            <CreateMatchForm />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {matches.map((match) => (
                    <MatchCard key={match.id} match={match} currentUser={session.user} />
                ))}
                {matches.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No hay partidos programados. ¡Crea el primero!
                    </div>
                )}
            </div>
        </div>
    );
}
