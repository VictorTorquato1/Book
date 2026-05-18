// franquias.js
// Recomendações automáticas de franquias/livros similares

document.addEventListener('DOMContentLoaded', () => {
  renderFranquiasRecomendadas();
});

function getAllBooks() {
  let livros = [];
  if (localStorage.getItem('livros')) {
    livros = JSON.parse(localStorage.getItem('livros'));
  }
  return livros;
}

function renderFranquiasRecomendadas() {
  const container = document.getElementById('franquiasRecomendadas');
  container.innerHTML = '';
  const livros = getAllBooks();
  if (!livros.length) {
    container.innerHTML = '<p style="color:#879ab0;">Nenhum livro cadastrado ainda.</p>';
    return;
  }
  // Recomendações dinâmicas por perfil de biblioteca
  const recomendacoes = gerarRecomendacoesPorGeneros(livros);
  let html = '<h3>Recomendações baseadas nos gêneros dos seus livros:</h3>';
  if (recomendacoes.length) {
    html += '<ul>';
    // Evita duplicatas
    const map = new Map();
    recomendacoes.forEach(rec => {
      const key = rec.title + '|' + rec.author;
      if (!map.has(key)) {
        map.set(key, rec);
        html += `<li><strong>${rec.title}</strong> <span style='color:#8c98a7;'>(${rec.author})</span></li>`;
      }
    });
    html += '</ul>';
  } else {
    html += '<p style="color:#879ab0;">Nenhuma recomendação encontrada.</p>';
  }
  container.innerHTML = html;
}

function gerarRecomendacoesPorGeneros(livros) {
  // Detecta gêneros presentes na biblioteca e recomenda por perfil
  const generosDetectados = new Set();
  const recomendacoes = [];
  livros.forEach(livro => {
    const titulo = livro.title.toLowerCase();
    const autor = livro.author.toLowerCase();
    // Horror/Weird
    if (titulo.match(/rei de amarelo|cthulhu|deus pã|wendigo|casa no limite|horror|lovecraft|chambers|hodgson|machen|blackwood/)
      || autor.match(/lovecraft|chambers|hodgson|machen|blackwood/)) {
      generosDetectados.add('horror');
    }
    // Ficção científica
    if (titulo.match(/fundação|duna|neuromancer|solaris|ficção científica|asimov|herbert|gibson|lem/)
      || autor.match(/asimov|herbert|gibson|lem/)) {
      generosDetectados.add('scifi');
    }
    // Fantasia
    if (titulo.match(/senhor dos anéis|hobbit|nárnia|roda do tempo|fantasia|tolkien|lewis|jordan/)
      || autor.match(/tolkien|lewis|jordan/)) {
      generosDetectados.add('fantasia');
    }
    // Romance policial
    if (titulo.match(/sherlock|poirot|miss marple|agatha christie|arthur conan doyle|detetive|policial/)
      || autor.match(/christie|conan doyle/)) {
      generosDetectados.add('policial');
    }
    // Romance clássico
    if (titulo.match(/orgulho e preconceito|emma|senhora|machado de assis|austen|romance clássico/)
      || autor.match(/austen|machado de assis/)) {
      generosDetectados.add('classico');
    }
  });
  // Recomendações por gênero detectado
  if (generosDetectados.has('horror')) {
    recomendacoes.push(
      { title: 'O Chamado de Cthulhu', author: 'H. P. Lovecraft' },
      { title: 'O Rei de Amarelo', author: 'Robert W. Chambers' },
      { title: 'O Grande Deus Pã', author: 'Arthur Machen' },
      { title: 'O Wendigo', author: 'Algernon Blackwood' }
    );
  }
  if (generosDetectados.has('scifi')) {
    recomendacoes.push(
      { title: 'Duna', author: 'Frank Herbert' },
      { title: 'Neuromancer', author: 'William Gibson' },
      { title: 'Solaris', author: 'Stanislaw Lem' },
      { title: 'Fundação', author: 'Isaac Asimov' }
    );
  }
  if (generosDetectados.has('fantasia')) {
    recomendacoes.push(
      { title: 'O Hobbit', author: 'J. R. R. Tolkien' },
      { title: 'As Crônicas de Nárnia', author: 'C. S. Lewis' },
      { title: 'A Roda do Tempo', author: 'Robert Jordan' }
    );
  }
  if (generosDetectados.has('policial')) {
    recomendacoes.push(
      { title: 'Assassinato no Expresso do Oriente', author: 'Agatha Christie' },
      { title: 'Um Estudo em Vermelho', author: 'Arthur Conan Doyle' }
    );
  }
  if (generosDetectados.has('classico')) {
    recomendacoes.push(
      { title: 'Orgulho e Preconceito', author: 'Jane Austen' },
      { title: 'Senhora', author: 'José de Alencar' },
      { title: 'Dom Casmurro', author: 'Machado de Assis' }
    );
  }
  return recomendacoes;
}


