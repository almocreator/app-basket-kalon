
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ScoreboardClient } from "@/components/scoreboard-client";
import { redirect, notFound } from "next/navigation";

interface ScoreboardPageProps {
    params: {
        id: string;
    };
}

export default async function ScoreboardPage({ params }: ScoreboardPageProps) {
    const session = await auth();

    // Auth check removed to allow public viewing
    // if (!session?.user) {
    //     redirect("/api/auth/signin");
    // }

    const match = await prisma.match.findUnique({
        where: { id: params.id },
    });

    if (!match) {
        notFound();
    }

    return (
        <ScoreboardClient matchId={match.id} initialData={match} />
    );
}
