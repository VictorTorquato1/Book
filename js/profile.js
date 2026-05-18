// Lógica do perfil do usuário

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userEmail').textContent = user.email;
  if (user.photo) {
    document.getElementById('userPhoto').src = user.photo;
  }

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  });

  document.getElementById('photoForm').addEventListener('submit', e => {
    e.preventDefault();
    const fileInput = document.getElementById('photoInput');
    const file = fileInput.files[0];
    if (!file) return alert('Selecione uma foto.');
    const reader = new FileReader();
    reader.onload = function (evt) {
      user.photo = evt.target.result;
      localStorage.setItem('user', JSON.stringify(user));
      document.getElementById('userPhoto').src = user.photo;
      alert('Foto atualizada!');
    };
    reader.readAsDataURL(file);
  });
});
