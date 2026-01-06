fetch('/ordens')
  .then(res => res.json())
  .then(ordens => {
    const lista = document.getElementById('listaOrdens');
    lista.innerHTML = '';

    if (ordens.length === 0) {
      lista.innerHTML = '<p>Nenhuma ordem encontrada.</p>';
      return;
    }

ordens.forEach(ordem => {
  const item = document.createElement('div');
  item.classList.add('ordem-item');

  item.innerHTML = `
    <div class="ordem-header">
      <strong>${ordem.nota_titulo}</strong>
      <span class="status ${ordem.status}">${ordem.status}</span>
      <small>${new Date(ordem.created_at).toLocaleDateString()}</small>
    </div>

    <div class="ordem-detalhes" style="display:none">
      <p><strong>Descrição:</strong> ${ordem.descricao}</p>
      <p><strong>Administrador:</strong> ${ordem.admin_nome}</p>

      ${
        ordem.imagem
          ? `<img src="/uploads/${ordem.imagem}" class="ordem-imagem">`
          : ''
      }

      <div class="ordem-acoes">
        <label>Status:</label>
        <select class="statusOrdem">
          <option value="aberta">Aberta</option>
          <option value="em andamento">Em andamento</option>
          <option value="concluida">Encerrada</option>
        </select>
        <button class="btnAtualizarOrdem">Atualizar</button>
      </div>
    </div>
  `;

  // 🔹 Toggle accordion
  item.querySelector('.ordem-header').addEventListener('click', () => {
    const detalhes = item.querySelector('.ordem-detalhes');
    detalhes.style.display =
      detalhes.style.display === 'none' ? 'block' : 'none';
  });

  // 🔹 Preenche status atual
  const select = item.querySelector('.statusOrdem');
  select.value = ordem.status;

  // 🔹 Atualizar status
  item.querySelector('.btnAtualizarOrdem').addEventListener('click', () => {
    fetch(`/ordens/${ordem.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: select.value })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.mensagem);
      location.reload();
    });
  });

  lista.appendChild(item);
});

  })
  .catch(err => {
    console.error(err);
    alert('Erro ao carregar ordens');
  });


