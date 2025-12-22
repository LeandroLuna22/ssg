// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {

    // Seleciona o formulário
    const formNota = document.getElementById('formNota');

    if (!formNota) {
        console.error("Formulário 'formNota' não encontrado.");
        return;
    }

    // Evento de envio do formulário
    formNota.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede reload da página

        // Captura correta dos campos
        const titulo = document.getElementById('titulo-nota').value.trim();
        const descricao = document.getElementById('descricao-nota').value.trim();
        const imagemInput = document.getElementById('imagem-nota');

        // Validação básica
        if (!titulo || !descricao) {
            alert('Preencha o título e a descrição.');
            return;
        }

        // FormData permite envio de texto + arquivo
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descricao', descricao);

        // Anexa imagem somente se existir
        if (imagemInput.files.length > 0) {
            formData.append('imagem', imagemInput.files[0]);
        }

        try {
            // Envia para o backend
            const response = await fetch('/criar-nota', {
                method: 'POST',
                body: formData
            });

            const resultado = await response.json();

            if (response.ok) {
                alert('Nota criada com sucesso!');
                formNota.reset(); // Limpa formulário
            } else {
                alert(resultado.mensagem || 'Erro ao criar nota.');
            }

        } catch (erro) {
            console.error('Erro ao enviar nota:', erro);
            alert('Erro de conexão com o servidor.');
        }
    });
});
