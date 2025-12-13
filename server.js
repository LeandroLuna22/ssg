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

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

