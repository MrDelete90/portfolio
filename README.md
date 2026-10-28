# Akash Kumar | Personal Portfolio

A responsive personal portfolio website with project search, light/dark mode and an AI chatbot that answers questions about my skills and projects.

## Live Website
https://portfolio-nine-eosin-94.vercel.app/

## Features
- Sections: Home, About Me, Skills, Projects, Contact Information, AI Chatbot
- Sticky navigation bar and responsive layout for desktop and mobile
- Five project cards with GitHub and live demo links
- Project search by name or technology (for example Python, Quiz, Book)
- Light/dark mode toggle
- AI chatbot that answers using my portfolio information

## Projects Showcased
1. Python Programs Collection
2. Messy Python Code Improvement
3. Bug Fixing Using Cursor AI
4. Interactive Quiz Application
5. Book Reading List Application

## Technologies Used
HTML, CSS, JavaScript, Vercel serverless function, Groq API, GitHub, Cursor AI

## How the Chatbot Works
The browser sends the question to `/api/chat`, a Vercel serverless function. The function holds the secret API key in an environment variable, sends my portfolio information and the question to the Groq API, and returns the reply. The key is never stored in the code or on GitHub.

## Setup Instructions
1. Clone the repository: `git clone https://github.com/MrDelete90/portfolio.git`
2. Open the folder in Cursor or VS Code.
3. For the chatbot, create a free key at console.groq.com and add it as the environment variable `GROQ_API_KEY` (in Vercel, or in a local `.env` file).
4. Deploy by importing the repository into Vercel.

## Contact
- Email: akashjecrc@gmail.com
- GitHub: https://github.com/MrDelete90
