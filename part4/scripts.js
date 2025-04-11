/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById("login-form");
  const selectOption = document.getElementById('price-filter');
  let allPlaces = [];

  if (selectOption) {
    const filterValues = [10, 50, 100, 'All'];

    filterValues.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;

      if (value === "All") {
        option.selected = true;
      }

      selectOption.appendChild(option);
    });
  }

  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
  function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.querySelector('.login-button');
    const placeReview = document.getElementById('place-details');
    const addReview = document.getElementById('add-review');
  
    if (!token) {
        loginLink.style.display = 'block';
        if (placeReview) {
          addReview.style.display = 'none';
          let placeId = getPlaceIdFromURL();
          fetchPlaceDetails(token, placeId);
        }
    } else {
        loginLink.style.display = 'none';
        if (placeReview) {
          addReview.style.display = 'block';
          let placeId = getPlaceIdFromURL();
          fetchPlaceDetails(token, placeId);
        }
    }
  }

  async function fetchPlaces(token) {
    try {
      const headers = {
        "Content-Type": "application/json"
      };
  
      if (token) {
        headers["Authorization"] = `Bearer: ${token}`;
      }
  
      const response = await fetch("http://localhost:5000/api/v1/places/", {
        method: "GET",
        headers: headers,
      });

      const data = await response.json();

      if (response.ok) {
        allPlaces = data;
        if (selectOption) {
          displayPlaces(data);
        }
      } else {
        alert('AJAX Fetching error: ' + response.statusText);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  function displayPlaces(places) {
    const placeList = document.getElementById('places-list');
    placeList.innerHTML = '';

    places.forEach(place => {
      const placeDiv = document.createElement('div');
      placeDiv.classList.add('place');

      const placeName = document.createElement('h3');
      placeName.textContent = `${place.title}`;
      placeDiv.appendChild(placeName);

      const placePrice = document.createElement('p');
      placePrice.textContent = `Price per night: $${place.price}`;
      placeDiv.appendChild(placePrice);

      const placeButton = document.createElement('button');
      placeButton.textContent = "View Details";
      placeButton.addEventListener("click", () => {
        window.location.href = `place.html?id=${place.id}`;
      });
      placeDiv.appendChild(placeButton);

      placeList.appendChild(placeDiv);
    })
  }

  if (selectOption) {
    selectOption.addEventListener('change', (event) => {
      const selectedPrice = event.target.value;
    
      if (allPlaces.length === 0) {
        return;
      }
      if (selectedPrice === "All") {
        displayPlaces(allPlaces);
      } else {
        const filtered = allPlaces.filter(place => place.price <= selectedPrice);
        displayPlaces(filtered);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
  
      try {
        const response = await fetch("http://localhost:5000/api/v1/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          document.cookie = `token=${data.access_token}; path=/`;
          window.location.href = "./index.html";
        } else {
          alert('Login failed: ' + response.statusText);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    });
  }

  function getPlaceIdFromURL() {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const placeId = params.get("id");
    return placeId;
  }

  async function getReviewOwner(userId) {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        alert('AJAX Fetching error: ' + response.statusText);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  async function displayPlaceDetails(place) {
    const placeDetails = document.getElementById('place-details');
  
    // Place Détails :

    const placeTitle = document.createElement('h3');
    placeTitle.classList.add('place_h3');
    placeTitle.textContent = `${place.title}`;
    placeDetails.appendChild(placeTitle);
    
    const placeDiv = document.createElement('div');
    placeDiv.classList.add('place_detail_div');
    
    const placeHost = document.createElement('p');
    placeHost.innerHTML = `<strong>Host:</strong> ${place.owner.last_name} ${place.owner.first_name}`;
    placeDiv.appendChild(placeHost);

    const placePrice = document.createElement('p');
    placePrice.innerHTML = `<strong>Price per night:</strong> $${place.price}`;
    placeDiv.appendChild(placePrice);

    const placeDescription = document.createElement('p');
    placeDescription.innerHTML = `<strong>Description:</strong> ${place.description}`;
    placeDiv.appendChild(placeDescription);

    const placeAmenities = document.createElement('p');
    placeAmenities.innerHTML = `<strong>Amenities:</strong> ${place.amenities}`;
    placeDiv.appendChild(placeAmenities);

    // Place Reviews Détails :

    const placeReviewsDiv = document.createElement('div');
    placeReviewsDiv.classList.add('place_review_div');

    const reviewSectionTitle = document.createElement('h3');
    reviewSectionTitle.classList.add('review_h3');
    reviewSectionTitle.textContent = "Reviews";
    placeReviewsDiv.appendChild(reviewSectionTitle);

    for (let review of place.reviews) {
      let reviewDiv = document.createElement('div');
      reviewDiv.classList.add('review_div');
      let ownerInfos = await getReviewOwner(review.user_id);

      let reviewHostName = document.createElement('p');
      reviewHostName.innerHTML = `<strong>${ownerInfos.last_name} ${ownerInfos.first_name}:</strong>`;
      reviewDiv.appendChild(reviewHostName);

      let reviewText = document.createElement('p');
      reviewText.textContent = `${review.text}`;
      reviewDiv.appendChild(reviewText);

      let reviewRate = document.createElement('p');
      reviewRate.textContent = `Rating: ${review.rating}`;
      reviewDiv.appendChild(reviewRate);

      placeReviewsDiv.appendChild(reviewDiv);
    }

    // Append to DOM :

    placeDetails.appendChild(placeDiv);
    placeDetails.appendChild(placeReviewsDiv);

    // Clear the current content of the place details section
    // Create elements to display the place details (name, description, price, amenities and reviews)
    // Append the created elements to the place details section
  }

  async function fetchPlaceDetails(token, placeId) {
    try {
      const headers = {
        "Content-Type": "application/json"
      };
  
      if (token) {
        headers["Authorization"] = `Bearer: ${token}`;
      }
  
      const response = await fetch(`http://localhost:5000/api/v1/places/${placeId}`, {
        method: "GET",
        headers: headers,
      });

      const data = await response.json();

      if (response.ok) {
        displayPlaceDetails(data);
      } else {
        alert('AJAX Fetching error: ' + response.statusText);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  if (!loginForm) {
    const token = getCookie('token');
    checkAuthentication();
    if (selectOption) {
      fetchPlaces(token); 
    }
  }
});