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
import { Badge } from "@/components/ui/badge";

type MatchCardProps = {
    match: any; // Using any for simplicity in prototype, ideally specific type from Prisma
    currentUser?: User;
};

export function MatchCard({ match, currentUser }: MatchCardProps) {
    const userVote = match.votes.find((v: any) => v.userId === currentUser?.id);
    const yesVotes = match.votes.filter((v: any) => v.attendance).length;
    const noVotes = match.votes.filter((v: any) => !v.attendance).length;

    const isFinished = match.status === "FINISHED";
    const homeName = match.homeName || "CLÍNICA KALON";
    const awayName = match.awayName || match.opponent || "Rival";

    return (
        <Card key={match.id} className="w-full flex flex-col">
            <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-2">
                    {isFinished ? (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100">Finalizado</Badge>
                    ) : (
                        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Programado</Badge>
                    )}
                </div>

                <CardTitle className="text-lg leading-tight flex flex-col gap-1 items-center">
                    <span className="text-gray-900">{homeName}</span>
                    <span className="text-sm text-gray-400 font-normal">vs</span>
                    <span className="text-gray-900">{awayName}</span>
                </CardTitle>

                <CardDescription className="pt-2">
                    {new Date(match.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    <br />
                    <span className="text-xs">{match.location}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                {isFinished ? (
                    <div className="flex justify-center items-center gap-6 py-4 bg-gray-50 rounded-lg mb-4">
                        <div className="text-center">
                            <span className="block text-3xl font-bold text-gray-800">{match.homeScore}</span>
                            <span className="text-xs text-gray-500">Local</span>
                        </div>
                        <div className="text-gray-300 text-2xl">-</div>
                        <div className="text-center">
                            <span className="block text-3xl font-bold text-gray-800">{match.awayScore}</span>
                            <span className="text-xs text-gray-500">Visitante</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center mb-4 px-2">
                        <div className="text-center">
                            <span className="block text-lg font-bold text-green-600">{yesVotes}</span>
                            <span className="text-xs text-gray-500">Sí</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-lg font-bold text-red-600">{noVotes}</span>
                            <span className="text-xs text-gray-500">No</span>
                        </div>
                    </div>
                )}

                {/* Simplified User Avatar List - hide if finished to clean up UI? Or keep it? keeping for history */}
                <div className="flex -space-x-2 overflow-hidden justify-center py-2">
                    {match.votes.filter((v: any) => v.attendance).map((vote: any) => (
                        <div key={vote.user.id} className="relative inline-block h-8 w-8 rounded-full border-2 border-white bg-gray-200" title={vote.user.name}>
                            {vote.user.image ? (
                                <img src={vote.user.image} alt={vote.user.name} className="h-full w-full rounded-full object-cover" />
                            ) : (
                                <span className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-500">{vote.user.name?.[0]}</span>
                            )}
                        </div>
                    ))}
                    {yesVotes === 0 && <span className="text-xs text-gray-400 italic">Sin votos aún</span>}
                </div>

            </CardContent>
            <CardFooter className="flex justify-between gap-2 pt-0">
                {!isFinished && currentUser ? (
                    <>
                        <Button
                            variant={userVote?.attendance === true ? "default" : "outline"}
                            size="sm"
                            className={`w-full ${userVote?.attendance === true ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50 text-green-700 border-green-200"}`}
                            onClick={() => voteInMatch(match.id, true)}
                        >
                            Asistiré
                        </Button>
                        <Button
                            variant={userVote?.attendance === false ? "destructive" : "outline"}
                            size="sm"
                            className={`w-full ${userVote?.attendance === false ? "bg-red-600" : "hover:bg-red-50 text-red-700 border-red-200"}`}
                            onClick={() => voteInMatch(match.id, false)}
                        >
                            No
                        </Button>
                    </>
                ) : !currentUser ? (
                    <p className="text-sm text-gray-500 w-full text-center">Inicia sesión para votar</p>
                ) : (
                    <p className="text-xs text-gray-400 w-full text-center">Partido finalizado</p>
                )}
            </CardFooter>
        </Card>
    );
}
