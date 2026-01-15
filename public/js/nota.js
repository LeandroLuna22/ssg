const params = new URLSearchParams(window.location.search);
const id = params.get('id');

// 🔹 VERIFICA SE É ADMIN
fetch('/user')
  .then(res => res.json())
  .then(user => {
    if (user.tipo === 'admin') {
      document.getElementById('adminArea').style.display = 'block';

      // 🔹 VERIFICA SE JÁ EXISTE ORDEM PARA A NOTA
      fetch(`/ordens/nota/${id}`)
        .then(res => res.json())
        .then(ordem => {
          const area = document.getElementById('ordemArea');

          if (!ordem) {
            // NÃO existe ordem → mostra botão
            area.innerHTML = `
              <button onclick="abrirOrdem()">
                Abrir Ordem de Serviço
              </button>
            `;
          } else {
  area.innerHTML = `
    <p><strong>Ordem já aberta</strong></p>
    <button onclick="verOrdem(${ordem.id})">
      Ver Ordem de Serviço
    </button>
  `;
}

        });
    }
  });

// 🔹 CARREGA NOTA
fetch(`/notas/${id}`)
  .then(res => res.json())
  .then(nota => {
    document.getElementById('titulo').innerText = nota.titulo;
    document.getElementById('descricao').innerText = nota.descricao;
    document.getElementById('status').innerText = nota.status;
    document.getElementById('autor').innerText = nota.autor;

    if (nota.imagem) {
      const img = document.getElementById('imagem');
      img.src = `/uploads/${nota.imagem}`;
      img.style.display = 'block';
    }

    const select = document.getElementById('novoStatus');
    if (select) select.value = nota.status;
  });

// 🔹 ABRIR ORDEM
function abrirOrdem() {
  const descricao = prompt('Descreva a ordem de serviço');

  if (!descricao) return;

  fetch('/ordens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nota_id: id,
      descricao
    })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.mensagem);
    location.reload();
  });
}

const btnAtualizar = document.getElementById('btnAtualizarStatus');

if (btnAtualizar) {
  btnAtualizar.addEventListener('click', () => {
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
    })
    .catch(err => {
      console.error(err);
      alert('Erro ao atualizar status');
    });
  });
}

function verOrdem(ordemId) {
  window.location.href = `ordem.html?id=${ordemId}`;
}


