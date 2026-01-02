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
        <h3>Ordem #${ordem.id}</h3>
        <p><strong>Status:</strong> ${ordem.status}</p>
        <p><strong>Descrição:</strong> ${ordem.descricao}</p>
        <p><strong>Nota:</strong> ${ordem.titulo_nota}</p>
        <p><strong>Administrador:</strong> ${ordem.admin_nome}</p>

        <a href="nota.html?id=${ordem.nota_id}">
          Ver Nota
        </a>
      `;

      lista.appendChild(item);
    });
  })
  .catch(err => {
    console.error(err);
    alert('Erro ao carregar ordens de serviço');
  });
