import { auth } from "@/lib/auth";

export default auth((req) => {
    if (!req.auth && req.nextUrl.pathname !== "/") {
        // Optionally redirect to login or handle unauthenticated access
        // For now we allow access but req.auth will be null
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
