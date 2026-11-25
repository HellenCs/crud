const chave = 'meusRegistros';
let altId = null;
let modo = 'cadastro';

function gerarCodigo(tamanho = 4) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let resultado = '';

    for (let i = 0; i < tamanho; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    return resultado;
}

document.addEventListener('DOMContentLoaded', function() {
    const campoCodigo = document.getElementById('codigo');
    if (campoCodigo) campoCodigo.value = gerarCodigo(4);
});

const inputFoto = document.getElementById('foto');
const previaImagem = document.getElementById('previa-imagem');

if (inputFoto && previaImagem) {
    inputFoto.addEventListener('input', function() {
        const nome = inputFoto.value.trim();

        if (nome !== "") {
            previaImagem.src = "imagens/" + nome + ".jpg";
            previaImagem.style.display = "block";
        } else {
            previaImagem.src = "";
            previaImagem.style.display = "none";
        }
    });
}

function carregarRegistros() {
    const registros = localStorage.getItem(chave);
    return registros ? JSON.parse(registros) : [];
}

function salvarRegistros(registros) {
    localStorage.setItem(chave, JSON.stringify(registros));
}

function renderizarTabela() {
    const tbody = document.querySelector('#tabelaRegistros tbody');
    tbody.innerHTML = '';

    const registros = carregarRegistros();

    if (registros.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Nenhum registro</td></tr>';
        return;
    }

    registros.forEach(reg => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>
                <img src="imagens/${escapeHtml(reg.foto)}.jpg"
                width="70" alt="${escapeHtml(reg.produto)}">
            </td>
            <td>${escapeHtml(reg.codigo)}</td>
            <td>${escapeHtml(reg.produto)}</td>
            <td>${escapeHtml(reg.descricao)}</td>
            <td>${escapeHtml(reg.preco)}</td>
            <td>
                <button data-id="${reg.id}" class="btn-editar">Editar</button>
                <button data-id="${reg.id}" class="btn-excluir">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-editar').forEach(b => {
        b.addEventListener('click', e => {
            carregarRegistroNoFormulario(e.currentTarget.getAttribute('data-id'));
        });
    });

    tbody.querySelectorAll('.btn-excluir').forEach(b => {
        b.addEventListener('click', e => {
            carregarRegistroParaExcluir(e.currentTarget.getAttribute('data-id'));
        });
    });
}

function carregarRegistroNoFormulario(id) {
    const registros = carregarRegistros();
    const reg = registros.find(r => r.id === id);

    if (!reg) return;

    preencherFormulario(reg);

    altId = reg.id;
    modo = 'edicao';

    document.querySelector('h1').textContent = 'Alteração de Produto';

    document.getElementById('codigo').readOnly = true;

    document.getElementById('btnCadastrar').textContent = 'Salvar alterações';
    document.getElementById('btnCadastrar').classList.remove('hidden');

    document.getElementById('btnExcluir').classList.add('hidden');
    document.getElementById('btnCancelar').classList.remove('hidden');
}

function carregarRegistroParaExcluir(id) {
    const registros = carregarRegistros();
    const reg = registros.find(r => r.id === id);

    if (!reg) return;

    preencherFormulario(reg);

    altId = reg.id;
    modo = 'exclusao';

    document.querySelector('h1').textContent = 'Exclusão de Produtos';

    document.getElementById('codigo').readOnly = true;
    document.getElementById('produto').readOnly = true;
    document.getElementById('descricao').readOnly = true;
    document.getElementById('preco').readOnly = true;
    document.getElementById('foto').readOnly = true;

    document.getElementById('btnCadastrar').classList.add('hidden');
    document.getElementById('btnExcluir').classList.remove('hidden');
    document.getElementById('btnCancelar').classList.remove('hidden');
}

function preencherFormulario(reg) {
    document.getElementById('registroId').value = reg.id;
    document.getElementById('codigo').value = reg.codigo;
    document.getElementById('produto').value = reg.produto;
    document.getElementById('descricao').value = reg.descricao;
    document.getElementById('preco').value = reg.preco;
    document.getElementById('foto').value = reg.foto;

    if (reg.foto && previaImagem) {
        previaImagem.src = "imagens/" + reg.foto + ".jpg";
        previaImagem.style.display = "block";
    }
}

function inserirRegistro(dados) {
    const registros = carregarRegistros();
    const id = Date.now().toString(36);

    registros.push({ id, ...dados });

    salvarRegistros(registros);
}
 
function excluirRegistro(id) {
    const registros = carregarRegistros().filter(r => r.id !== id);

    salvarRegistros(registros);

    resetFormulario();
    renderizarTabela();
}

function atualizarRegistro(id, novosDados) {
    const registros = carregarRegistros();
    const idx = registros.findIndex(r => r.id === id);

    if (idx !== -1) {
        registros[idx] = { id, ...novosDados };
        salvarRegistros(registros);
    }
}

function resetFormulario() {
    document.getElementById('formRegistro').reset();
    document.getElementById('registroId').value = '';

    if (previaImagem) {
        previaImagem.src = "";
        previaImagem.style.display = "none";
    }

    altId = null;
    modo = 'cadastro';

    document.querySelector('h1').textContent = 'Cadastro de Produtos';

    document.getElementById('btnCadastrar').textContent = 'Cadastrar Produto';
    document.getElementById('btnCadastrar').classList.remove('hidden');

    document.getElementById('btnExcluir').classList.add('hidden');
    document.getElementById('btnCancelar').classList.remove('hidden');

    document.getElementById('codigo').readOnly = false;
    document.getElementById('produto').readOnly = false;
    document.getElementById('descricao').readOnly = false;
    document.getElementById('preco').readOnly = false;
    document.getElementById('foto').readOnly = false;

    document.getElementById('codigo').value = gerarCodigo(4);
}

function escapeHtml(str) {
    if (!str && str !== 0) return '';

    return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#039;',
        '"': '&quot;'
    }[tag] || tag));
}

document.getElementById('formRegistro').addEventListener('submit', function(e) {
    e.preventDefault();

    const codigo = document.getElementById('codigo').value.trim();
    const produto = document.getElementById('produto').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const preco = document.getElementById('preco').value.trim();
    const foto = document.getElementById('foto').value.trim();

    if (!codigo || !produto || !descricao || !preco || !foto) {
        alert('Preencha todos os campos.');
        return;
    }

    const dados = { codigo, produto, descricao, preco, foto };

    if (modo === 'edicao') {
        atualizarRegistro(altId, dados);
    } else if (modo === 'cadastro') {
        inserirRegistro(dados);
    } else {
        return;
    }

    resetFormulario();
    renderizarTabela();
});

document.getElementById('btnExcluir').addEventListener('click', function() {
    if (altId && modo === 'exclusao') {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            excluirRegistro(altId);
        }
    }
});

document.getElementById('btnCancelar').addEventListener('click', function() {
    if (modo === 'cadastro') {
        resetFormulario();
    } else if (confirm('Deseja cancelar esta operação?')) {
        resetFormulario();
    }
});

renderizarTabela();
