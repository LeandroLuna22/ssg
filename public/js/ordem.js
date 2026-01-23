const params = new URLSearchParams(window.location.search);
const ordemId = params.get('id');

// ======================================================
// 🔹 CARREGAR ORDEM
// ======================================================
fetch(`/ordens/${ordemId}`)
  .then(res => res.json())
  .then(ordem => {
    document.getElementById('titulo').innerText =
      `Ordem de Serviço #${ordem.id}`;

    document.getElementById('descricao').innerText = ordem.descricao;
    document.getElementById('status').innerText = ordem.status;
    document.getElementById('admin').innerText = ordem.admin_nome || '-';

    document.getElementById('voltarNota').href =
      `nota.html?id=${ordem.nota_id}`;

    // 🔹 Preenche o select com o status atual
    const select = document.getElementById('novoStatus');
    select.value = ordem.status;

    // 🔒 Bloqueia se já estiver encerrada
    if (ordem.status === 'encerrada') {
      select.disabled = true;
      document.getElementById('btnAtualizarStatus').disabled = true;
    }

    carregarHistorico(ordemId);
  })
  .catch(err => {
    console.error(err);
    alert('Erro ao carregar ordem');
  });

// ======================================================
// 🔹 ATUALIZAR STATUS
// ======================================================
document
  .getElementById('btnAtualizarStatus')
  .addEventListener('click', async () => {

    const novoStatus = document.getElementById('novoStatus').value;

    const res = await fetch(`/ordens/${ordemId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.mensagem || 'Erro ao atualizar status');
      return;
    }

    alert(data.mensagem);
    location.reload();
  });

// ======================================================
// 🔹 CARREGAR HISTÓRICO
// ======================================================
async function carregarHistorico(ordemId) {
  const res = await fetch(`/ordens/${ordemId}/historico`);
  const historico = await res.json();

  const lista = document.getElementById('historicoLista');
  lista.innerHTML = '';

  if (historico.length === 0) {
    lista.innerHTML = '<p>Nenhuma atualização ainda.</p>';
    return;
  }

  historico.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('item-historico');

    div.innerHTML = `
      <p>${item.descricao}</p>
      <small>
        ${item.autor} — 
        ${new Date(item.criada_em).toLocaleString()}
      </small>
    `;

    lista.appendChild(div);
  });
}

// ======================================================
// 🔹 INSERIR DESCRITIVO
// ======================================================
document
  .getElementById('formHistorico')
  .addEventListener('submit', async e => {

    e.preventDefault();

    const descricao = document
      .getElementById('descricaoHistorico')
      .value
      .trim();

    if (!descricao) return;

    const res = await fetch(`/ordens/${ordemId}/historico`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao })
    });

    const data = await res.json();
    alert(data.mensagem);

    document.getElementById('descricaoHistorico').value = '';
    carregarHistorico(ordemId);
  });


