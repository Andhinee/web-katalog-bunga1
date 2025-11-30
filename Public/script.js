const API_URL = '/api'; // Relative path agar jalan di Vercel

// --- Logic Home & Catalog ---
async function loadFeatured() {
    // Mengambil data bunga populer
    const res = await fetch(`${API_URL}/flowers?category=Bunga Populer`);
    const data = await res.json();
    const container = document.getElementById('featured-flowers');
    if(container) {
        container.innerHTML = data.map(flower => `
            <div class="card" onclick="location.href='detail.html?id=${flower.id}'">
                <img src="${flower.image_url}" alt="${flower.name}">
                <div class="card-content">
                    <div class="card-title">${flower.name}</div>
                    <small>${flower.latin_name}</small>
                </div>
            </div>
        `).join('');
    }
}

async function loadCatalog() {
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    
    let endpoint = `${API_URL}/flowers`;
    if(catParam) endpoint += `?category=${catParam}`;

    const res = await fetch(endpoint);
    const data = await res.json();
    renderCatalog(data);
    
    // Set dropdown value jika ada param
    if(catParam) document.getElementById('filter-category').value = catParam;
}

function renderCatalog(data) {
    const container = document.getElementById('catalog-list');
    if(!container) return;
    container.innerHTML = data.map(flower => `
        <div class="card" onclick="location.href='detail.html?id=${flower.id}'">
            <img src="${flower.image_url}" alt="${flower.name}">
            <div class="card-content">
                <div class="card-title">${flower.name}</div>
                <p style="font-size:0.8rem; color:#666;">${flower.description ? flower.description.substring(0, 50) + '...' : ''}</p>
            </div>
        </div>
    `).join('');
}

async function filterFlowers() {
    const search = document.getElementById('search').value;
    const cat = document.getElementById('filter-category').value;
    
    let url = `${API_URL}/flowers?`;
    if(search) url += `search=${search}&`;
    if(cat) url += `category=${cat}`;

    const res = await fetch(url);
    const data = await res.json();
    renderCatalog(data);
}

// --- Logic Admin (Login & Upload) ---
async function login() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
    });
    const result = await res.json();
    
    if(result.success) {
        localStorage.setItem('isAdmin', true);
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
    } else {
        alert('Login Gagal');
    }
}

// Cek Login saat buka admin page
if(window.location.pathname.includes('admin.html')) {
    if(localStorage.getItem('isAdmin')) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
    }

    // Handle Form Submit
    document.getElementById('addFlowerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target); // Ambil semua input termasuk file
        
        const res = await fetch(`${API_URL}/flowers`, {
            method: 'POST',
            body: formData // Kirim sebagai Multipart
        });
        
        if(res.ok) {
            alert('Bunga berhasil ditambahkan!');
            e.target.reset();
        } else {
            alert('Gagal upload');
        }
    });
}