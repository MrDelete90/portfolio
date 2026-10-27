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

const BASE_URL = "https://api.groq.com/openai/v1";

async function askModel(apiKey, model, message) {
  return fetch(BASE_URL + "/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: PORTFOLIO_INFO },
        { role: "user", content: message.slice(0, 500) }
      ],
      temperature: 0.4,
      max_tokens: 400
    })
  });
}

// Ask Groq which models this key can use (skips audio/safety models)
async function discoverModels(apiKey) {
  try {
    const r = await fetch(BASE_URL + "/models", {
      headers: { "Authorization": "Bearer " + apiKey }
    });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.data || [])
      .map(function (m) { return m.id; })
      .filter(function (id) {
        return !/whisper|tts|guard|orpheus|playai|safeguard|embed/i.test(id);
      })
      .slice(0, 6);
  } catch (e) {
    return [];
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key is not configured" });
  }

  const message = req.body && req.body.message;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  let models = [
    process.env.GROQ_MODEL,
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant"
  ].filter(Boolean);

  let lastError = "";
  let discovered = false;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const apiResponse = await askModel(apiKey, model, message);

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        const reply =
          data.choices &&
          data.choices[0] &&
          data.choices[0].message &&
          data.choices[0].message.content;
        return res.status(200).json({
          reply: reply || "Sorry, I could not generate a reply."
        });
      }

      lastError = model + ": " + (await apiResponse.text());
      console.error("Groq error with " + model + ":", lastError);

      // Not found / not supported: try the next one
      if (apiResponse.status === 404 || apiResponse.status === 400) {
        // After the built-in names fail, add models the key can actually use
        if (i === models.length - 1 && !discovered) {
          discovered = true;
          const found = await discoverModels(apiKey);
          models = models.concat(
            found.filter(function (id) { return models.indexOf(id) === -1; })
          );
        }
        continue;
      }
      break; // wrong key, rate limit, etc: stop
    } catch (error) {
      lastError = String(error);
      console.error(error);
      break;
    }
  }

  return res.status(502).json({ error: "API request failed", detail: lastError });
};