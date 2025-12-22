// server.js
import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';
import multer from 'multer';
import path from 'path';

const app = express();

// ======================================================
// 🧱 MIDDLEWARES BÁSICOS
// ======================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ======================================================
// 🔐 SESSÃO
// ======================================================
app.use(session({
    secret: process.env.SESSION_SECRET || 'ssg_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false
    }
}));

// ======================================================
// 🗄️ BANCO DE DADOS
// ======================================================
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4'
});

// ======================================================
// 📂 MULTER (ANTES DAS ROTAS)
// ======================================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const upload = multer({ storage });

// ======================================================
// 🔐 MIDDLEWARES DE SEGURANÇA
// ======================================================
function autenticado(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({ mensagem: 'Não autenticado' });
    }
    next();
}

function somenteAdmin(req, res, next) {
    if (req.session.usuario.tipo !== 'admin') {
        return res.status(403).json({ mensagem: 'Acesso restrito ao administrador' });
    }
    next();
}

// ======================================================
// 👤 USUÁRIO LOGADO
// ======================================================
app.get('/user', autenticado, (req, res) => {
    res.json({
        nome: req.session.usuario.nome,
        tipo: req.session.usuario.tipo
    });
});

// ======================================================
// 📝 CRIAR NOTA
// ======================================================
app.post(
    '/criar-nota',
    autenticado,
    upload.single('imagem'),
    async (req, res) => {
        try {
            const { titulo, descricao } = req.body;
            const usuarioId = req.session.usuario.id;
            const imagem = req.file ? req.file.filename : null;

            if (!titulo || !descricao) {
                return res.status(400).json({ mensagem: 'Título e descrição são obrigatórios.' });
            }

            await db.query(
                `INSERT INTO notas (usuario_id, titulo, descricao, imagem)
                 VALUES (?, ?, ?, ?)`,
                [usuarioId, titulo, descricao, imagem]
            );

            res.json({ mensagem: 'Nota criada com sucesso!' });

        } catch (error) {
            console.error('Erro ao criar nota:', error);
            res.status(500).json({ mensagem: 'Erro ao criar nota.' });
        }
    }
);

// ======================================================
// 📋 LISTAR NOTAS
// ======================================================
app.get('/notas', autenticado, async (req, res) => {
    try {
        let query;

        if (req.session.usuario.tipo === 'admin') {
            // 👑 Admin vê todas as notas
            query = `
                SELECT notas.*, usuarios.nome
                FROM notas
                JOIN usuarios ON usuarios.id = notas.usuario_id
                ORDER BY criada_em DESC
            `;
        } else {
            // 👤 Usuário comum vê todas as notas ABERTAS
            query = `
                SELECT notas.*, usuarios.nome
                FROM notas
                JOIN usuarios ON usuarios.id = notas.usuario_id
                WHERE status = 'aberta'
                ORDER BY criada_em DESC
            `;
        }

        const [rows] = await db.query(query);
        res.json(rows);

    } catch (error) {
        console.error('Erro ao listar notas:', error);
        res.status(500).json({ mensagem: 'Erro ao buscar notas.' });
    }
});

// ======================================================
// 📝 CADASTRO (ADMIN)
// ======================================================
app.post('/cadastrar', autenticado, somenteAdmin, async (req, res) => {
    const { nome, senha, apartamento, tipo } = req.body;

    if (!nome || !senha || !apartamento || !tipo) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        const [resultado] = await db.query(
            'INSERT INTO usuarios (nome, senha, apartamento, tipo) VALUES (?, ?, ?, ?)',
            [nome, senhaHash, apartamento, tipo]
        );

        res.json({ mensagem: 'Usuário cadastrado com sucesso!', id: resultado.insertId });

    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ mensagem: 'Erro ao cadastrar usuário.' });
    }
});

// ======================================================
// 🔑 LOGIN
// ======================================================
app.post('/login', async (req, res) => {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
        return res.status(400).json({ mensagem: 'Usuário e senha são obrigatórios.' });
    }

    try {
        const [rows] = await db.query(
            'SELECT id, nome, senha, tipo FROM usuarios WHERE nome = ?',
            [nome]
        );

        if (rows.length === 0) {
            return res.status(401).json({ mensagem: 'Usuário ou senha incorretos.' });
        }

        const usuario = rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ mensagem: 'Usuário ou senha incorretos.' });
        }

        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            tipo: usuario.tipo
        };

        res.json({ sucesso: true, mensagem: 'Login realizado com sucesso!' });

    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ mensagem: 'Erro no servidor.' });
    }
});

// ======================================================
// 🚪 LOGOUT
// ======================================================
app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ mensagem: 'Logout realizado com sucesso' });
    });
});

// ======================================================
// 🚀 START
// ======================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

