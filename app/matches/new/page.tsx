import { auth } from "@/lib/auth";
import { CreateMatchForm } from "@/components/create-match-form";
import { redirect } from "next/navigation";

export default async function NewMatchPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/");
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center">Nuevo Partido</h1>
            <CreateMatchForm />
        </div>
    );
}
