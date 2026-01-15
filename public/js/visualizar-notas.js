document.addEventListener('DOMContentLoaded', async () => {
    const formFiltro = document.getElementById('filtroNotas');
    const lista = document.getElementById('listaNotas');

    async function carregarNotas() {
        try {
            const status = document.getElementById('status').value;
            const inicio = document.getElementById('inicio').value;
            const fim = document.getElementById('fim').value;

            const params = new URLSearchParams();

            if (status) params.append('status', status);
            if (inicio) params.append('inicio', inicio);
            if (fim) params.append('fim', fim);

            const response = await fetch(`/notas?${params.toString()}`);

            if (!response.ok) {
                alert('Erro ao carregar notas');
                return;
            }

            const notas = await response.json();
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
    }

    // 🔹 Carrega ao abrir a página
    carregarNotas();

    // 🔹 Recarrega ao aplicar filtro
    if (formFiltro) {
        formFiltro.addEventListener('submit', (e) => {
            e.preventDefault();
            carregarNotas();
        });
    }
});
