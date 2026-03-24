// colecoes.js
// Gerencia coleções (pastas) de livros

let colecoes = [];

function saveLocalColecoes() {
  localStorage.setItem('colecoes', JSON.stringify(colecoes));
}

function loadLocalColecoes() {
  const raw = localStorage.getItem('colecoes');
  colecoes = raw ? JSON.parse(raw) : [];
}

function renderColecoes() {
  const container = document.getElementById('colecoesContainer');
  container.innerHTML = '';
  if (!colecoes.length) {
    container.innerHTML = '<p style="color:#879ab0;">Nenhuma coleção criada ainda.</p>';
    return;
  }
  colecoes.forEach((col, idx) => {
    const div = document.createElement('div');
    div.className = 'colecao-card';
    div.style.marginBottom = '14px';
    div.innerHTML = `<strong>${col.nome}</strong> <span style='color:#8c98a7;'>(Livros: ${col.livros.length})</span>`;
    div.style.cursor = 'pointer';
    div.addEventListener('click', () => {
      renderLivrosColecao(idx);
    });
    container.appendChild(div);
  });
}

function renderLivrosColecao(idx) {
  const col = colecoes[idx];
  const container = document.getElementById('colecoesContainer');
  container.innerHTML = `<h3>${col.nome}</h3>`;
  const livros = getAllBooks();
  // Livros já na coleção
  const lista = document.createElement('ul');
  lista.style.marginBottom = '18px';
  col.livros.forEach(lid => {
    const livro = livros.find(b => b.id === lid);
    if (!livro) return;
    const li = document.createElement('li');
    li.textContent = `${livro.title} (${livro.author})`;
    const rmvBtn = document.createElement('button');
    rmvBtn.textContent = 'Remover';
    rmvBtn.style.marginLeft = '10px';
    rmvBtn.onclick = () => {
      col.livros = col.livros.filter(id => id !== lid);
      saveLocalColecoes();
      renderLivrosColecao(idx);
    };
    li.appendChild(rmvBtn);
    lista.appendChild(li);
  });
  container.appendChild(lista);

  // Adicionar novos livros
  const addDiv = document.createElement('div');
  addDiv.innerHTML = '<strong>Adicionar livro à coleção:</strong>';
  const select = document.createElement('select');
  select.style.marginRight = '8px';
  livros.filter(b => !col.livros.includes(b.id)).forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.id;
    opt.textContent = `${b.title} (${b.author})`;
    select.appendChild(opt);
  });
  const addBtn = document.createElement('button');
  addBtn.textContent = 'Adicionar';
  addBtn.onclick = () => {
    if (!select.value) return;
    col.livros.push(select.value);
    saveLocalColecoes();
    renderLivrosColecao(idx);
  };
  addDiv.appendChild(select);
  addDiv.appendChild(addBtn);
  container.appendChild(addDiv);

  // Voltar
  const backBtn = document.createElement('button');
  backBtn.textContent = 'Voltar para coleções';
  backBtn.style.marginTop = '18px';
  backBtn.onclick = () => renderColecoes();
  container.appendChild(backBtn);
}

function getAllBooks() {
  let livros = [];
  if (localStorage.getItem('livros')) {
    livros = JSON.parse(localStorage.getItem('livros'));
  }
  return livros;
}

function criarColecao() {
  const nome = prompt('Nome da nova coleção:');
  if (!nome) return;
  if (colecoes.some(c => c.nome === nome)) {
    alert('Já existe uma coleção com esse nome.');
    return;
  }
  colecoes.push({ nome, livros: [] });
  saveLocalColecoes();
  renderColecoes();
}

document.addEventListener('DOMContentLoaded', () => {
  loadLocalColecoes();
  renderColecoes();
  const btn = document.getElementById('criarColecaoBtn');
  if (btn) btn.addEventListener('click', criarColecao);
});
