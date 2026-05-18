// favoritos.js
// Exibe apenas livros favoritos na página favoritos.html

let favoritosBooks = [];

function renderFavoritos() {
  const container = document.getElementById('favoritosContainer');
  container.innerHTML = '';
  if (!favoritosBooks.length) {
    container.innerHTML = '<p style="color:#879ab0;">Nenhum favorito encontrado.</p>';
    return;
  }
  favoritosBooks.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.style.marginBottom = '12px';
    card.style.cursor = 'pointer';

    const img = document.createElement('img');
    img.src = book.cover || 'https://via.placeholder.com/42x60?text=Livro';
    img.alt = `${book.title} capa`;
    img.style.marginRight = '12px';

    const info = document.createElement('div');
    info.className = 'book-info';
    info.innerHTML = `<div class="title">${book.title}</div><div class="author">${book.author}</div>`;

    card.appendChild(img);
    card.appendChild(info);
    card.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
    container.appendChild(card);
  });
}

function loadFavoritos() {
  let livros = [];
  if (localStorage.getItem('livros')) {
    livros = JSON.parse(localStorage.getItem('livros'));
  }
  favoritosBooks = livros.filter(b => b.favorite);
  renderFavoritos();
}

document.addEventListener('DOMContentLoaded', loadFavoritos);
