import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import { FirestoreAdapter } from '@auth/firebase-adapter'

export default NextAuth({
    adapter: FirestoreAdapter(),
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
    ],
})
