document.addEventListener('DOMContentLoaded', () => {
  
  // Login Form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('login-error');
      errorDiv.style.display = 'none';

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (data.success) {
          localStorage.setItem('adminToken', data.token);
          window.location.href = 'dashboard.html';
        } else {
          errorDiv.textContent = data.message;
          errorDiv.style.display = 'block';
        }
      } catch (err) {
        errorDiv.textContent = 'Server error. Try again.';
        errorDiv.style.display = 'block';
      }
    });
  }

  // Dashboard Logic
  if (window.location.pathname.includes('dashboard.html')) {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
      localStorage.removeItem('adminToken');
      window.location.href = 'login.html';
    });

    // Tab Switching
    const tabs = document.querySelectorAll('.sidebar li');
    const panes = document.querySelectorAll('.tab-pane');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });



    // Gallery Upload
    document.getElementById('gallery-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('title', document.getElementById('gallery_title').value);
      formData.append('description', document.getElementById('gallery_desc').value);
      formData.append('image', document.getElementById('gallery_image').files[0]);

      document.getElementById('gallery-upload-btn').textContent = 'Uploading...';
      
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
      });
      document.getElementById('gallery-upload-btn').textContent = 'Upload Image';
      
      if(res.ok) {
        alert('Image uploaded!');
        loadGallery();
      } else {
        alert('Upload failed.');
      }
    });
    
    // Load Data
    loadGallery();

    // Pages Load & Form Logic
    const pageSelect = document.getElementById('page_slug');
    if (pageSelect) {
      pageSelect.addEventListener('change', async (e) => {
        const slug = e.target.value;
        if (!slug) return;
        try {
          const res = await fetch('/api/pages/' + slug);
          const data = await res.json();
          const list = document.getElementById('pages-list');
          list.innerHTML = '';
          
          // Clear form for new item
          document.getElementById('page_title').value = '';
          document.getElementById('page_content_text').value = '';
          document.getElementById('page_current_image_preview').innerHTML = '';
          document.getElementById('page_image').value = '';

          if (data.success && data.data.length > 0) {
            data.data.forEach(item => {
              const imgHtml = item.image_url ? `<img src="${item.image_url}" style="width:100px; height:100px; object-fit:cover; border-radius:4px;">` : '';
              list.innerHTML += `
                <div style="border:1px solid #ddd; margin-bottom:10px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
                  <div style="display:flex; gap:15px; align-items:center;">
                    ${imgHtml}
                    <div>
                      <strong>${item.title || 'No Title'}</strong>
                      <p style="margin:5px 0 0; font-size:0.9em; max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.content_text || ''}</p>
                    </div>
                  </div>
                  <button class="btn delete-page-item" data-id="${item.id}" style="background:#e74c3c;">Delete</button>
                </div>
              `;
            });

            document.querySelectorAll('.delete-page-item').forEach(btn => {
              btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if(confirm('Delete this page item?')) {
                  try {
                    const res = await fetch('/api/admin/pages/' + id, {
                      method: 'DELETE',
                      headers: { 'Authorization': 'Bearer ' + token }
                    });
                    if(res.ok) {
                      alert('Item deleted');
                      pageSelect.dispatchEvent(new Event('change'));
                    } else {
                      alert('Failed to delete item');
                    }
                  } catch(err) {
                    console.error(err);
                  }
                }
              });
            });

            // Adjust placeholders based on slug
            if (slug === 'syllabus') {
              document.getElementById('page_title').placeholder = 'Primary I to V Subject (e.g., English)';
              document.getElementById('page_content_text').placeholder = 'Middle School VI to VIII Subject (e.g., Science)';
              document.getElementById('page_image').style.display = 'none';
              document.getElementById('page_image').previousElementSibling.style.display = 'none'; // hide the label
            } else {
              document.getElementById('page_title').placeholder = 'Page Main Title';
              document.getElementById('page_content_text').placeholder = 'Page Content (Text/Paragraphs)';
              document.getElementById('page_image').style.display = 'block';
              document.getElementById('page_image').previousElementSibling.style.display = 'block';
            }

          } else {
            list.innerHTML = '<p>No items found for this page.</p>';
          }
        } catch (err) {
          console.error(err);
        }
      });
    }

    const pagesForm = document.getElementById('pages-form');
    if (pagesForm) {
      pagesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const slug = document.getElementById('page_slug').value;
        if (!slug) return alert('Select a page first.');

        const formData = new FormData();
        formData.append('page_slug', slug);
        formData.append('title', document.getElementById('page_title').value);
        formData.append('content_text', document.getElementById('page_content_text').value);
        
        const imgFile = document.getElementById('page_image').files[0];
        if(imgFile) formData.append('image', imgFile);

        const btn = document.getElementById('page-update-btn');
        const oldText = btn.textContent;
        btn.textContent = 'Updating...';
        btn.disabled = true;

        try {
          const res = await fetch('/api/admin/pages', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: formData
          });
          if (res.ok) {
            alert('Item added successfully!');
            // refresh list
            pageSelect.dispatchEvent(new Event('change'));
          } else {
            alert('Failed to add item.');
          }
        } catch (err) {
          console.error(err);
        } finally {
          btn.textContent = oldText;
          btn.disabled = false;
        }
      });
    }
  }



  async function loadGallery() {
    const res = await fetch('/api/gallery');
    const data = await res.json();
    const list = document.getElementById('gallery-list');
    list.innerHTML = '';
    data.data.forEach(img => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${img.image_url}" alt="img">
          <div>
            <strong>${img.title}</strong><br>
            <small>${img.description}</small>
          </div>
        </div>
        <button class="btn-danger" onclick="deleteGallery(${img.id})">Delete</button>
      `;
      list.appendChild(div);
    });
  }

  window.deleteGallery = async function(id) {
    if(!confirm('Delete this image?')) return;
    const token = localStorage.getItem('adminToken');
    const res = await fetch('/api/admin/gallery/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if(res.ok) loadGallery();
  }

  // Change Password
  const changePasswordForm = document.getElementById('change-password-form');
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('new_password').value;
      const confirmPassword = document.getElementById('confirm_new_password').value;
      const msgDiv = document.getElementById('password-msg');
      
      if (newPassword !== confirmPassword) {
        msgDiv.innerHTML = '<span style="color:red;">Passwords do not match.</span>';
        return;
      }

      msgDiv.innerHTML = 'Updating...';
      const token = localStorage.getItem('adminToken');
      
      try {
        const res = await fetch('/api/admin/password', {
          method: 'PUT',
          headers: { 
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ newPassword })
        });
        
        const data = await res.json();
        if (res.ok) {
          msgDiv.innerHTML = '<span style="color:green;">Password updated successfully.</span>';
          changePasswordForm.reset();
        } else {
          msgDiv.innerHTML = `<span style="color:red;">${data.error || 'Failed to update password.'}</span>`;
        }
      } catch (err) {
        msgDiv.innerHTML = '<span style="color:red;">An error occurred.</span>';
      }
    });
  }

});
