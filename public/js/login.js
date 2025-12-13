// Seleciona o formulário pelo ID
const form = document.getElementById('loginForm');
// Seleciona o elemento onde as mensagens de erro serão exibidas
const message = document.getElementById('message');

// Adiciona evento ao submeter o formulário
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que a página recarregue ao enviar o formulário

    // Pega os valores digitados nos inputs pelo ID
    const nome = document.getElementById('nome').value;
    const senha = document.getElementById('senha').value;

    try {
        // Faz requisição POST para a rota /login do servidor
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // Envia JSON
            body: JSON.stringify({ nome, senha }) // Converte os dados para JSON
        });

        // Lê a resposta do servidor como JSON
        const data = await response.json();

        // Se a resposta HTTP não for OK (200–299), mostra a mensagem de erro
        if (!response.ok) {
            message.textContent = data.mensagem; // Ex.: "Usuário ou senha incorretos"
            return; // Para a execução aqui, não faz o redirecionamento
        }

        // Se chegou aqui, login foi bem-sucedido
        window.location.href = 'index.html'; // Redireciona para a página principal

    } catch (error) {
        // Caso haja falha na requisição (ex.: servidor offline)
        console.error('Erro ao tentar logar:', error);
        message.textContent = 'Erro ao conectar com o servidor.';
    }
});

