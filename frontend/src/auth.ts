import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";

const {
  AUTH_MICROSOFT_ENTRA_ID_ID,
  AUTH_MICROSOFT_ENTRA_ID_SECRET,
  AUTH_MICROSOFT_ENTRA_ID_TENANT_ID,
  AUTH_SECRET,
} = process.env;

const graphqlUrl = "http://localhost:5005/graphql";


export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: `https://login.microsoftonline.com/${AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }


        console.log(
          `[AUTH] Attempting login for: ${credentials.username} at ${graphqlUrl}`,
        );

        try {
          const response = await fetch(graphqlUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                mutation($input: LoginRequestInput!) {
                  login(input: $input) {
                    success
                    error {
                      code
                      message
                    }
                    data {
                      token
                      email
                      fullName
                      role
                    }
                  }
                }
              `,
              variables: {
                input: {
                  email: credentials.username,
                  password: credentials.password,
                },
              },
            }),
          });

          const result = await response.json();

          if (result.errors) {
            console.error(
              "[AUTH] GraphQL Errors:",
              JSON.stringify(result.errors, null, 2),
            );
            return null;
          }

          const loginPayload = result.data?.login;
          console.log("[AUTH] Login payload received:", JSON.stringify(loginPayload, null, 2));

          if (!loginPayload || !loginPayload.success) {
            console.error("[AUTH] Login failed:", loginPayload?.error?.message || "Unknown error");
            return null;
          }

          const authResponse = loginPayload.data;
          console.log("[AUTH] Final user data extracted:", authResponse ? "SUCCESS" : "NULL");

          if (!authResponse) {
            return null;
          }

          return {
            id: authResponse.email, // Use email as ID if backend doesn't provide it
            name: authResponse.fullName,
            email: authResponse.email,
            role: authResponse.role,
            accessToken: authResponse.token,
          };
        } catch (error) {
          console.error("Authorization Error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      if (user) {
        token.id = user.id;
        token.role = user.role;
        if (user.accessToken) {
          token.accessToken = user.accessToken;
        }
      }
      if (profile) {
        token.oid = (profile.oid as string) || (profile.sub as string);
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.oid = token.oid as string;
        if (session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
        }
      }
      return session;
    },
  },
  secret: AUTH_SECRET,
  pages: {
    signIn: "/es/auth/login",
  },
  debug: true,
});

// Extend types for NextAuth
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    oid?: string;
    user: {
      id?: string;
      role?: string;
    } & import("next-auth").DefaultSession["user"];
  }

  interface User {
    role?: string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string;
    oid?: string;
    id?: string;
    role?: string;
  }
}
