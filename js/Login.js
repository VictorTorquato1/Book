window.addEventListener('DOMContentLoaded', function() {
  // Pré-preencher com último registro
  const last = localStorage.getItem('lastRegister');
  if (last) {
    try {
      const { email, password } = JSON.parse(last);
      const usuarioField = document.getElementById('usuario');
      const senhaField = document.getElementById('senha');
      if (usuarioField) usuarioField.value = email || '';
      if (senhaField) senhaField.value = password || '';
      localStorage.removeItem('lastRegister');
    } catch {}
  }

  // Botão cadastro
  const cadastroBtn = document.getElementById('btnCadastro');
  if (cadastroBtn) {
    cadastroBtn.addEventListener('click', function() {
      window.location.href = 'Cadastro.html';
    });
  }

  // Submit do formulário de login
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('usuario').value.trim();
    const password = document.getElementById('senha').value;
    if (!email || !password) return alert('Preencha todos os campos.');

    // Verifica usuários salvos no localStorage (email ou username)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const found = users.find(u => u.email === email || u.username === email);
    if (found) {
      if (found.password === password) {
        const arr = new Uint8Array(32);
        crypto.getRandomValues(arr);
        const token = btoa(String.fromCharCode(...arr));
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(found));
        window.location.href = 'index.html';
        return;
      } else {
        return alert('Senha incorreta.');
      }
    }

    // Se não encontrar localmente, tenta backend (se existir)
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Erro ao fazer login.');
        return;
      }
      const user = await res.json();
      const arr = new Uint8Array(32);
      crypto.getRandomValues(arr);
      const token = btoa(String.fromCharCode(...arr));
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      window.location.href = 'index.html';
    } catch (err) {
      alert('Erro ao conectar ao servidor.');
    }
  });
});