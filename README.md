<!--
--- Readme.md Snippet without images Start ---
## Tech Stack
cvega21/ai-saas is built on the following main stack:
- [Firebase](https://firebase.google.com/) – Realtime Backend / API
- [Jest](http://facebook.github.io/jest/) – Javascript Testing Framework
- [Node.js](http://nodejs.org/) – Frameworks (Full Stack)
- [React](https://reactjs.org/) – Javascript UI Libraries
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) – Languages
- [TypeScript](http://www.typescriptlang.org) – Languages
- [Autoprefixer](https://github.com/postcss/autoprefixer) – CSS Pre-processors / Extensions
- [ESLint](http://eslint.org/) – Code Review
- [Visual Studio Code](https://code.visualstudio.com/) – Text Editor
- [Yarn](https://yarnpkg.com/) – Front End Package Manager
- [Next.js](https://nextjs.org/) – Frameworks (Full Stack)
- [Prettier](https://prettier.io/) – Code Review

Full tech stack [here](/techstack.md)
--- Readme.md Snippet without images End ---

--- Readme.md Snippet with images Start ---


Full tech stack [here](/techstack.md)
--- Readme.md Snippet with images End ---
-->
<div align="left">

# Chat With Your Code
Chat with your Github repositories, built with LangChain, Supabase, Next.js and Github's API. Uses gpt-3.5-turbo-0125 by default.

## How It Works
1. Log in with Github to get provider token
2. Use provider token to get all public repo metadata
3. Load repo into Supabase
    - Split code into chunks, embed file contents and store with associated metadata in Supabase (pgvector)
4. Begin chat session with repo
    - Load message history from existing chat session or create new one
5. User asks a question
    - Create vector store from existing index (repo was embedded beforehand)
6. Build runnable sequence with langchain
    - Load chat history
    - Clean up original prompt through OpenAI (ie. makes the question more clear)
    - Load context by embedding prompt and running cosine similarity search
    - Run full chain and return stream
    - Callback after chain end stores AI response in chat history DB table


NOTE: This repo is a proof of concept. Security features such as proper auth, RLS, and safe API key handling are not implemented. Don't deploy to production unless you like chaos.


## Tech Stack
cvega21/chat-with-your-code is built on the following main stack:

- <img width='25' height='25' src='https://img.stackshare.io/service/1612/bynNY5dJ.jpg' alt='TypeScript'/> [TypeScript](http://www.typescriptlang.org) – Languages
- <img width='25' height='25' src='https://img.stackshare.io/service/1209/javascript.jpeg' alt='JavaScript'/> [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) – Languages
- <img width='25' height='25' src='https://img.stackshare.io/service/2271/default_068d33483bba6b81ee13fbd4dc7aab9780896a54.png' alt='SQL'/> [SQL](https://en.wikipedia.org/wiki/SQL) – Languages
- <img width='25' height='25' src='https://img.stackshare.io/service/4631/default_c2062d40130562bdc836c13dbca02d318205a962.png' alt='Shell'/> [Shell](https://en.wikipedia.org/wiki/Shell_script) – Languages
- <img width='25' height='25' src='https://img.stackshare.io/service/1020/OYIaJ1KK.png' alt='React'/> [React](https://reactjs.org/) – Javascript UI Libraries
- <img width='25' height='25' src='https://img.stackshare.io/service/8158/default_660b7c41c3ba489cb581eec89c04655404258c19.png' alt='Tailwind CSS'/> [Tailwind CSS](https://tailwindcss.com) – Front-End Frameworks
- <img width='25' height='25' src='https://img.stackshare.io/service/5936/nextjs.png' alt='Next.js'/> [Next.js](https://nextjs.org/) – Frameworks (Full Stack)
- <img width='25' height='25' src='https://img.stackshare.io/service/12323/Z_q3YLKR_400x400.jpg' alt='Supabase'/> [Supabase](https://supabase.com/) – Realtime Backend / API
- <img width='25' height='25' src='https://img.stackshare.io/service/48790/default_5b6c6b73f1ff3775c85d2a1ba954cb87e30cbf13.jpg' alt='LangChain'/> [LangChain](https://github.com/hwchase17/langchain) – Large Language Model Tools
- <img width='25' height='25' src='https://img.stackshare.io/service/48786/default_8b1119bcbb159cebebc2f6cfc9cd2e359b169d22.jpg' alt='OpenAI'/> [OpenAI](https://openai.com/) – Large Language Models
- <img width='25' height='25' src='https://img.stackshare.io/service/9827/octokit-dotnet_2.png' alt='Octokit'/> [Octokit](https://github.com/octokit/octokit.net) – GitHub API SDK
- <img width='25' height='25' src='https://img.stackshare.io/service/101756/default_4f2991cba3ec7fdd1cc87de69f4868157b0f2001.png' alt='Vercel AI SDK'/> [Vercel AI SDK](https://sdk.vercel.ai/docs) – Large Language Model Tools
