import { withAuth } from "next-auth/middleware"

const PUBLIC_PATHS = [
  "/auth",
  "/auth/signin",
  "/auth/signup",
  "/api/auth",
  "/api/auth/signin",
  "/api/auth/signup",
  "/api/auth/callback",
  "/api/cron/fetch-albums",
]

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path))
}

export default withAuth(
  function middleware() {
    // `withAuth` handles redirects based on the `authorized` callback
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl

        // Allow Next.js internals and static assets
        if (
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon") ||
          pathname.match(/\.(.*)$/)
        ) {
          return true
        }

        // Allow public paths (auth pages, auth APIs, cron endpoint)
        if (isPublic(pathname)) {
          return true
        }

        // Require authentication for everything else
        return !!token
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
)

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}


