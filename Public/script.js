const API_URL = '/api'; // Relative path agar jalan di Vercel

// ==========================================
// 1. LOGIC HOME & CATALOG (Bunga)
// ==========================================

async function loadFeatured() {
    // Mengambil data bunga populer untuk ditampilkan di Home
    const container = document.getElementById('featured-flowers');
    if (!container) return; // Stop jika elemen tidak ada di halaman ini

    try {
        const res = await fetch(`${API_URL}/flowers?category=Bunga Populer`);
        const data = await res.json();
        
        container.innerHTML = data.map(flower => `
            <div class="card" onclick="location.href='detail.html?id=${flower.id}'">
                <img src="${flower.image_url}" alt="${flower.name}">
                <div class="card-content">
                    <div class="card-title">${flower.name}</div>
                    <small>${flower.latin_name || ''}</small>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Gagal memuat featured flowers:", error);
    }
}

async function loadCatalog() {
    const container = document.getElementById('catalog-list');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    
    let endpoint = `${API_URL}/flowers`;
    if(catParam) endpoint += `?category=${catParam}`;

    try {
        const res = await fetch(endpoint);
        const data = await res.json();
        renderCatalog(data);
        
        // Set dropdown value jika ada param di URL
        const filterSelect = document.getElementById('filter-category');
        if(catParam && filterSelect) filterSelect.value = catParam;
    } catch (error) {
        console.error("Gagal memuat katalog:", error);
    }
}

function renderCatalog(data) {
    const container = document.getElementById('catalog-list');
    if(!container) return;
    
    if (data.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%;">Tidak ada bunga ditemukan.</p>';
        return;
    }

    container.innerHTML = data.map(flower => `
        <div class="card" onclick="location.href='detail.html?id=${flower.id}'">
            <img src="${flower.image_url}" alt="${flower.name}">
            <div class="card-content">
                <div class="card-title">${flower.name}</div>
                <p style="font-size:0.8rem; color:#666;">
                    ${flower.description ? flower.description.substring(0, 50) + '...' : ''}
                </p>
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

    try {
        const res = await fetch(url);
        const data = await res.json();
        renderCatalog(data);
    } catch (error) {
        console.error("Gagal filter bunga:", error);
    }
}

// ==========================================
// 2. LOGIC HALAMAN ARTIKEL
// ==========================================

async function loadArticles() {
    const container = document.getElementById('article-list');
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/articles`);
        const data = await res.json();

        if (data.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%;">Belum ada artikel.</p>';
            return;
        }

        container.innerHTML = data.map(article => `
            <div class="card" onclick="location.href='detail.html?type=article&id=${article.id}'">
                <img src="${article.image_url}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/300'">
                <div class="card-content">
                    <div class="card-title">${article.title}</div>
                    <p style="font-size:0.9rem; color:#666; margin-bottom:10px;">
                        ${article.summary || 'Baca selengkapnya untuk mengetahui lebih lanjut.'}
                    </p>
                    <span style="color: var(--accent); font-weight:bold; font-size:0.8rem;">Baca Selengkapnya &rarr;</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Gagal memuat artikel:", error);
        container.innerHTML = `<p style="text-align:center;">Gagal memuat artikel.</p>`;
    }
}

// =================================