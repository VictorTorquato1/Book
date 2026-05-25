const API_BASE = (location.origin && location.origin !== 'null' ? location.origin : 'http://localhost:3000') + '/api';

const sidebar = document.getElementById('sidebar');
const openSidebar = document.getElementById('openSidebar');
const closeSidebar = document.getElementById('closeSidebar');

//sidebar fechada
window.addEventListener('DOMContentLoaded', () => {
  sidebar.classList.remove('open');
  document.getElementById('main').classList.remove('shifted');

  openSidebar.addEventListener('click', () => {
    sidebar.classList.add('open');
    document.getElementById('main').classList.add('shifted');
  });
  closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('open');
    document.getElementById('main').classList.remove('shifted');
  });
});
const booksList = document.getElementById('booksList');
const searchInput = document.getElementById('searchInput');
const bookForm = document.getElementById('bookForm');
const resumeTitle = document.getElementById('resumeTitle');
const resumeText = document.getElementById('resumeText');
const deleteBookBtn = document.getElementById('deleteBook');
const deleteAllBtn = document.getElementById('deleteAll');

const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const coverInput = document.getElementById('cover');
const totalPagesInput = document.getElementById('totalPages');
const currentPageInput = document.getElementById('currentPage');
const pdfFileInput = document.getElementById('pdfFile');
const notesInput = document.getElementById('notes');

const pdfWrapper = document.getElementById('pdfWrapper');
const pdfCanvas = document.getElementById('pdfCanvas');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const savePageBtn = document.getElementById('savePage');
const pageIndicator = document.getElementById('pageIndicator');

let books = [];
let selectedBookId = null;
let pdfDoc = null;
let currentPageNum = 1;
let pageCount = 0;
let pdfScale = 1.2;

const pdfAvailable = !!window.pdfjsLib;
let apiAvailable = true;

function closeAllMenus() {
  document.querySelectorAll('.book-menu.show').forEach(menu => menu.classList.remove('show'));
}

function saveLocalBooks() {
  localStorage.setItem('livros', JSON.stringify(books));
}

function loadLocalBooks() {
  const raw = localStorage.getItem('livros');
  books = raw ? JSON.parse(raw) : [];
}

document.addEventListener('click', closeAllMenus);
if (pdfAvailable) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';
}

async function apiFetch(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, options);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${response.status} ${response.statusText} - ${text}`);
    }
    return response;
  } catch (err) {
    apiAvailable = false;
    throw err;
  }
}

async function loadBooks() {
  if (!apiAvailable) {
    loadLocalBooks();
    renderBooks(searchInput.value);
    return;
  }

  try {
    const res = await apiFetch('/books');
    books = await res.json();
    renderBooks(searchInput.value);
  } catch (err) {
    loadLocalBooks();
    renderBooks(searchInput.value);
  }
}


async function togglePin(bookId, pinState) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;

  const updatedBook = { ...book, pin: pinState };

  const formData = new FormData();
  formData.append('title', book.title);
  formData.append('author', book.author);
  formData.append('cover', book.cover || '');
  formData.append('notes', book.notes || '');
  formData.append('lastPage', book.lastPage || '1');
  formData.append('pin', pinState ? 'true' : 'false');

  await updateBook(bookId, formData, updatedBook);
  await loadBooks();
  renderBooks(searchInput.value);
  if (selectedBookId === bookId) await selectBook(bookId);
}

async function deleteIndividualBook(bookId) {
  await deleteBook(bookId);
  if (selectedBookId === bookId) {
    selectedBookId = null;
    resumeTitle.textContent = 'Nenhum livro selecionado';
    resumeText.textContent = 'Clique em um livro na barra lateral para abrir o PDF e continuar a leitura.';
    showPdfWrapper(false);
  }
  await loadBooks();
  renderBooks(searchInput.value);
}

async function createBook(formData, bookItem) {
  if (!apiAvailable) {
    books.push(bookItem);
    saveLocalBooks();
    return bookItem;
  }

  try {
    const res = await apiFetch('/books', { method: 'POST', body: formData });
    return res.json();
  } catch (err) {
    apiAvailable = false;
    books.push(bookItem);
    saveLocalBooks();
    return bookItem;
  }
}

async function updateBook(bookId, formData, bookItem) {
  if (!apiAvailable) {
    const idx = books.findIndex(b => b.id === bookId);
    if (idx >= 0) {
      if (bookItem) {
        books[idx] = bookItem;
      } else {
        books[idx] = {
          ...books[idx],
          title: formData.get('title') || books[idx].title,
          author: formData.get('author') || books[idx].author,
          cover: formData.get('cover') || books[idx].cover,
          notes: formData.get('notes') || books[idx].notes,
          lastPage: Number(formData.get('lastPage')) || books[idx].lastPage,
          pin: formData.get('pin') === 'true' || books[idx].pin,
          favorite: formData.get('favorite') === 'true' || books[idx].favorite || false
        };
      }
    }
    saveLocalBooks();
    return books[idx];
  }

  try {
    const res = await apiFetch(`/books/${bookId}`, { method: 'POST', body: formData });
    return res.json();
  } catch (err) {
    apiAvailable = false;
    const idx = books.findIndex(b => b.id === bookId);
    if (idx >= 0) {
      if (bookItem) {
        books[idx] = bookItem;
      } else {
        books[idx] = {
          ...books[idx],
          title: formData.get('title') || books[idx].title,
          author: formData.get('author') || books[idx].author,
          cover: formData.get('cover') || books[idx].cover,
          notes: formData.get('notes') || books[idx].notes,
          lastPage: Number(formData.get('lastPage')) || books[idx].lastPage,
          pin: formData.get('pin') === 'true' || books[idx].pin,
          favorite: formData.get('favorite') === 'true' || books[idx].favorite || false
        };
      }
    }
    saveLocalBooks();
    return books[idx];
  }
}

async function deleteBook(bookId) {
  if (!apiAvailable) {
    const updated = books.filter(b => b.id !== bookId);
    books = updated;
    saveLocalBooks();
    return;
  }

  try {
    await apiFetch(`/books/${bookId}`, { method: 'DELETE' });
  } catch (err) {
    apiAvailable = false;
    const updated = books.filter(b => b.id !== bookId);
    books = updated;
    saveLocalBooks();
  }
}

async function deleteAllBooks() {
  if (!apiAvailable) {
    books = [];
    saveLocalBooks();
    return;
  }

  try {
    await apiFetch('/books', { method: 'DELETE' });
  } catch (err) {
    apiAvailable = false;
    books = [];
    saveLocalBooks();
  }
}

function formatProgress(book) {
  if (!book) return 'Sem dados';
  if (book.totalPages && book.currentPage) {
    const perc = Math.min(100, Math.max(0, Math.round((Number(book.currentPage) / Number(book.totalPages)) * 100)));
    return `Página ${book.currentPage} de ${book.totalPages} (${perc}%)`;
  }
  if (book.lastPage) {
    return `Última página: ${book.lastPage}`;
  }
  return 'Não iniciado';
}

function renderBooks(filter = '') {
  const q = filter.trim().toLowerCase();
  booksList.innerHTML = '';

  let encontrados = books.filter(b =>
    b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
  );

  encontrados = encontrados.sort((a, b) => {
    if (a.pin === b.pin) return a.title.localeCompare(b.title);
    return a.pin ? -1 : 1;
  });

  if (!encontrados.length) {
    const li = document.createElement('li');
    li.textContent = 'Nenhum livro encontrado.';
    li.style.color = '#879ab0';
    li.style.padding = '10px';
    booksList.appendChild(li);
    return;
  }

  encontrados.forEach(book => {
    const li = document.createElement('li');
    li.className = 'book-card';
    li.tabIndex = 0;
    li.title = 'Clique para abrir o PDF e continuar a leitura';

    // Botão de favorito
    const favBtn = document.createElement('button');
    favBtn.className = 'fav-btn';
    favBtn.title = book.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    favBtn.textContent = book.favorite ? '★' : '☆';
    favBtn.style.color = book.favorite ? '#a11d2f' : '#7a6347';
    favBtn.style.fontSize = '1.4rem';
    favBtn.style.background = 'none';
    favBtn.style.border = 'none';
    favBtn.style.cursor = 'pointer';
    favBtn.style.marginRight = '8px';
    favBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      book.favorite = !book.favorite;
      saveLocalBooks();
      renderBooks(searchInput.value);
    });

    const img = document.createElement('img');
    img.src = book.cover || 'https://via.placeholder.com/42x60?text=Livro';
    img.alt = `${book.title} capa`;

    const info = document.createElement('div');
    info.className = 'book-info';
    info.innerHTML = `<div class="title">${book.title}</div><div class="author">${book.author}</div><div class="progress">${formatProgress(book)}</div>`;

    li.appendChild(favBtn);
    li.appendChild(img);
    li.appendChild(info);

    // ...existing code...
    const actionWrapper = document.createElement('div');
    actionWrapper.style.position = 'relative';
    actionWrapper.style.display = 'flex';
    actionWrapper.style.alignItems = 'center';

    const ellipsisBtn = document.createElement('button');
    ellipsisBtn.className = 'ellipsis-btn';
    ellipsisBtn.textContent = '...';
    ellipsisBtn.addEventListener('click', event => {
      event.stopPropagation();
      closeAllMenus();
      menu.classList.toggle('show');
    });

    const menu = document.createElement('div');
    menu.className = 'book-menu';


    // Botão de adicionar aos favoritos
    const favMenuBtn = document.createElement('button');
    favMenuBtn.textContent = book.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    favMenuBtn.addEventListener('click', e => {
      e.stopPropagation();
      closeAllMenus();
      book.favorite = !book.favorite;
      saveLocalBooks();
      renderBooks();
    });

    const pinBtn = document.createElement('button');
    pinBtn.textContent = book.pin ? 'Desafixar no topo' : 'Fixar no topo';
    pinBtn.addEventListener('click', async e => {
      e.stopPropagation();
      closeAllMenus();
      await togglePin(book.id, !book.pin);
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Excluir livro';
    removeBtn.addEventListener('click', async e => {
      e.stopPropagation();
      closeAllMenus();
      if (!confirm('Tem certeza que deseja excluir este livro?')) return;
      await deleteIndividualBook(book.id);
    });

    menu.appendChild(favMenuBtn);
    menu.appendChild(pinBtn);
    menu.appendChild(removeBtn);

    actionWrapper.appendChild(ellipsisBtn);
    actionWrapper.appendChild(menu);
    li.appendChild(actionWrapper);

    li.addEventListener('click', () => selectBook(book.id));
    li.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectBook(book.id);
      }
    });

    booksList.appendChild(li);
  });
}

function showPdfWrapper(show) {
  pdfWrapper.style.display = show ? 'block' : 'none';
}

function updatePageIndicator() {
  pageIndicator.textContent = `Página ${currentPageNum} / ${pageCount}`;
}

function renderPdfPage(pageNum) {
  if (!pdfDoc) return;
  pdfDoc.getPage(pageNum).then(page => {
    const viewport = page.getViewport({ scale: pdfScale });
    const context = pdfCanvas.getContext('2d');
    pdfCanvas.height = viewport.height;
    pdfCanvas.width = viewport.width;

    page.render({ canvasContext: context, viewport }).promise.then(() => {
      currentPageNum = pageNum;
      updatePageIndicator();
    });
  });
}

async function loadPdfFromBook(book) {
  if (!book || !book.pdfPath || !pdfAvailable) {
    showPdfWrapper(false);
    return;
  }

  try {
    const res = await fetch(book.pdfPath);
    if (!res.ok) throw new Error('Falha ao baixar PDF');
    const arrayBuffer = await res.arrayBuffer();

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    pdfDoc = await loadingTask.promise;
    pageCount = pdfDoc.numPages;
    currentPageNum = book.currentPage || book.lastPage || 1;
    if (currentPageNum < 1) currentPageNum = 1;
    if (currentPageNum > pageCount) currentPageNum = pageCount;
    renderPdfPage(currentPageNum);
    showPdfWrapper(true);
  } catch (err) {
    alert('Erro ao carregar o PDF: ' + err.message);
    showPdfWrapper(false);
  }
}

async function selectBook(bookId) {
  selectedBookId = bookId;
  const book = books.find(b => b.id === bookId);
  if (!book) return;

  resumeTitle.textContent = book.title;
  resumeText.innerHTML = `Autor: <strong>${book.author}</strong><br>Progresso: <strong>${formatProgress(book)}</strong><br>Notas: ${book.notes || '<span style="color: #777;">Sem notas</span>'}`;

  titleInput.value = book.title;
  authorInput.value = book.author;
  coverInput.value = book.cover || '';
  totalPagesInput.value = book.totalPages || 1;
  currentPageInput.value = book.currentPage || 1;
  notesInput.value = book.notes || '';

  if (book.pdfPath) {
    const pdfUrl = book.pdfPath.startsWith('http') ? book.pdfPath : `${location.origin}${book.pdfPath}`;
    window.open(pdfUrl, '_blank');
  }

  await loadPdfFromBook(book);

  if (window.innerWidth < 880) {
    toggleSidebar(false);
  }
}

function toggleSidebar(open) {
  if (open === undefined) open = !sidebar.classList.contains('open');
  sidebar.classList.toggle('open', open);
  document.getElementById('main').classList.toggle('shifted', open);
}

openSidebar.addEventListener('click', () => toggleSidebar(true));
closeSidebar.addEventListener('click', () => toggleSidebar(false));

searchInput.addEventListener('input', event => renderBooks(event.target.value));

prevPageBtn.addEventListener('click', () => {
  if (!pdfDoc || currentPageNum <= 1) return;
  renderPdfPage(currentPageNum - 1);
});

nextPageBtn.addEventListener('click', () => {
  if (!pdfDoc || currentPageNum >= pageCount) return;
  renderPdfPage(currentPageNum + 1);
});

savePageBtn.addEventListener('click', async () => {
  if (!selectedBookId || !pdfDoc) {
    alert('Selecione um livro com PDF carregado primeiro.');
    return;
  }

  const bookIndex = books.findIndex(b => b.id === selectedBookId);
  if (bookIndex < 0) return;

  books[bookIndex].lastPage = currentPageNum;
  books[bookIndex].currentPage = currentPageNum;

  const formData = new FormData();
  formData.append('title', books[bookIndex].title);
  formData.append('author', books[bookIndex].author);
  formData.append('cover', books[bookIndex].cover || '');
  formData.append('notes', books[bookIndex].notes || '');
  formData.append('totalPages', String(books[bookIndex].totalPages || 1));
  formData.append('currentPage', String(books[bookIndex].currentPage || 1));
  formData.append('lastPage', String(books[bookIndex].lastPage));
  formData.append('pin', books[bookIndex].pin ? 'true' : 'false');

  await updateBook(selectedBookId, formData, books[bookIndex]);
  await loadBooks();
  renderBooks(searchInput.value);
  alert(`Posição salva: página ${currentPageNum}`);
});

bookForm.addEventListener('submit', async event => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const cover = coverInput.value.trim();
  const totalPages = Number(totalPagesInput.value) || 1;
  const currentPage = Number(currentPageInput.value) || 1;
  const notes = notesInput.value.trim();
  const file = pdfFileInput.files[0];

  if (!title || !author) {
    alert('Preencha título e autor.');
    return;
  }

  if (currentPage < 1 || totalPages < 1 || currentPage > totalPages) {
    alert('Insira um número de páginas válido.');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('author', author);
  formData.append('cover', cover);
  formData.append('totalPages', String(totalPages));
  formData.append('currentPage', String(currentPage));
  formData.append('notes', notes);

  if (file) {
    if (file.type !== 'application/pdf') {
      alert('Por favor escolha um arquivo PDF.');
      return;
    }
    formData.append('pdfFile', file);
  }

  let saveAsNew = false;
  if (selectedBookId) {
    const selected = books.find(b => b.id === selectedBookId);
    if (selected && (selected.title !== title || selected.author !== author || selected.cover !== cover || Number(selected.totalPages) !== totalPages || Number(selected.currentPage) !== currentPage || (selected.notes || '') !== notes)) {
      saveAsNew = !confirm('Você está editando um livro existente. Clique em OK para atualizar o livro atual ou Cancelar para adicionar um novo livro.');
    }
  }

  if (saveAsNew) {
    selectedBookId = null;
  }

  const bookId = selectedBookId || Date.now().toString();
  const bookItem = {
    id: bookId,
    title,
    author,
    cover,
    totalPages,
    currentPage,
    lastPage: currentPage,
    notes,
    pin: selectedBookId ? (books.find(b => b.id === selectedBookId)?.pin || false) : false,
    pdfPath: selectedBookId ? (books.find(b => b.id === selectedBookId)?.pdfPath || '') : ''
  };

  try {
    if (selectedBookId) {
      await updateBook(selectedBookId, formData, bookItem);
    } else {
      await createBook(formData, bookItem);
    }

    await loadBooks();
    renderBooks(searchInput.value);

    if (selectedBookId) {
      selectBook(selectedBookId);
    } else {
      const added = books[books.length - 1];
      selectBook(added.id);
    }

    alert('Livro salvo com sucesso!');
  } catch (err) {
    alert('Erro ao salvar: ' + err.message);
  }
});

deleteBookBtn.addEventListener('click', async () => {
  if (!selectedBookId) {
    alert('Selecione um livro para excluir.');
    return;
  }

  if (!confirm('Excluir este livro?')) return;

  await deleteBook(selectedBookId);
  selectedBookId = null;
  resumeTitle.textContent = 'Nenhum livro selecionado';
  resumeText.textContent = 'Clique em um livro na barra lateral para abrir o PDF e continuar a leitura.';
  showPdfWrapper(false);

  await loadBooks();
  renderBooks(searchInput.value);
});

deleteAllBtn.addEventListener('click', async () => {
  if (!books.length) {
    alert('Não há livros para excluir.');
    return;
  }

  if (!confirm('Excluir todos os livros?')) return;

  await deleteAllBooks();
  selectedBookId = null;
  resumeTitle.textContent = 'Nenhum livro selecionado';
  resumeText.textContent = 'Clique em um livro na barra lateral para abrir o PDF e continuar a leitura.';
  showPdfWrapper(false);

  await loadBooks();
  renderBooks(searchInput.value);
});

bookForm.addEventListener('reset', () => {
  selectedBookId = null;
  resumeTitle.textContent = 'Nenhum livro selecionado';
  resumeText.textContent = 'Clique em um livro na barra lateral para abrir o PDF e continuar a leitura.';
  showPdfWrapper(false);
});

(async function init() {
  await loadBooks();
  renderBooks();
})();

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') toggleSidebar(false);
});
