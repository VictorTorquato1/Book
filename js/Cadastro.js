document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = prompt('Digite seu email para cadastro:').trim();
  const password = prompt('Digite uma senha:');
  if (!name || !email || !password) return alert('Preencha todos os campos.');
  try {
     const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
     });
     if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Erro ao registrar.');
        return;
     }
     //salvamento de credencial
     localStorage.setItem('lastRegister', JSON.stringify({ email, password }));
     alert('Cadastro realizado! Faça login.');
     window.location.href = 'login.html';
  } catch (err) {
     alert('Erro ao conectar ao servidor.');
  }
});