const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const dataPath = path.join(__dirname, 'books.json');
const uploadPath = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});
const upload = multer({ storage });

app.use(cors());
app.options('/api/*', cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadPath));

function readBooks() {
  if (!fs.existsSync(dataPath)) return [];
  const content = fs.readFileSync(dataPath, 'utf8');
  try {
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function writeBooks(books) {
  fs.writeFileSync(dataPath, JSON.stringify(books, null, 2), 'utf8');
}

app.get('/api/books', (req, res) => {
  res.json(readBooks());
});

app.post('/api/books', upload.single('pdfFile'), (req, res) => {
  const { title, author, cover, notes, lastPage } = req.body;
  if (!title || !author) {
    return res.status(400).send('Título e autor são obrigatórios');
  }

  const books = readBooks();
  const newBook = {
    id: Date.now().toString(),
    title: title.trim(),
    author: author.trim(),
    cover: cover?.trim() || '',
    notes: notes?.trim() || '',
    pdfPath: req.file ? `/uploads/${req.file.filename}` : '',
    lastPage: Number(lastPage) || 1,
    pin: req.body.pin === 'true' || false
  };

  books.push(newBook);
  writeBooks(books);

  res.status(201).json(newBook);
});

function modifyExistingBook(req, res) {
  const { id } = req.params;
  const { title, author, cover, notes, lastPage } = req.body;
  const books = readBooks();
  const index = books.findIndex(b => b.id === id);

  if (index < 0) return res.status(404).send('Livro não encontrado');

  const book = books[index];
  if (req.file && book.pdfPath) {
    const oldPdfPath = path.join(__dirname, book.pdfPath);
    if (fs.existsSync(oldPdfPath)) fs.unlinkSync(oldPdfPath);
  }

  book.title = title?.trim() || book.title;
  book.author = author?.trim() || book.author;
  book.cover = cover?.trim() || book.cover;
  book.notes = notes?.trim() || book.notes;
  book.lastPage = Number(lastPage) || book.lastPage;
  book.pin = req.body.pin === 'true' || book.pin || false;
  book.pdfPath = req.file ? `/uploads/${req.file.filename}` : book.pdfPath;

  books[index] = book;
  writeBooks(books);

  res.json(book);
}

app.put('/api/books/:id', upload.single('pdfFile'), modifyExistingBook);
app.post('/api/books/:id', upload.single('pdfFile'), modifyExistingBook);

app.delete('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const books = readBooks();
  const book = books.find(b => b.id === id);

  if (!book) return res.status(404).send('Livro não encontrado');

  if (book.pdfPath) {
    const filePath = path.join(__dirname, book.pdfPath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  const updated = books.filter(b => b.id !== id);
  writeBooks(updated);
  res.sendStatus(204);
});

app.delete('/api/books', (req, res) => {
  const books = readBooks();
  books.forEach(book => {
    if (book.pdfPath) {
      const filePath = path.join(__dirname, book.pdfPath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  });

  writeBooks([]);
  res.sendStatus(204);
});

app.get('/api/books/:id/pdf', (req, res) => {
  const { id } = req.params;
  const books = readBooks();
  const book = books.find(b => b.id === id);
  if (!book || !book.pdfPath) return res.status(404).send('PDF não encontrado');

  const filePath = path.join(__dirname, book.pdfPath);
  if (!fs.existsSync(filePath)) return res.status(404).send('PDF não encontrado');

  res.sendFile(filePath);
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
