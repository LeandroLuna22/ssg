const params = new URLSearchParams(window.location.search);
const id = params.get('id');

// 🔹 CARREGA ORDEM
fetch(`/ordens/${id}`)
  .then(res => res.json())
  .then(ordem => {
    document.getElementById('titulo').innerText =
      `Ordem de Serviço #${ordem.id}`;

    document.getElementById('descricao').innerText = ordem.descricao;
    document.getElementById('status').innerText = ordem.status;
    document.getElementById('admin').innerText = ordem.admin_nome;

    document.getElementById('voltarNota').href =
      `nota.html?id=${ordem.nota_id}`;
  })
  .catch(err => {
    console.error(err);
    alert('Erro ao carregar ordem');
  });
