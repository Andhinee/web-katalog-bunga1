const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Konfigurasi Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Konfigurasi Multer (Upload File ke Memory Sementara)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. GET Semua Bunga (Bisa Filter Kategori & Search)
app.get('/api/flowers', async (req, res) => {
    const { category, search, color } = req.query;
    let query = supabase.from('flowers').select('*, categories(name)');

    if (category) query = query.eq('categories.name', category); // Filter by Category Name
    if (color) query = query.ilike('color', `%${color}%`);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 2. GET Detail Bunga by ID
app.get('/api/flowers/:id', async (req, res) => {
    const { data, error } = await supabase.from('flowers').select('*, categories(name)').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'Bunga tidak ditemukan' });
    res.json(data);
});

// 3. POST Bunga Baru (ADMIN ONLY - Upload Gambar)
app.post('/api/flowers', upload.single('image'), async (req, res) => {
    try {
        const file = req.file;
        const { name, latin_name, category_name, description, habitat, care_tips, meaning, color } = req.body;

        // 1. Upload Gambar ke Supabase Storage
        const fileName = `${Date.now()}-${file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('flower-images')
            .upload(fileName, file.buffer, { contentType: file.mimetype });

        if (uploadError) throw uploadError;

        // 2. Dapatkan Public URL Gambar
        const { data: urlData } = supabase.storage.from('flower-images').getPublicUrl(fileName);
        const publicUrl = urlData.publicUrl;

        // 3. Cari ID Kategori berdasarkan nama (Simpel lookup)
        const { data: catData } = await supabase.from('categories').select('id').eq('name', category_name).single();
        const category_id = catData ? catData.id : null;

        // 4. Simpan ke Database
        const { data, error } = await supabase.from('flowers').insert([{
            name, latin_name, category_id, description, habitat, care_tips, meaning, color, image_url: publicUrl
        }]).select();

        if (error) throw error;
        res.status(201).json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. GET Artikel
app.get('/api/articles', async (req, res) => {
    const { data, error } = await supabase.from('articles').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 5. POST Artikel (ADMIN ONLY)
app.post('/api/articles', upload.single('image'), async (req, res) => {
    try {
        const file = req.file;
        const { title, summary, content } = req.body;

        const fileName = `article-${Date.now()}-${file.originalname}`;
        await supabase.storage.from('flower-images').upload(fileName, file.buffer, { contentType: file.mimetype });
        const { data: urlData } = supabase.storage.from('flower-images').getPublicUrl(fileName);

        const { data, error } = await supabase.from('articles').insert([{
            title, summary, content, image_url: urlData.publicUrl
        }]).select();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Login Admin (Sederhana)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const { data, error } = await supabase.from('admins').select('*').eq('username', username).eq('password', password).single();
    
    if (data) {
        res.json({ success: true, message: 'Login berhasil' });
    } else {
        res.status(401).json({ success: false, message: 'Username/Password salah' });
    }
});

// Root route
app.get('/', (req, res) => res.send('Flower Catalog API Running'));

app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;