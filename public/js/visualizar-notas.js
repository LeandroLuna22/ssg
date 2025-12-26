document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/notas');

        if (!response.ok) {
            alert('Erro ao carregar notas');
            return;
        }

        const notas = await response.json();
        const lista = document.getElementById('listaNotas');

        lista.innerHTML = '';

        if (notas.length === 0) {
            lista.innerHTML = '<li>Nenhuma nota encontrada.</li>';
            return;
        }

        notas.forEach(nota => {
            const li = document.createElement('li');
            li.className = 'nota-item';

            li.innerHTML = `
                <div class="nota-info">
                    <strong>${nota.titulo}</strong>
                    <small>${new Date(nota.criada_em).toLocaleDateString()}</small>
                </div>
                <span class="status ${nota.status}">${nota.status}</span>
            `;

            li.addEventListener('click', () => {
                window.location.href = `nota.html?id=${nota.id}`;
            });

            lista.appendChild(li);
        });

    } catch (error) {
        console.error('Erro ao carregar notas:', error);
    }
});
