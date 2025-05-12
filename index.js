const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

// Cấu hình view engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Kết nối MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'yourpassword', // 🔁 Thay bằng mật khẩu thực tế
  database: 'myappdb'
});

db.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối database:', err);
    process.exit(1);
  }
  console.log('✅ Đã kết nối MySQL!');
});

//////////////////////////////////////////////////////
// 🔗 ROUTES GIAO DIỆN HTML (EJS)

// Trang danh sách users
app.get('/', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).send('Lỗi lấy dữ liệu');
    res.render('list', { users: results });
  });
});

// Trang thêm user
app.get('/create', (req, res) => {
  res.render('create');
});

app.post('/create', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).send('Thiếu thông tin');
  db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err) => {
    if (err) return res.status(500).send('Lỗi thêm user');
    res.redirect('/');
  });
});

// Trang sửa user
app.get('/edit/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).send('Không tìm thấy user');
    res.render('edit', { user: results[0] });
  });
});

app.post('/edit/:id', (req, res) => {
  const { name, email } = req.body;
  const { id } = req.params;
  db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], (err) => {
    if (err) return res.status(500).send('Lỗi cập nhật');
    res.redirect('/');
  });
});

// Xóa user
app.get('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send('Lỗi xóa');
    res.redirect('/');
  });
});

//////////////////////////////////////////////////////
// 🧪 JSON API (nếu cần dùng thêm frontend hoặc kiểm thử)

app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.post('/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Thiếu name hoặc email' });
  db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Thêm user thành công', userId: result.insertId });
  });
});

//////////////////////////////////////////////////////
// 🔁 Start server

app.listen(port, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
});
