// Toggle favorite heart icon
function toggleFavorite(el) {
  el.classList.toggle('favorited');
}

// Autocomplete for destination search
const destinations = [
  'Kozhikode',
  'Kochi',
  'Kolkata',
  'Kodaikanal',
  'Kovalam',
  'Kollam',
  'Kuala Lumpur',
  'Kobe',
  'Kostroma',
  'Kostanay',
  'Kozani',
  'Kozhikode Beach',
  'Kozienice',
  'Kozmodemyansk',
  'Kozova',
  'Kozel',
  'Kozani Airport',
  'Kozloduy',
  'Kozienice Power Station',
  'Kozhikode Railway Station'
];

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Autocomplete functionality
  // const input = document.getElementById('destination-input');
  // const list = document.getElementById('autocomplete-list');
  // let currentFocus = -1;

  // if (input && list) {
  //   input.addEventListener('input', function() {
  //     const val = this.value.trim().toLowerCase();
  //     list.innerHTML = '';
  //     if (!val) {
  //       list.classList.remove('active');
  //       return;
  //     }
  //     const matches = destinations.filter(d => d.toLowerCase().includes(val));
  //     if (matches.length === 0) {
  //       list.classList.remove('active');
  //       return;
  //     }
  //     matches.forEach((dest, idx) => {
  //       const item = document.createElement('div');
  //       item.className = 'autocomplete-item';
  //       item.textContent = dest;
  //       item.addEventListener('mousedown', function(e) {
  //         e.preventDefault();
  //         input.value = dest;
  //         list.innerHTML = '';
  //         list.classList.remove('active');
  //       });
  //       list.appendChild(item);
  //     });
  //     list.classList.add('active');
  //     currentFocus = -1;
  //   });

  //   input.addEventListener('keydown', function(e) {
  //     let items = list.querySelectorAll('.autocomplete-item');
  //     if (!items.length) return;
  //     if (e.key === 'ArrowDown') {
  //       currentFocus++;
  //       if (currentFocus >= items.length) currentFocus = 0;
  //       setActive(items);
  //       e.preventDefault();
  //     } else if (e.key === 'ArrowUp') {
  //       currentFocus--;
  //       if (currentFocus < 0) currentFocus = items.length - 1;
  //       setActive(items);
  //       e.preventDefault();
  //     } else if (e.key === 'Enter') {
  //       if (currentFocus > -1) {
  //         items[currentFocus].dispatchEvent(new Event('mousedown'));
  //         e.preventDefault();
  //       }
  //     }
  //   });

  //   document.addEventListener('click', function(e) {
  //     if (!input.contains(e.target) && !list.contains(e.target)) {
  //       list.innerHTML = '';
  //       list.classList.remove('active');
  //     }
  //   });
  // }

  // function setActive(items) {
  //   items.forEach((item, idx) => {
  //     item.classList.toggle('active', idx === currentFocus);
  //   });
  // }

  // Carousel with dots and auto-advance
  function startCarousels() {
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
      const imgs = carousel.querySelectorAll('.carousel-img');
      const dotsContainer = carousel.querySelector('.carousel-dots');
      let idx = 0;
      let timer = null;

      // Create dots
      dotsContainer.innerHTML = '';
      imgs.forEach((img, i) => {
        const dot = document.createElement('span');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => {
          showImg(i);
          resetTimer();
        });
        dotsContainer.appendChild(dot);
      });
      const dots = dotsContainer.querySelectorAll('.carousel-dot');

      function showImg(newIdx) {
        imgs[idx].classList.remove('active');
        dots[idx].classList.remove('active');
        idx = newIdx;
        imgs[idx].classList.add('active');
        dots[idx].classList.add('active');
      }

      function nextImg() {
        let next = (idx + 1) % imgs.length;
        showImg(next);
      }

      function resetTimer() {
        if (timer) clearInterval(timer);
        timer = setInterval(nextImg, 2500);
      }

      resetTimer();
    });
  }

  startCarousels();

  // Toggle for categories section (only if elements exist)
  const foodToggle = document.getElementById('food-toggle');
  const attractionToggle = document.getElementById('attraction-toggle');
  const foodList = document.querySelector('.categories-list[data-type="food"]');
  const attractionList = document.querySelector('.categories-list[data-type="attraction"]');

  if (foodToggle && attractionToggle && foodList && attractionList) {
    foodToggle.addEventListener('click', function() {
      foodToggle.classList.add('active');
      attractionToggle.classList.remove('active');
      foodList.style.display = '';
      attractionList.style.display = 'none';

      // Sync with header navigation - find and activate the corresponding header category
      const categoryId = this.getAttribute('data-id');
      const headerNavLinks = document.querySelectorAll('.nav a');
      headerNavLinks.forEach(link => {
        if (link.getAttribute('data-category-id') === categoryId) {
          // Remove active class from all header links
          headerNavLinks.forEach(l => l.classList.remove('active'));
          // Add active class to matching link
          link.classList.add('active');
          // Store in sessionStorage
          const categorySlug = link.getAttribute('data-category-slug');
          if (categorySlug) {
            sessionStorage.setItem('activeCategorySlug', categorySlug);
          }
        }
      });
    });

    attractionToggle.addEventListener('click', function() {
      attractionToggle.classList.add('active');
      foodToggle.classList.remove('active');
      attractionList.style.display = '';
      foodList.style.display = 'none';

      // Sync with header navigation - find and activate the corresponding header category
      const categoryId = this.getAttribute('data-id');
      const headerNavLinks = document.querySelectorAll('.nav a');
      headerNavLinks.forEach(link => {
        if (link.getAttribute('data-category-id') === categoryId) {
          // Remove active class from all header links
          headerNavLinks.forEach(l => l.classList.remove('active'));
          // Add active class to matching link
          link.classList.add('active');
          // Store in sessionStorage
          const categorySlug = link.getAttribute('data-category-slug');
          if (categorySlug) {
            sessionStorage.setItem('activeCategorySlug', categorySlug);
          }
        }
      });
    });
  }

  // Carousel logic for all sections with attraction cards
  function startAllCarousels() {
    const allSections = document.querySelectorAll('.hotel-cards');
    allSections.forEach(section => {
      const cards = section.querySelectorAll('.attraction-card');
      cards.forEach(card => {
        const carousel = card.querySelector('.attraction-carousel');
        const imgs = carousel.querySelectorAll('.carousel-img');
        const dots = card.querySelectorAll('.attraction-pagination .dot');
        let idx = 0;
        let timer = null;

        function showImg(newIdx) {
          imgs[idx].classList.remove('active');
          dots[idx].classList.remove('active');
          idx = newIdx;
          imgs[idx].classList.add('active');
          dots[idx].classList.add('active');
        }

        function nextImg() {
          let next = (idx + 1) % imgs.length;
          showImg(next);
        }

        function resetTimer() {
          if (timer) clearInterval(timer);
          timer = setInterval(nextImg, 2500);
        }

        dots.forEach((dot, i) => {
          dot.addEventListener('click', () => {
            showImg(i);
            resetTimer();
          });
        });

        resetTimer();
      });
    });
  }

  startAllCarousels();

  // Spot detail page: thumbnail click swaps main image
  const mainSpotImage = document.getElementById('mainSpotImage');
  const spotThumbs = document.querySelectorAll('.spot-thumb');
  if (mainSpotImage && spotThumbs.length) {
    spotThumbs.forEach(thumb => {
      thumb.addEventListener('click', function() {
        spotThumbs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        mainSpotImage.src = this.getAttribute('data-img');
      });
    });
  }

  // Star rating interactivity for review section
  const starRating = document.getElementById('starRating');
  if (starRating) {
    const stars = Array.from(starRating.querySelectorAll('.star'));
    let selectedRating = 1;

    function setStars(rating) {
      stars.forEach((star, idx) => {
        if (idx < rating) {
          star.classList.add('selected');
        } else {
          star.classList.remove('selected');
        }
      });
    }

    setStars(selectedRating);

    stars.forEach((star, idx) => {
      star.addEventListener('mouseenter', () => {
        stars.forEach((s, i) => {
          if (i <= idx) s.classList.add('hovered');
          else s.classList.remove('hovered');
        });
      });
      star.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('hovered'));
      });
      star.addEventListener('click', () => {
        selectedRating = idx + 1;
        setStars(selectedRating);
      });
    });
    starRating.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hovered'));
    });
  }


  // Modal open/close logic
  function openAuthModal() {
    const overlay = document.getElementById('auth-modal-overlay');
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('active'), 10);
    setTimeout(() => {
      const firstInput = overlay.querySelector('.modal-input');
      if (firstInput) firstInput.focus();
    }, 200);
  }
  function closeAuthModal() {
    const overlay = document.getElementById('auth-modal-overlay');
    overlay.classList.remove('active');
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
  }

  // Open modal on test button click
  const testBtn = document.getElementById('test-login-modal-btn');
  if (testBtn) {
    testBtn.addEventListener('click', openAuthModal);
  }

  const testBtn2 = document.getElementById('test-login-modal-btn-2');
  if (testBtn2) {
    testBtn2.addEventListener('click', openAuthModal);
  }

  const testBtn3 = document.getElementById('test-login-modal-btn-3');
  if (testBtn3) {
    testBtn3.addEventListener('click', openAuthModal);
  }

  // Open modal on CTA button click (if present)
  const ctaBtn = document.querySelector('.cta-btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', openAuthModal);
  }

  // Close modal on close button or overlay click
  const overlay = document.getElementById('auth-modal-overlay');
  if (overlay) {
    const closeBtn = overlay.querySelector('.modal-close');
    if (closeBtn) closeBtn.onclick = closeAuthModal;
    overlay.onclick = function(e) {
      if (e.target === this) closeAuthModal();
    };
  }
  // ESC key closes modal
  document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") closeAuthModal();
  });
  
}); 