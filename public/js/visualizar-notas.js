document.addEventListener('DOMContentLoaded', async () => {

    try {
        const response = await fetch('/notas');

        if (!response.ok) {
            alert('Erro ao carregar notas');
            return;
        }

        const notas = await response.json();
        const container = document.getElementById('lista-notas');

        if (notas.length === 0) {
            container.innerHTML = '<p>Nenhuma nota encontrada.</p>';
            return;
        }

        notas.forEach(nota => {
            const div = document.createElement('div');
            div.classList.add('nota');

            div.innerHTML = `
                <h3>${nota.titulo}</h3>
                <p>${nota.descricao}</p>
                <small>Status: ${nota.status}</small><br>
                <small>Criada em: ${new Date(nota.criada_em).toLocaleString()}</small>
                ${nota.imagem ? `<img src="/uploads/${nota.imagem}" width="200">` : ''}
                <hr>
            `;

            container.appendChild(div);
        });

    } catch (error) {
        console.error('Erro:', error);
    }
});
