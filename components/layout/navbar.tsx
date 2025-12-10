import Link from "next/link"
import { auth } from "@/lib/auth"
import { SignIn } from "@/components/auth/sign-in"
import { UserMenu } from "@/components/auth/user-menu"
import { Button } from "@/components/ui/button"

export async function Navbar() {
    const session = await auth()

    return (
        <nav className="border-b bg-background">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="font-bold text-lg flex items-center gap-2">
                        🏀 Clínica Kalón
                    </Link>
                    <div className="hidden md:flex gap-4">
                        <Button variant="ghost" asChild>
                            <Link href="/matches">Partidos</Link>
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link href="/dashboard">Panel</Link>
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {session?.user ? (
                        <UserMenu user={session.user} />
                    ) : (
                        <SignIn />
                    )}
                </div>
            </div>
        </nav>
    )
}
