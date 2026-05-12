import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          });

          if (!user || !user.password) return null;

          const { default: bcrypt } = await import("bcryptjs");
          const isValid = await bcrypt.compare(credentials.password as string, user.password);

          if (!isValid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          }
        }
    })
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/")
      // For now, let's keep it open, but we could protect routes here
      return true
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email) {
        try {
          const { prisma } = await import("@/lib/prisma");
          // Force set daily credits to 50 for new users
          await prisma.user.update({
            where: { email: user.email },
            data: {
              dailyCredits: 50,
              creditsLastReset: new Date(),
            }
          });
          
          const { sendWelcomeEmail } = await import("@/lib/emails");
          await sendWelcomeEmail(user.email);
          console.log(`User ${user.email} initialized with 50 credits and welcome email sent.`);
        } catch (error) {
          console.error("Failed to initialize new user:", error);
        }
      }
    }
  }
})
