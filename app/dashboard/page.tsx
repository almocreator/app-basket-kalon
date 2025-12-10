import { auth, signOut } from "@/lib/auth";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
                    <p>Debes iniciar sesión para ver esta página.</p>
                    <form
                        action={async () => {
                            "use server";
                            // Redirect to sign in (default NextAuth page for now)
                            // In a real app we would redirect to a custom login page or call signIn directly
                            const { signIn } = await import("@/lib/auth");
                            await signIn("google");
                        }}
                    >
                        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
                            Iniciar Sesión con Google
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Panel de Control</h1>
            <div className="bg-white text-black p-6 rounded-lg shadow-md max-w-md">
                <p className="mb-2">Bienvenido, {session.user.name}</p>
                <p className="text-sm text-gray-500 mb-4">{session.user.email}</p>
                {session.user.image && (
                    <img
                        src={session.user.image}
                        alt="Profile"
                        className="w-16 h-16 rounded-full mb-4"
                    />
                )}
                <form
                    action={async () => {
                        "use server";
                        await signOut();
                    }}
                >
                    <button className="bg-red-500 text-white px-4 py-2 rounded">
                        Cerrar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
}
