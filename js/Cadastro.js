// Client-side cadastro: salva usuário em localStorage e cria token de sessão
function makeToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr));
}

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('cadastroForm');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('Email')?.value.trim();
    const username = document.getElementById('usuario')?.value.trim();
    const password = document.getElementById('Senha')?.value || '';
    if (!email || !username || !password) return alert('Preencha todos os campos.');

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const exists = users.find(u => u.email === email || u.username === username);
    if (exists) return alert('Email ou usuário já cadastrado.');

    const user = { email, username, password };
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    // opcional: salvar para pré-preenchimento no login
    localStorage.setItem('lastRegister', JSON.stringify({ email, password }));

    const token = makeToken();
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    // redireciona para área principal
    window.location.href = 'index.html';
  });
});
