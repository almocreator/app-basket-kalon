import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { User } from "next-auth"

export function UserMenu({ user }: { user: User }) {
    return (
        <div className="flex items-center gap-4">
            {user.image ? (
                <img src={user.image} alt={user.name || "User"} className="h-8 w-8 rounded-full border border-gray-200" />
            ) : (
                <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">{user.name?.[0]}</span>
            )}
            <div className="hidden md:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <form
                action={async () => {
                    "use server"
                    await signOut()
                }}
            >
                <Button variant="outline" size="sm" type="submit">
                    Salir
                </Button>
            </form>
        </div>
    )
}
