/*Envia a nota para o backend usando fetch.
Usa FormData para permitir envio de imagem.*/

// criar-nota.js
document.getElementById('form-nota').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = document.getElementById('form-nota');
    const formData = new FormData(form);

    try {
        const resposta = await fetch('/criar-nota', {
            method: 'POST',
            body: formData
        });

        if (!resposta.ok) {
            alert('Erro ao enviar a nota');
            return;
        }

        alert('Nota criada com sucesso!');
        form.reset();

    } catch (erro) {
        alert('Erro de conexão com o servidor');
    }
});
