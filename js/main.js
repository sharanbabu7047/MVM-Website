document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Toggle
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    // Close menu when clicking on a link
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }

  // 2. Sticky Header Scroll Effect
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // 3. Highlight Active Navigation Item Automatically
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-item a, .dropdown-menu a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href !== '#' && href !== './') {
      if (currentPath.includes(href) && href !== 'index.html') {
        link.classList.add('active');
        const dropdownParent = link.closest('.dropdown');
        if (dropdownParent) {
          const toggle = dropdownParent.querySelector('.dropdown-toggle');
          if (toggle) toggle.classList.add('active');
        }
      } else if ((currentPath.endsWith('/') || currentPath.endsWith('index.html')) && (href === 'index.html' || href === './')) {
        link.classList.add('active');
      }
    }
  });

  // 4. Accordion Toggle (For Academics Syllabus & Admissions FAQ)
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(accHeader => {
    accHeader.addEventListener('click', () => {
      const item = accHeader.parentElement;
      const isOpen = item.classList.contains('open');
      
      // Close other accordions in the same group
      const parentList = item.parentElement;
      parentList.querySelectorAll('.accordion-item').forEach(sibling => {
        sibling.classList.remove('open');
      });
      
      // Toggle current item
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // 5. Filterable Gallery
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (filterBtns.length > 0 && galleryItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active button styling
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filterValue = btn.getAttribute('data-filter');
        
        galleryItems.forEach(item => {
          const category = item.getAttribute('data-category');
          if (filterValue === 'all' || category === filterValue) {
            item.style.display = 'block';
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            }, 50);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  // 6. Lightbox Feature for Gallery
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  
  let activeImages = [];
  let currentIndex = 0;
  
  if (galleryItems.length > 0 && lightbox) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        activeImages = [];
        let indexInVisible = 0;
        
        galleryItems.forEach(gItem => {
          if (activeFilter === 'all' || gItem.getAttribute('data-category') === activeFilter) {
            const img = gItem.querySelector('img');
            activeImages.push(img.src);
            if (gItem === item) {
              currentIndex = indexInVisible;
            }
            indexInVisible++;
          }
        });
        
        showLightbox(currentIndex);
      });
    });
    
    function showLightbox(idx) {
      if (activeImages.length > 0) {
        lightboxImg.src = activeImages[idx];
        lightbox.classList.add('active');
      }
    }
    
    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
      });
    }
    
    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + activeImages.length) % activeImages.length;
        showLightbox(currentIndex);
      });
    }
    
    if (lightboxNext) {
      lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % activeImages.length;
        showLightbox(currentIndex);
      });
    }
    
    // Close lightbox on clicking outside image container
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
      }
    });
  }

  // 7. Toast Notification Handler
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'error') {
      toast.style.borderColor = '#dc2626'; // Red border for error
    }
    
    toast.innerHTML = `
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 5000);
  }

  // 8. Admission Enquiry Form Validation
  const admissionForm = document.getElementById('admission-enquiry-form');
  if (admissionForm) {
    admissionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isValid = true;
      const parentName = document.getElementById('parent_name').value.trim();
      const studentName = document.getElementById('student_name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      const dob = document.getElementById('dob').value;
      const grade = document.getElementById('grade_interest').value;
      
      // Simple phone regex validation (10 digits minimum)
      const phoneRegex = /^[0-9+\s\-]{10,15}$/;
      // Simple email regex validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!parentName || !studentName || !dob || !grade) {
        showToast('Please fill in all mandatory fields.', 'error');
        isValid = false;
        return;
      }
      
      if (!phoneRegex.test(phone)) {
        showToast('Please enter a valid phone number.', 'error');
        document.getElementById('phone').focus();
        isValid = false;
        return;
      }
      
      if (email && !emailRegex.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        document.getElementById('email').focus();
        isValid = false;
        return;
      }
      
      if (isValid) {
        // Display beautiful toast notification
        showToast(`Thank you, ${parentName}. Admission enquiry for ${studentName} (Grade ${grade}) has been successfully submitted! Check your email for details.`);
        admissionForm.reset();
      }
    });
  }

  // 9. Contact Message Form Validation
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contact_name').value.trim();
      const email = document.getElementById('contact_email').value.trim();
      const message = document.getElementById('contact_message').value.trim();
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!name || !email || !message) {
        showToast('Please fill in all form fields.', 'error');
        return;
      }
      
      if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }
      
      showToast(`Thank you, ${name}. Your message has been sent successfully.`);
      contactForm.reset();
    });
  }

  // 10. Mobile Menu Dropdown Toggle Support
  const dropdownToggles = document.querySelectorAll('.nav-item.dropdown .dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        const parent = toggle.parentElement;
        parent.classList.toggle('open');
      }
    });
  });

  // 11. Homepage Slider (Carousel) Logic
  const slider = document.getElementById('home-slider');
  if (slider) {
    const slides = slider.querySelectorAll('.slide');
    const dots = slider.querySelectorAll('.dot');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    
    let currentSlide = 0;
    let slideInterval;
    
    function showSlide(index) {
      slides.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      
      currentSlide = (index + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
    }
    
    function nextSlide() {
      showSlide(currentSlide + 1);
    }
    
    function startSlideShow() {
      clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, 5000);
    }
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
        startSlideShow();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
        startSlideShow();
      });
    }
    
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index'), 10);
        showSlide(index);
        startSlideShow();
      });
    });
    
    // Initialize slideshow only if there are multiple slides
    if (slides.length > 1) {
      startSlideShow();
    }
  }



  // 13. Admission Flyer Popup Modal Logic
  const popupModal = document.getElementById('admission-popup-modal');
  const popupClose = document.getElementById('popup-modal-close');
  
  if (popupModal) {
    // Show on homepage load
    // Delay slightly for premium entry effect
    setTimeout(() => {
      popupModal.classList.add('show');
    }, 1000);
    
    if (popupClose) {
      popupClose.addEventListener('click', () => {
        popupModal.classList.remove('show');
      });
    }
    // Close on click outside the image container
    popupModal.addEventListener('click', (e) => {
      if (e.target === popupModal) {
        popupModal.classList.remove('show');
      }
    });
  }

  // 14. Dynamic Counter Animation for Stats Section
  const statsSection = document.getElementById('stats-section');
  if (statsSection) {
    const counters = statsSection.querySelectorAll('.stat-number');
    const animateCounters = () => {
      counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // 2 seconds animation
        const stepTime = 30; // ms
        const steps = Math.ceil(duration / stepTime);
        const increment = target / steps;
        
        let current = 0;
        let countStep = 0;
        
        const updateCount = () => {
          countStep++;
          current += increment;
          if (countStep >= steps) {
            counter.innerText = target;
          } else {
            counter.innerText = Math.floor(current);
            setTimeout(updateCount, stepTime);
          }
        };
        updateCount();
      });
    };

    // Trigger animation when the section is scrolled into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target); // Run only once
        }
      });
    }, { threshold: 0.2 });

    observer.observe(statsSection);
  }
});
