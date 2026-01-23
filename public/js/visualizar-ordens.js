document.addEventListener('DOMContentLoaded', () => {
  carregarOrdens();

  document.getElementById('filtroOrdens').addEventListener('submit', e => {
    e.preventDefault();
    aplicarFiltro();
  });
});

// ======================================================
// 🔹 CARREGAR ORDENS
// ======================================================
function carregarOrdens(url = '/ordens') {
  fetch(url)
    .then(res => res.json())
    .then(ordens => renderizarOrdens(ordens))
    .catch(err => {
      console.error(err);
      alert('Erro ao carregar ordens');
    });
}

// ======================================================
// 🔹 FILTRO
// ======================================================
function aplicarFiltro() {
  const status = document.getElementById('filtroStatus').value;
  const inicio = document.getElementById('filtroInicio').value;
  const fim = document.getElementById('filtroFim').value;

  let url = '/ordens?';

  if (status) url += `status=${status}&`;
  if (inicio) url += `inicio=${inicio}&`;
  if (fim) url += `fim=${fim}`;

  carregarOrdens(url);
}

// ======================================================
// 🔹 RENDERIZAR ORDENS (COM AÇÕES)
// ======================================================
function renderizarOrdens(ordens) {
  const lista = document.getElementById('listaOrdens');
  lista.innerHTML = '';

  if (!ordens || ordens.length === 0) {
    lista.innerHTML = '<p>Nenhuma ordem encontrada.</p>';
    return;
  }

  ordens.forEach(ordem => {
    const item = document.createElement('div');
    item.classList.add('item-lista', 'clicavel');

    item.innerHTML = `
      <div class="linha-principal">
        <strong>${ordem.nota_titulo}</strong>
        <span class="status ${ordem.status}">${ordem.status}</span>
        <small>${new Date(ordem.created_at).toLocaleDateString()}</small>
      </div>

      <div class="linha-secundaria">
        <small>Administrador: ${ordem.admin_nome ?? '-'}</small>
      </div>
    `;

    // 👉 Clique abre página da ordem
    item.addEventListener('click', () => {
      window.location.href = `ordem.html?id=${ordem.id}`;
    });

    lista.appendChild(item);
  });
}

// ======================================================
// 🔹 ATUALIZAR STATUS DA ORDEM
// ======================================================
function atualizarStatusOrdem(id, status) {
  fetch(`/ordens/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
    .then(async res => {
      const data = await res.json();

      if (!res.ok) {
        alert(data.mensagem || 'Erro ao atualizar status');
        return;
      }

      alert(data.mensagem);
      carregarOrdens();

    })
    .catch(err => {
      console.error(err);
      alert('Erro ao atualizar status da ordem');
    });
}




