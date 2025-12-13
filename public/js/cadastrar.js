// Espera até que todo o conteúdo do DOM seja carregado antes de executar o código
document.addEventListener('DOMContentLoaded', () => {

    // Seleciona o formulário pelo ID 'formCadastro'
    const formCadastro = document.getElementById('formCadastro');

    // Verifica se o formulário realmente existe na página
    if (!formCadastro) {
        console.error("Formulário com ID 'formCadastro' não encontrado.");
        return; // Para a execução caso o formulário não seja encontrado
    }

    // Adiciona um listener para o evento 'submit' do formulário
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita que a página seja recarregada ao enviar o formulário

        // Captura os valores dos campos do formulário
        const nome = document.getElementById('nome').value;
        const senha = document.getElementById('senha').value;
        const apartamento = document.getElementById('apartamento').value;
        const tipo = document.getElementById('tipo').value;

        // Cria um objeto com os dados do usuário para enviar ao backend
        const userData = {
            nome,
            senha,
            apartamento,
            tipo
        };

        try {
            // Envia os dados para o backend usando fetch (requisição POST)
            const response = await fetch('/cadastrar', {
                method: 'POST', // Método HTTP POST
                headers: {
                    'Content-Type': 'application/json' // Indica que os dados estão em JSON
                },
                body: JSON.stringify(userData) // Converte o objeto userData em JSON para enviar
            });

            // Converte a resposta do backend de JSON para objeto JavaScript
            const data = await response.json();

            // Verifica se a resposta foi bem-sucedida (código HTTP 200-299)
            if (response.ok) {
                alert(data.mensagem || 'Cadastro realizado com sucesso!'); // Mostra mensagem de sucesso
                console.log('Dados recebidos:', data); // Exibe no console os dados retornados pelo backend
                formCadastro.reset(); // Limpa os campos do formulário
            } else {
                // Caso o backend retorne erro (código HTTP 400-599)
                alert(data.mensagem || 'Erro desconhecido ao cadastrar.');
                console.error('Falha no cadastro:', data);
            }

        } catch (error) {
            // Captura erros de conexão ou problemas na requisição fetch
            console.error('Erro de conexão ou requisição:', error);
            alert('Não foi possível conectar ao servidor. Verifique sua conexão.');
        }
    });
});
