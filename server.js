// server.js
import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const app = express();

// Middleware para ler JSON
app.use(express.json());

// Conexão com MySQL usando pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4'
});

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static('public'));

// Rota de teste
app.get('/', (req, res) => {
    res.send('Servidor rodando');
});

// Rota POST para cadastro
app.post('/cadastrar', async (req, res) => {
    const { nome, senha, apartamento, tipo } = req.body;

    // Validação básica
    if (!nome || !senha || !apartamento || !tipo) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    try {
        // Criptografar senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Inserir no banco
        const [resultado] = await db.query(
            'INSERT INTO usuarios (nome, senha, apartamento, tipo) VALUES (?, ?, ?, ?)',
            [nome, senhaHash, apartamento, tipo]
        );

        // Retornar sucesso
        res.json({ mensagem: 'Usuário cadastrado com sucesso!', id: resultado.insertId });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ mensagem: 'Erro ao cadastrar usuário.' });
    }
});

// ------------------------
// Rota de login
// ------------------------
app.post('/login', async (req, res) => {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
        return res.status(400).json({ mensagem: 'Usuário e senha são obrigatórios.' });
    }

    try {
        // Busca usuário pelo nome
        const [rows] = await db.query('SELECT * FROM usuarios WHERE nome = ?', [nome]);

        if (rows.length === 0) {
            return res.status(401).json({ mensagem: 'Usuário ou senha incorretos.' });
        }

        const usuario = rows[0];

        // Compara senha digitada com hash no banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ mensagem: 'Usuário ou senha incorretos.' });
        }

        // Login correto
        res.json({ sucesso: true, mensagem: 'Login realizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ mensagem: 'Erro no servidor.' });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

