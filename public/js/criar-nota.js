document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formNota');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        try {
            const response = await fetch('/criar-nota', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.mensagem || 'Erro ao criar nota');
                return;
            }

            alert('Nota criada com sucesso!');
            form.reset();

            // opcional: redirecionar
            window.location.href = '/visualizar-notas.html';

        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão com o servidor');
        }
    });
});
