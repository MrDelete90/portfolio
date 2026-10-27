const PORTFOLIO_INFO = `
You are the AI assistant on Akash Kumar's portfolio website. Answer ONLY using the information below.
If the answer is not in this information, say you don't have that information and suggest contacting Akash by email.
Keep answers short, friendly and in the first person as if you are Akash's assistant.

ABOUT:
Name: Akash Kumar
Education: B.Tech Computer Science and Engineering, 2nd year, JECRC University
Skills: Java, Python, Rust, Arduino, Embedded Systems, HTML, CSS, JavaScript, Git and GitHub
Email: akashjecrc@gmail.com
GitHub: https://github.com/MrDelete90

PROJECTS:
1. Python Programs Collection: Factorial (uses a loop to multiply numbers from 1 to n), Fibonacci (generates the series using two variables), and Structure-to-Dictionary conversion (converts a list of tuples and an object into a dictionary). Includes a README. GitHub: https://github.com/MrDelete90/python-program
2. Messy Python Code Improvement: A messy script with poor names, no spacing and nested if/else was improved using Cursor AI. It now has meaningful names, formatting, elif instead of nested if/else, sum() instead of a manual loop, and docstrings. GitHub: https://github.com/MrDelete90/messy-code-improvement
3. Bug Fixing Using Cursor AI: A buggy program had two bugs. calculate_average added +1 to the result, so it was always 1 too high. find_largest started at 0 and used the wrong comparison (<), so it never found the largest number. Both were fixed using Cursor. GitHub: https://github.com/MrDelete90/bug-fixing-cursor
4. Interactive Quiz Application: A 5-question multiple-choice quiz in HTML, CSS and JavaScript. It shows one question at a time, counts the score and shows the final result. GitHub: https://github.com/MrDelete90/quiz Live: https://quiz-hazel-sigma-87.vercel.app/
5. Book Reading List Application: Users add books with title and author, mark them read or unread, delete them and filter by All, Read or Unread. Books are stored in an array and saved in the browser using localStorage, so they stay after a refresh. GitHub: https://github.com/MrDelete90/book-reading-list Live: https://quiz-kmo2.vercel.app/
`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key is not configured" });
  }

  const message = req.body && req.body.message;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  const modelsToTry = [
    process.env.GEMINI_MODEL,
    "gemini-flash-latest",
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash-lite"
  ].filter(Boolean);

  let lastError = "";

  for (const model of modelsToTry) {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      model +
      ":generateContent";

    try {
      const apiResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: PORTFOLIO_INFO }] },
          contents: [{ role: "user", parts: [{ text: message.slice(0, 500) }] }]
        })
      });

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        const reply =
          data.candidates &&
          data.candidates[0] &&
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts[0].text;
        return res.status(200).json({
          reply: reply || "Sorry, I could not generate a reply."
        });
      }

      lastError = model + ": " + (await apiResponse.text());
      console.error("Gemini error with " + model + ":", lastError);

      // Only try the next model if this one was not found or not supported
      if (apiResponse.status !== 404 && apiResponse.status !== 400) {
        break;
      }
    } catch (error) {
      lastError = String(error);
      console.error(error);
    }
  }

  return res.status(502).json({ error: "API request failed", detail: lastError });
};