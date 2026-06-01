window.addEventListener('DOMContentLoaded', function() {
  const cadastroBtn = document.getElementById('btnCadastro');
  if (cadastroBtn) {
    cadastroBtn.addEventListener('click', function() {
      window.location.href = 'Cadastro.html';
    });
  }
});
