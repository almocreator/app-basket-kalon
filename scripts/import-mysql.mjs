
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function importMatches(data) {
    console.log(`Starting import of ${data.length} matches...`);
    let successCount = 0;
    let errorCount = 0;

    for (const match of data) {
        try {
            // Parse date
            const matchDate = new Date(match.date);
            // Combine time if available, otherwise default time
            if (match.time) {
                const [hours, minutes] = match.time.split(':');
                matchDate.setHours(parseInt(hours), parseInt(minutes));
            }

            await prisma.match.create({
                data: {
                    //   id: match.id, // Optional: attempt to keep Firebase ID if compatible, or let Prisma generate new one
                    title: `Match vs ${match.opponent || 'Unknown'}`,
                    date: matchDate,
                    location: match.location || 'Unknown Location',
                    opponent: match.opponent,
                    homeScore: match.homeScore || 0,
                    awayScore: match.awayScore || 0,
                    homeName: match.homeName || 'CLÍNICA KALON',
                    awayName: match.awayName || match.opponent,
                    status: match.status || 'FINISHED',
                    details: match, // Store full original data in JSON column
                    // bills creatorId as undefined/null since we don't have user mapping yet
                }
            });
            process.stdout.write('.');
            successCount++;
        } catch (e) {
            console.error(`\nFailed to import match ${match.id}:`, e.message);
            errorCount++;
        }
    }

    console.log(`\n\nImport finished! Success: ${successCount}, Errors: ${errorCount}`);
}

async function main() {
    try {
        const rawData = await fs.readFile(path.resolve('firebase_dump.json'), 'utf-8');
        const dump = JSON.parse(rawData);

        if (dump.matches && dump.matches.length > 0) {
            await importMatches(dump.matches);
        } else {
            console.log('No matches found in dump file.');
        }

    } catch (e) {
        console.error("Critical error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
