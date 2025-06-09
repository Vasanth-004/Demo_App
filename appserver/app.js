import express from "express";

const app = express();

app.use(express.json());

const pushedItems = ["Fruits","Groceries","etc"];

app.post("/push", (req, res) => {
  const { item } = req.body;
  if (!item) {
    return res.status(400).json({ error: "No item provided" });
  }
  pushedItems.push(item);
  return res.status(201).json({ message: "Item pushed successfully", item });

  console.log()
});

app.get("/items", (req, res) => {
  return res.json({ items: pushedItems });
});

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Push Action Express App!");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
