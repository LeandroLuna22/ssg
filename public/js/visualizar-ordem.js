const params = new URLSearchParams(window.location.search);
const id = params.get('id');

if (!id) {
  alert('Ordem inválida');
  history.back();
}

fetch(`/ordens/${id}`)
  .then(res => res.json())
  .then(ordem => {
    document.getElementById('id').innerText = ordem.id;
    document.getElementById('status').innerText = ordem.status;
    document.getElementById('descricao').innerText = ordem.descricao;
    document.getElementById('nota').innerText = ordem.nota_id ?? '—';
  });
