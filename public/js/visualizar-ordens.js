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
    item.classList.add('item-lista');

    item.innerHTML = `
      <details class="accordion-ordem">
        <summary>
          <strong>${ordem.nota_titulo}</strong>
          <span class="status ${ordem.status}">${ordem.status}</span>
          <small>${new Date(ordem.created_at).toLocaleDateString()}</small>
        </summary>

        <div class="conteudo-ordem">
          <p>${ordem.descricao}</p>

          ${
            ordem.imagem
              ? `<img src="/uploads/${ordem.imagem}" style="max-width:300px">`
              : ''
          }

          <p><small>Administrador: ${ordem.admin_nome}</small></p>

          <label>Status da ordem:</label>
          <select class="statusOrdem">
            <option value="aberta">Aberta</option>
            <option value="em andamento">Em andamento</option>
            <option value="encerrada">Encerrada</option>
          </select>

          <button class="btnAtualizarOrdem">Atualizar Status</button>
        </div>
      </details>
    `;

    // 🔹 Preencher status atual
    const select = item.querySelector('.statusOrdem');
    select.value = ordem.status;

    // 🔹 Atualizar status
    item.querySelector('.btnAtualizarOrdem').addEventListener('click', () => {
      atualizarStatusOrdem(ordem.id, select.value);
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
    .then(res => res.json())
    .then(data => {
      alert(data.mensagem);
      carregarOrdens(); // 🔄 recarrega mantendo regra padrão
    })
    .catch(err => {
      console.error(err);
      alert('Erro ao atualizar status da ordem');
    });
}



