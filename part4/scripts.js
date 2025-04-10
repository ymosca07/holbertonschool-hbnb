/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
          event.preventDefault();

          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;

          try {
              const response = await fetch('http://localhost:5500/login.html', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ email, password })
              });

              if (response.ok) {
                  const data = await response.json();

                  // Stocker le token JWT dans un cookie
                  document.cookie = `token=${data.access_token}; path=/;`;

                  // Redirection vers la page principale
                  window.location.href = 'index.html';
              } else {
                  const errorText = await response.text();
                  alert('Login failed: ' + errorText);
              }
          } catch (error) {
              console.error('Erreur lors de la requête:', error);
              alert('Une erreur est survenue. Réessaie plus tard.');
          }
      });
  }
});

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');

  if (!token) {
      loginLink.style.display = 'block';
  } else {
      loginLink.style.display = 'none';
      fetchPlaces(token);
  }
}

async function fetchPlaces(token) {
  try {
      const response = await fetch('http://localhost:5001/api/v1/places', {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      if (!response.ok) throw new Error('Erreur lors du chargement des places');

      const data = await response.json();
      displayPlaces(data);
  } catch (error) {
      console.error(error);
      alert("Impossible de charger les lieux.");
  }
}

