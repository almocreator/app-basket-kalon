import { signIn } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export function SignIn() {
    return (
        <form
            action={async () => {
                "use server"
                await signIn("google")
            }}
        >
            <Button type="submit">Iniciar con Google</Button>
        </form>
    )
}
