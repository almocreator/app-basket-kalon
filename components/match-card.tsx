"use client";

import { voteInMatch } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { User } from "next-auth";

type MatchCardProps = {
    match: any; // Using any for simplicity in prototype, ideally specific type from Prisma
    currentUser?: User;
};

export function MatchCard({ match, currentUser }: MatchCardProps) {
    const userVote = match.votes.find((v: any) => v.userId === currentUser?.id);
    const yesVotes = match.votes.filter((v: any) => v.attendance).length;
    const noVotes = match.votes.filter((v: any) => !v.attendance).length;

    return (
        <Card key={match.id} className="w-full">
            <CardHeader>
                <CardTitle>{match.title}</CardTitle>
                <CardDescription>
                    {new Date(match.date).toLocaleString()} - {match.location}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm">
                        <span className="font-bold text-green-600">{yesVotes} Asistirán</span>
                        <span className="mx-2">|</span>
                        <span className="font-bold text-red-600">{noVotes} No Asistirán</span>
                    </div>
                </div>

                {/* Simplified User Avatar List */}
                <div className="flex -space-x-2 overflow-hidden mb-4">
                    {match.votes.filter((v: any) => v.attendance).map((vote: any) => (
                        <div key={vote.user.id} className="relative inline-block h-8 w-8 rounded-full border-2 border-white bg-gray-200" title={vote.user.name}>
                            {vote.user.image ? (
                                <img src={vote.user.image} alt={vote.user.name} className="h-full w-full rounded-full object-cover" />
                            ) : (
                                <span className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-500">{vote.user.name?.[0]}</span>
                            )}
                        </div>
                    ))}
                </div>

            </CardContent>
            <CardFooter className="flex justify-between gap-2">
                {currentUser ? (
                    <>
                        <Button
                            variant={userVote?.attendance === true ? "default" : "outline"}
                            className={`w-full ${userVote?.attendance === true ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50 text-green-700 border-green-200"}`}
                            onClick={() => voteInMatch(match.id, true)}
                        >
                            Asistiré
                        </Button>
                        <Button
                            variant={userVote?.attendance === false ? "destructive" : "outline"}
                            className={`w-full ${userVote?.attendance === false ? "bg-red-600" : "hover:bg-red-50 text-red-700 border-red-200"}`}
                            onClick={() => voteInMatch(match.id, false)}
                        >
                            No Asistiré
                        </Button>
                    </>
                ) : (
                    <p className="text-sm text-gray-500">Inicia sesión para votar</p>
                )}
            </CardFooter>
        </Card>
    );
}
