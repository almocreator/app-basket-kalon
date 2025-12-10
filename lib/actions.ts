"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createMatch(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const location = formData.get("location") as string;
    const dateStr = formData.get("date") as string;

    if (!title || !location || !dateStr) {
        throw new Error("Missing required fields");
    }

    try {
        await prisma.match.create({
            data: {
                title,
                location,
                date: new Date(dateStr),
                creatorId: session.user.id,
            },
        });
    } catch (error) {
        console.error("Failed to create match:", error);
        throw new Error("Failed to create match");
    }

    revalidatePath("/matches");
    redirect("/matches");
}

export async function getMatches() {
    const matches = await prisma.match.findMany({
        orderBy: {
            date: "asc",
        },
        include: {
            creator: {
                select: {
                    name: true,
                    image: true,
                },
            },
            votes: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            },
        },
    });
    return matches;
}

export async function voteInMatch(matchId: string, attendance: boolean) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        const existingVote = await prisma.vote.findUnique({
            where: {
                userId_matchId: {
                    userId: session.user.id,
                    matchId,
                },
            },
        });

        if (existingVote) {
            // Update logic: strictly set attendance status as requested
            await prisma.vote.update({
                where: { id: existingVote.id },
                data: { attendance }
            });
        } else {
            await prisma.vote.create({
                data: {
                    userId: session.user.id,
                    matchId,
                    attendance,
                },
            });
        }

        revalidatePath("/"); // Revalidate root as dashboard will be there
        revalidatePath("/matches");
    } catch (error) {
        console.error("Failed to vote:", error);
        throw new Error("Failed to vote");
    }
}
