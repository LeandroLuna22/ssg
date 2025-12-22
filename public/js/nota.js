const params = new URLSearchParams(window.location.search);
const id = params.get('id');

fetch(`/notas/${id}`)
    .then(res => res.json())
    .then(nota => {
        document.getElementById('titulo').innerText = nota.titulo;
        document.getElementById('descricao').innerText = nota.descricao;
        document.getElementById('status').innerText = nota.status;
        document.getElementById('autor').innerText = nota.nome;

        if (nota.imagem) {
            const img = document.getElementById('imagem');
            img.src = `/uploads/${nota.imagem}`;
            img.style.display = 'block';
        }

        // verifica se é admin
        fetch('/user')
            .then(res => res.json())
            .then(user => {
                if (user.tipo === 'admin') {
                    document.getElementById('adminArea').style.display = 'block';
                    document.getElementById('novoStatus').value = nota.status;
                }
            });
    });

function atualizarStatus() {
    const novoStatus = document.getElementById('novoStatus').value;

    fetch(`/notas/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.mensagem);
        location.reload();
    });
}
