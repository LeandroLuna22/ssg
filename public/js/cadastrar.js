fetch('/cadastrar', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ nome, senha, apartamento, tipo})
});