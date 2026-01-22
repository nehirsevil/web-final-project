const express = require("express");
const path = require("path");
const fs = require("fs");

const DATA_DIR = process.env.DATA_DIR
  ? process.env.DATA_DIR
  : path.join(__dirname, "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// yardımcı fonksiyonlar
function readMessages() {
  try {
    if (!fs.existsSync(MESSAGES_FILE)) return [];
    const raw = fs.readFileSync(MESSAGES_FILE, "utf-8");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function writeMessages(messages) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf-8");
}


app.get("/api/messages", (req, res) => {
  const messages = readMessages();
  res.json(messages);
});

app.post("/api/messages", (req, res) => {
  try {
    const { fullName, email, reason, topic, details } = req.body;

    // Hata kontrolü 
    if (!fullName || !email || !reason || !topic || !details) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const messages = readMessages();

    const newMessage = {
      id: Date.now(),
      fullName,
      email,
      reason,
      topic,
      details,
      status: "new",
      createdAt: new Date().toISOString()
    };

    messages.unshift(newMessage);
    writeMessages(messages);

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: "Message could not be saved." });
  }
});



app.put("/api/messages/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const allowed = ["new", "read", "resolved"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const messages = readMessages();
    const idx = messages.findIndex((m) => m.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: "Message not found." });
    }

    messages[idx].status = status;
    writeMessages(messages);

    res.json(messages[idx]);
  } catch (err) {
    res.status(500).json({ error: "Message could not be updated." });
  }
});


app.delete("/api/messages/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    const messages = readMessages();
    const before = messages.length;
    const updated = messages.filter((m) => m.id !== id);

    if (updated.length === before) {
      return res.status(404).json({ error: "Message not found." });
    }

    writeMessages(updated);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Message could not be deleted." });
  }
});



// SERVER
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

