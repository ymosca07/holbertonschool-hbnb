document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const reviewForm = document.getElementById('review-form');
    const placeInfo = document.getElementById('place-info');
    const loginLink = document.getElementById('login-link');
  
    // Login form
    if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
  
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
  
        try {
          const response = await fetch('http://127.0.0.1:5001/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });
  
          if (response.ok) {
            const data = await response.json();
            document.cookie = `token=${data.access_token}; path=/;`;
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
  
    // Affichage des places
    if (window.location.pathname.includes("index.html")) {
      checkAuthentication();
      setupFilterListener();
    }
  
    // Affichage d'un lieu en détail
    if (placeInfo) {
      const placeId = getPlaceIdFromURL();
      if (placeId) {
        fetch(`http://127.0.0.1:5001/api/v1/places/${placeId}`)
          .then(res => res.json())
          .then(place => {
            placeInfo.innerHTML = `
              <h2>${place.name}</h2>
              <p>Description : ${place.description}</p>
              <p>Price per night : ${place.price}€</p>
              <p>Host : ${place.host}</p>
              <p>Amenities : ${place.amenities.join(', ')}</p>
            `;
          });
      }
    }
  
    // Soumission d'une review
    if (reviewForm) {
      const token = getCookie('token');
      if (!token) {
        window.location.href = 'index.html';
      }
  
      const placeId = getPlaceIdFromURL();
      reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const review = document.getElementById('review').value;
        const rating = document.getElementById('rating').value;
  
        try {
          const res = await fetch('http://127.0.0.1:5001/api/v1/reviews', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ review, rating, place_id: placeId })
          });
  
          if (res.ok) {
            alert('Review submitted successfully!');
            reviewForm.reset();
          } else {
            alert('Failed to submit review.');
          }
        } catch (err) {
          console.error(err);
          alert('Erreur réseau.');
        }
      });
    }
  });
  
  // Fonctions utilitaires
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
  
  function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }
  
  function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');
    if (!token) {
      if (loginLink) loginLink.style.display = 'block';
    } else {
      if (loginLink) loginLink.style.display = 'none';
      fetchPlaces(token);
    }
  }
  
  async function fetchPlaces(token) {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/v1/places', {
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
  
  function displayPlaces(places) {
    const container = document.getElementById('places-list');
    container.innerHTML = '';
    places.forEach(place => {
      const card = document.createElement('div');
      card.className = 'place-card';
      card.setAttribute('data-price', place.price);
      card.innerHTML = `
        <h2>${place.name}</h2>
        <p>Prix par nuit : ${place.price}€</p>
        <a href="place.html?id=${place.id}" class="details-button">Détails de l'annonce</a>
      `;
      container.appendChild(card);
    });
  }
  
  document.getElementById('price-filter').addEventListener('change', (event) => {
    const selected = event.target.value;
    const maxPrice = selected === 'all' ? Infinity : parseInt(selected);
  
    const cards = document.querySelectorAll('.place-card');
  
    cards.forEach(card => {
      const price = parseInt(card.getAttribute('data-price'));
      if (price <= maxPrice) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
  
  