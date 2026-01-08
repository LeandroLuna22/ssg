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
// 📋 LISTAR NOTAS (com filtro por status e data)
// ======================================================
app.get('/notas', autenticado, async (req, res) => {
    try {
        const { status, inicio, fim } = req.query;

        let filtros = [];
        let valores = [];

        // 👤 Usuário comum
        if (req.session.usuario.tipo !== 'admin') {
            if (status) {
                filtros.push('notas.status = ?');
                valores.push(status);
            } else {
                // padrão: só abertas
                filtros.push("notas.status = 'aberta'");
            }
        } 
        // 👑 Admin
        else {
            if (status) {
                filtros.push('notas.status = ?');
                valores.push(status);
            }
        }

        // 📅 Filtro por data
        if (inicio) {
            filtros.push('DATE(notas.criada_em) >= ?');
            valores.push(inicio);
        }

        if (fim) {
            filtros.push('DATE(notas.criada_em) <= ?');
            valores.push(fim);
        }

        let where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

        const query = `
            SELECT notas.*, usuarios.nome
            FROM notas
            JOIN usuarios ON usuarios.id = notas.usuario_id
            ${where}
            ORDER BY notas.criada_em DESC
        `;

        const [rows] = await db.query(query, valores);
        res.json(rows);

    } catch (error) {
        console.error('Erro ao listar notas:', error);
        res.status(500).json({ mensagem: 'Erro ao buscar notas.' });
    }
});

// ======================================================
// 📄 BUSCAR NOTA POR ID
// ======================================================
app.get('/notas/:id', autenticado, async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT notas.*, usuarios.nome
            FROM notas
            JOIN usuarios ON usuarios.id = notas.usuario_id
            WHERE notas.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ mensagem: 'Nota não encontrada' });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error('Erro ao buscar nota:', error);
        res.status(500).json({ mensagem: 'Erro ao buscar nota' });
    }
});

// ======================================================
// 🔄 ATUALIZAR STATUS DA NOTA (ADMIN)
// ======================================================
app.put('/notas/:id/status', autenticado, somenteAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const statusValidos = ['aberta', 'em andamento', 'concluida'];

    if (!statusValidos.includes(status)) {
        return res.status(400).json({ mensagem: 'Status inválido' });
    }

    try {
        await db.query(
            'UPDATE notas SET status = ? WHERE id = ?',
            [status, id]
        );

        res.json({ mensagem: 'Status atualizado com sucesso' });

    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ mensagem: 'Erro ao atualizar status' });
    }
});

//🔹 BUSCAR ORDEM POR NOTA (nota.html usa isso)

app.get('/ordens/nota/:notaId', autenticado, async (req, res) => {
    const { notaId } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT os.*, u.nome AS admin_nome
             FROM ordens_servico os
             JOIN usuarios u ON u.id = os.admin_id
             WHERE os.nota_id = ?`,
            [notaId]
        );

        res.json(rows[0] || null);

    } catch (error) {
        console.error('Erro ao buscar ordem:', error);
        res.status(500).json({ mensagem: 'Erro ao buscar ordem' });
    }
});

//🔹 CRIAR ORDEM (ADMIN)

app.post('/ordens', autenticado, somenteAdmin, async (req, res) => {
    const { nota_id, descricao } = req.body;
    const adminId = req.session.usuario.id;

    if (!nota_id || !descricao) {
        return res.status(400).json({ mensagem: 'Dados obrigatórios' });
    }

    try {
        // 🔒 Impede duplicidade
        const [existe] = await db.query(
            'SELECT id FROM ordens_servico WHERE nota_id = ?',
            [nota_id]
        );

        if (existe.length > 0) {
            return res.status(400).json({ mensagem: 'Esta nota já possui ordem aberta' });
        }

        await db.query(
            `INSERT INTO ordens_servico (nota_id, admin_id, descricao)
             VALUES (?, ?, ?)`,
            [nota_id, adminId, descricao]
        );

        res.json({ mensagem: 'Ordem de serviço criada com sucesso' });

    } catch (error) {
        console.error('Erro ao criar ordem:', error);
        res.status(500).json({ mensagem: 'Erro ao criar ordem' });
    }
});

// ======================================================
// 📝 VISUALIZAR ORDENS (COM FILTRO)
// ======================================================
app.get('/ordens', autenticado, async (req, res) => {
  try {
    const { status, inicio, fim } = req.query;

    let where = [];
    let params = [];

    // 🔹 REGRA: encerradas só aparecem se filtrar
    if (status) {
      where.push('os.status = ?');
      params.push(status);
    } else {
      where.push("os.status != 'concluida'");
    }

    // 🔹 Filtro por data inicial
    if (inicio) {
      where.push('DATE(os.created_at) >= ?');
      params.push(inicio);
    }

    // 🔹 Filtro por data final
    if (fim) {
      where.push('DATE(os.created_at) <= ?');
      params.push(fim);
    }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await db.query(`
      SELECT 
        os.id,
        os.descricao,
        os.status,
        os.created_at,
        n.titulo AS nota_titulo,
        n.imagem,
        u.nome AS admin_nome
      FROM ordens_servico os
      JOIN notas n ON n.id = os.nota_id
      JOIN usuarios u ON u.id = os.admin_id
      ${whereSQL}
      ORDER BY os.created_at DESC
    `, params);

    res.json(rows);

  } catch (err) {
    console.error('Erro ao buscar ordens:', err);
    res.status(500).json({ erro: 'Erro ao buscar ordens' });
  }
});



//------------------------------------------------------------
app.get('/ordens/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT 
        o.id,
        o.descricao,
        o.status,
        o.nota_id,
        u.nome AS admin_nome
      FROM ordens_servico o
      LEFT JOIN usuarios u ON o.admin_id = u.id
      WHERE o.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ mensagem: 'Ordem não encontrada' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('ERRO AO BUSCAR ORDEM:', error);
    res.status(500).json({ erro: 'Erro interno ao buscar ordem' });
  }
});

// 🔄 ATUALIZAR STATUS DA ORDEM (ADMIN)
app.put('/ordens/:id/status', autenticado, somenteAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const statusValidos = ['aberta', 'em andamento', 'encerrada'];

    if (!statusValidos.includes(status)) {
        return res.status(400).json({ mensagem: 'Status inválido' });
    }

    try {
        // Atualiza status da ordem
        await db.query(
            'UPDATE ordens_servico SET status = ? WHERE id = ?',
            [status, id]
        );

        // 🔗 SE A ORDEM FOR CONCLUÍDA → FECHA A NOTA
        if (status === 'encerrada') {
            await db.query(`
                UPDATE notas n
                JOIN ordens_servico os ON os.nota_id = n.id
                SET n.status = 'encerrada'
                WHERE os.id = ?
            `, [id]);
        }

        res.json({ mensagem: 'Status da ordem atualizado com sucesso' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao atualizar ordem' });
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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

