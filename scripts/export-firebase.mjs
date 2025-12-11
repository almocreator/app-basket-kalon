
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs/promises';
import path from 'path';

const firebaseConfig = {
    apiKey: "AIzaSyBIzMFRbTU2-BDoTgRkkA1f4UBv7UPPwnM",
    authDomain: "basket-6bf52.firebaseapp.com",
    databaseURL: "https://basket-6bf52-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "basket-6bf52",
    storageBucket: "basket-6bf52.firebasestorage.app",
    messagingSenderId: "146171891142",
    appId: "1:146171891142:web:e085a163d3ccc2646af6c7",
    measurementId: "G-6DV69F8C91"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function exportCollection(collectionName) {
    console.log(`Exporting ${collectionName}...`);
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
        console.log(`No documents found in ${collectionName}`);
        return [];
    }

    const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    console.log(`Exported ${data.length} docs from ${collectionName}`);
    return data;
}

async function main() {
    const collections = ['matches', 'partidos', 'asistencias'];
    const allData = {};

    for (const col of collections) {
        try {
            allData[col] = await exportCollection(col);
        } catch (e) {
            console.error(`Error exporting ${col}:`, e);
        }
    }

    const outputPath = path.resolve('firebase_dump.json');
    await fs.writeFile(outputPath, JSON.stringify(allData, null, 2));
    console.log(`\nSuccess! Data saved to ${outputPath}`);
    process.exit(0);
}

main().catch(console.error);
