const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json());

const filePath = "books.json";
function readBooks() {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeBooks(books) {
  fs.writeFileSync(filePath, JSON.stringify(books, null, 2));
}

app.get("/books", (req, res) => {
  res.json(readBooks());
});
app.get("/books/available", (req, res) => {
  const books = readBooks().filter(b => b.available);
  res.json(books);
});

app.post("/books", (req, res) => {
  const books = readBooks();
  const { title, author, available } = req.body;
  if (!title || !author || available === undefined)
    return res.status(400).json({ error: "Invalid book data" });

  const id = books.length ? books[books.length - 1].id + 1 : 1;
  const newBook = { id, title, author, available };
  books.push(newBook);
  writeBooks(books);
  res.status(201).json(newBook);
});

// PUT update book
app.put("/books/:id", (req, res) => {
  const books = readBooks();
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);
  if (!book) return res.status(404).json({ error: "Book not found" });

  const { title, author, available } = req.body;
  if (title !== undefined) book.title = title;
  if (author !== undefined) book.author = author;
  if (available !== undefined) book.available = available;

  writeBooks(books);
  res.json(book);
});

// DELETE book
app.delete("/books/:id", (req, res) => {
  let books = readBooks();
  const id = parseInt(req.params.id);
  const index = books.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ error: "Book not found" });

  const deleted = books.splice(index, 1);
  writeBooks(books);
  res.json(deleted[0]);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
