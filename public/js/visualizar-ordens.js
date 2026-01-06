fetch('/ordens')
  .then(res => res.json())
  .then(ordens => {
    const lista = document.getElementById('listaOrdens');
    lista.innerHTML = '';

    if (ordens.length === 0) {
      lista.innerHTML = '<p>Nenhuma ordem de serviço encontrada.</p>';
      return;
    }

    ordens.forEach(ordem => {
      const item = document.createElement('div');
      item.classList.add('item-lista');

      item.innerHTML = `
        <div class="ordem-info">
          <strong>${ordem.nota_titulo}</strong>
          <small>${new Date(ordem.created_at).toLocaleDateString()}</small>
        </div>

        <p>${ordem.descricao}</p>

        <span class="status ${ordem.status}">
          ${ordem.status}
        </span>

        <small>Administrador: ${ordem.admin_nome}</small>
      `;

      lista.appendChild(item);
    });
  })
  .catch(err => {
    console.error(err);
    alert('Erro ao carregar ordens de serviço');
  });

