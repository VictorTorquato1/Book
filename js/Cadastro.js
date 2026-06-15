document.getElementById('cadastroForm').addEventListener('submit', function (e) {
   e.preventDefault();
   const email = document.getElementById('Email').value.trim();
   const usuario = document.getElementById('usuario').value.trim();
   const senha = document.getElementById('Senha').value;
   const idade = document.getElementById('idade')?.value || '';
   const cidade = document.getElementById('cidade')?.value || '';
   const uf = document.getElementById('uf')?.value || '';
   const endereco = document.getElementById('endereco')?.value || '';
   const bairro = document.getElementById('bairro')?.value || '';
   const numero = document.getElementById('numero')?.value || '';
   const telefone = document.getElementById('telefone')?.value || '';

   if (!email || !usuario || !senha) {
      alert('Preencha os campos obrigatórios: Email, Usuário e Senha.');
      return;
   }

   try {
      const user = {
         email,
         usuario,
         senha,
         idade,
         cidade,
         uf,
         endereco,
         bairro,
         numero,
         telefone,
         createdAt: new Date().toISOString()
      };

      const raw = localStorage.getItem('users');
      const users = raw ? JSON.parse(raw) : [];
      users.push(user);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('lastRegister', JSON.stringify({ email, senha }));

      alert('Cadastro realizado! Você será redirecionado para o login.');
      window.location.href = 'login.html';
   } catch (err) {
      console.error(err);
      alert('Erro ao salvar os dados localmente.');
   }
});