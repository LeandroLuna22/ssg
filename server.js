// server.js
import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session'; // ← GERENCIA SESSÃO DO USUÁRIO

const app = express();

// ------------------------
// Middlewares básicos
// ------------------------

// Permite receber JSON no body das requisições
app.use(express.json());

// Middleware de sessão
// Guarda o usuário logado no servidor (mais seguro que localStorage)
app.use(session({
    secret: process.env.SESSION_SECRET || 'ssg_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false // true somente se usar HTTPS
    }
}));

// ------------------------
// Conexão com MySQL (pool)
// ------------------------
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4'
});

// ------------------------
// Arquivos estáticos
// ------------------------
// Permite acessar HTML, CSS e JS da pasta "public"
app.use(express.static('public'));

// ------------------------
// Rota de teste
// ------------------------
app.get('/', (req, res) => {
    res.send('Servidor rodando');
});


// ======================================================
// 🔐 MIDDLEWARES DE SEGURANÇA
// ======================================================

// Verifica se o usuário está logado
function autenticado(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({ mensagem: 'Não autenticado' });
    }
    next();
}

// Verifica se o usuário é administrador
function somenteAdmin(req, res, next) {
    if (req.session.usuario.tipo !== 'admin') {
        return res.status(403).json({ mensagem: 'Acesso restrito ao administrador' });
    }
    next();
}


// ======================================================
// 👤 ROTA PARA OBTER USUÁRIO LOGADO
// ======================================================
app.get('/user', autenticado, (req, res) => {
    // Retorna apenas dados necessários para o frontend
    res.json({
        nome: req.session.usuario.nome,
        tipo: req.session.usuario.tipo // admin ou usuario
    });
});


// ======================================================
// 📝 CADASTRO DE USUÁRIO (APENAS ADMIN)
// ======================================================
app.post('/cadastrar', autenticado, somenteAdmin, async (req, res) => {
    const { nome, senha, apartamento, tipo } = req.body;

    // Validação básica
    if (!nome || !senha || !apartamento || !tipo) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    try {
        // Criptografa a senha antes de salvar no banco
        const senhaHash = await bcrypt.hash(senha, 10);

        // Insere usuário no banco
        const [resultado] = await db.query(
            'INSERT INTO usuarios (nome, senha, apartamento, tipo) VALUES (?, ?, ?, ?)',
            [nome, senhaHash, apartamento, tipo]
        );

        res.json({
            mensagem: 'Usuário cadastrado com sucesso!',
            id: resultado.insertId
        });

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
        // Busca usuário pelo nome
        const [rows] = await db.query(
            'SELECT id, nome, senha, tipo FROM usuarios WHERE nome = ?',
            [nome]
        );

        if (rows.length === 0) {
            return res.status(401).json({ mensagem: 'Usuário ou senha incorretos.' });
        }

        const usuario = rows[0];

        // Compara senha digitada com hash do banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ mensagem: 'Usuário ou senha incorretos.' });
        }

        // ✅ SALVA USUÁRIO NA SESSÃO
        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            tipo: usuario.tipo
        };

        res.json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ mensagem: 'Erro no servidor.' });
    }
});


// ------------------------
// Criar Nota
// ------------------------
app.post('/criar-nota', autenticado, async (req, res) => {
    // salvar nota no banco
});


// ======================================================
// 🚪 LOGOUT
// ======================================================
app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ mensagem: 'Logout realizado com sucesso' });
    });
});


// ------------------------
// Iniciar servidor
// ------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

