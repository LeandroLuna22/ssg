document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('cadastroForm');

    if (!cadastroForm) {
        console.error("Formulário com ID 'cadastroForm' não encontrado.");
        return;
    }

    cadastroForm.addEventListener('submit', async (e) => {
       e.preventDefault();

       const nome = document.getElementById('nome').value;
       const senha = document.getElementById('senha').value;
       const apartamento = document.getElementById('apartamento').value;
       const tipo = document.getElementById('tipo').value;

       const userData = {
        nome,
        senha,
        apartamento,
        tipo
       };

       try {
        const response = await fetch('/cadastrar', {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

            if (response.ok) {
                
                alert(data.mensagem || 'Cadastro realizado com sucesso!');
                console.log('Dados recebidos:', data);
                
                cadastroForm.reset(); 

            } else {
                
                alert(data.mensagem || 'Erro desconhecido ao cadastrar.');
                console.error('Falha no cadastro:', data);
            }

        } catch (error) {
            
            console.error('Erro de conexão ou requisição:', error);
            alert('Não foi possível conectar ao servidor. Verifique sua conexão.');
        }
    });
});