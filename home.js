
let carregando = true;
let historicoVersoes = [];

function gerarMarkdown() {
   const form = document.getElementById('markdownForm');
   const timesSelecionados = ($('#selectTimes').val() || []).map(i => `[${i}]`).join(" - ");
   const nomeProjeto = form.projeto.value;
   const escopoProjeto = form.escopoProjeto.value;
   const analiseRequisitos = form.analiseRequisitos.value;

   let markdown = `

## ${timesSelecionados} ${nomeProjeto}

**Escopo do Projeto:** ${escopoProjeto}  
**Análise de Requisitos:** ${analiseRequisitos}

## Controle de Versões

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
${historicoVersoes.map(v => 
   `| ${v.versao} | ${v.data} | ${v.autor} | ${v.alteracoes} |`
 ).join("\n")}

## Objetivo

${form.objetivo.value}

## Itens fora do escopo

${form.foraEscopo.value}

## Requisitos
`;

   // Iterar por cada requisito
   const requisitos = document.querySelectorAll("#containerRequisitos > .accordion-item");
   requisitos.forEach((requisito, i) => {
      const titulo = requisito.querySelector(".requisitoTitulo")?.value || `Requisito ${i + 1}`;
      markdown += `

### ${titulo}
`;

      const stories = requisito.querySelectorAll(".userStory");
      stories.forEach((storyInput, j) => {
         const story = storyInput.value;
         const intro = requisito.querySelectorAll(".introducao")[j].value;
         const sistema = requisito.querySelectorAll(".sistema")[j].value;
         const caminho = requisito.querySelectorAll(".caminho")[j].value;
         const regras = requisito.querySelectorAll(".regras")[j].value;
         const funcName = requisito.querySelectorAll(".funcName")[j].value;
         const path = requisito.querySelectorAll(".path")[j].value;
         const descFunc = requisito.querySelectorAll(".descFunc")[j].value;
         const temFuncionalidade = requisito.querySelectorAll(".toggleFuncionalidade")[j]?.checked;

         markdown += `

#### ${story}

${intro}

**Sistema:** ${sistema}  
**Caminho:** ${caminho}  

**Regras:**  
${regras}

`;

if (temFuncionalidade) {
  markdown += `
**Funcionalidade**

| Nome da Funcionalidade | Caminho no Menu do Sistema/Perfil | Descrição |
|------------------------|------------------------------------|-----------|
| ${funcName} | ${path} | ${descFunc} |
`;
}
      });
   });

   document.getElementById('resultado').textContent = markdown;

   Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Markdown gerado com sucesso!',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
   });

   const dadosForm = {
      versao: form.versao.value,
      data: form.data.value,
      autor: form.autor.value,
      objetivo: form.objetivo.value,
      projeto: form.projeto.value,
      escopoProjeto: form.escopoProjeto.value,
      analiseRequisitos: form.analiseRequisitos.value,
      foraEscopo: itensForaEscopo,
      times: $('#selectTimes').val() || [],
      alteracoes: form.alteracoes.value,
      requisitos: []
   };

   document.querySelectorAll("#containerRequisitos > .accordion-item").forEach(requisito => {
      const titulo = requisito.querySelector(".requisitoTitulo")?.value || "";
      const stories = [];

      requisito.querySelectorAll(".userStory").forEach((storyInput, i) => {
         stories.push({
            userStory: storyInput.value,
            introducao: requisito.querySelectorAll(".introducao")[i].value,
            sistema: requisito.querySelectorAll(".sistema")[i].value,
            caminho: requisito.querySelectorAll(".caminho")[i].value,
            regras: requisito.querySelectorAll(".regras")[i].value,
            funcName: requisito.querySelectorAll(".funcName")[i].value,
            path: requisito.querySelectorAll(".path")[i].value,
            foraEscopo: [...itensForaEscopo],
            descFunc: requisito.querySelectorAll(".descFunc")[i].value
         });
      });

      dadosForm.requisitos.push({
         titulo,
         stories
      });
   });

   localStorage.setItem("markdownForm", JSON.stringify(dadosForm));
}

let itensForaEscopo = [];

function adicionarItem() {
   const input = document.getElementById("inputForaEscopo");
   const valor = input.value.trim();
   if (valor !== "") {
      itensForaEscopo.push(valor);
      atualizarLista();
      salvarDados(); // ✅ aqui
      input.value = "";
   }
}

function atualizarLista() {
   const ul = document.getElementById("listaForaEscopo");
   ul.innerHTML = "";
   itensForaEscopo.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      li.textContent = item;

      const btn = document.createElement("button");
      btn.textContent = "✕";
      btn.className = "btn btn-sm btn-danger";
      btn.onclick = () => {
         itensForaEscopo.splice(index, 1);
         atualizarLista();
         salvarDados(); // ✅ aqui também
      };

      li.appendChild(btn);
      ul.appendChild(li);
   });

   document.getElementById("foraEscopo").value = itensForaEscopo.map(i => `- ${i}`).join("\n");
}

let contadorRequisito = 0;
const requisitosExtras = [];

function alternarIcone(botao) {
   const icone = botao.querySelector("i");
   const targetId = botao.getAttribute("data-bs-target");
   const target = document.querySelector(targetId);

   if (target.classList.contains("show")) {
      // Vai fechar
      icone.classList.remove("fa-chevron-up");
      icone.classList.add("fa-chevron-down");
   } else {
      // Vai abrir
      icone.classList.remove("fa-chevron-down");
      icone.classList.add("fa-chevron-up");
   }
}

function removerRequisito(botao) {
   const card = botao.closest(".mb-3");
   if (card) {
      card.remove();
   }
}

function copiarMarkdown() {
   const markdown = document.getElementById("resultado").textContent;
   navigator.clipboard.writeText(markdown)
      .then(() => {
         Swal.fire({
            icon: 'success',
            title: 'Copiado!',
            text: 'Markdown copiado para a área de transferência. ✅',
            timer: 2000,
            showConfirmButton: false
         });
      })
      .catch(err => {
         console.error("Erro ao copiar: ", err);
         Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Não foi possível copiar o conteúdo. 😕'
         });
      });
}

document.getElementById("inputForaEscopo").addEventListener("keydown", function (event) {
   if (event.key === "Enter") {
      event.preventDefault(); // Evita o submit, se estiver dentro de um <form>
      adicionarItem();
   }
});

let contadorCards = 0;

function adicionarRequisitoCard() {
   contadorCards++;
   const container = document.getElementById("containerRequisitos");

   const card = document.createElement("div");
   card.className = "card rounded p-3 bg-light mb-3";

   card.innerHTML = `
    <div class="mb-3">
      <label class="form-label">Requisito (Ex: RF01 - Nome do Requisito)</label>
      <input type="text" class="form-control border-secondary requisitoCard">
    </div>
    <div class="mb-3">
      <label class="form-label">User Story</label>
      <input type="text" class="form-control border-secondary userStoryCard">
    </div>
    <div class="mb-3">
      <label class="form-label">Introdução do Requisito</label>
      <textarea class="form-control border-secondary introducaoCard"></textarea>
    </div>
    <div class="row">
      <div class="col-md-6 mb-3">
        <label class="form-label">Sistema</label>
        <input type="text" class="form-control border-secondary sistemaCard">
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label">Caminho</label>
        <input type="text" class="form-control border-secondary caminhoCard">
      </div>
    </div>
    <div class="mb-3">
      <label class="form-label">Regras</label>
      <textarea class="form-control border-secondary regrasCard"></textarea>
    </div>
    <div class="row">
      <div class="col-md-4 mb-3">
        <label class="form-label">Nome da Funcionalidade</label>
        <input type="text" class="form-control border-secondary funcNameCard">
      </div>
      <div class="col-md-4 mb-3">
        <label class="form-label">Caminho no Menu</label>
        <input type="text" class="form-control border-secondary pathCard">
      </div>
      <div class="col-md-4 mb-3">
        <label class="form-label">Descrição</label>
        <input type="text" class="form-control border-secondary descFuncCard">
      </div>
    </div>
  `;

   container.appendChild(card);
}

let requisitoIndex = 0;

function adicionarRequisitoComUserStory(req = {
   titulo: "RF01 - Nome do Requisito",
   stories: []
}) {
   const container = document.getElementById("containerRequisitos");
   const index = requisitoIndex++;
   const requisitoId = `requisito-${index}`;
   const storiesId = `userstories-${index}`;
   const headingId = `heading-${index}`;
   const collapseId = `collapse-${index}`;

   const div = document.createElement("div");
   div.className = "accordion-item";
   const corIndex = Math.floor(Math.random() * 5) + 1;
   div.classList.add(`requisito-cor`);
   div.innerHTML = `
  <h2 class="accordion-header" id="${headingId}">
    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
            data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
      <span class="titulo-preview">Novo Requisito</span>
    </button>
  </h2>
  <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}" data-bs-parent="#containerRequisitos">
    <div class="accordion-body">
      <div class="mb-3">
        <label class="form-label">Requisito (Ex: RF01 - Nome do Requisito)</label>
        <input type="text" class="form-control border-secondary requisitoTitulo" value="${req.titulo}"
               oninput="this.closest('.accordion-item').querySelector('.titulo-preview').textContent = this.value || 'Novo Requisito'">
      </div>
      <div id="${storiesId}" class="mt-3 border-start border-3 ps-3"></div>
      <div class="d-flex justify-content-between mt-3">
        <button type="button" class="btn btn-outline-primary btn-sm" onclick="adicionarUserStory('${storiesId}')">
          <i class="fa-solid fa-plus"></i> Adicionar Story
        </button>
        <button type="button" class="btn btn-outline-danger btn-sm" onclick="removerRequisitoCard(this)">
          <i class="fa-solid fa-trash"></i> Remover Requisito
        </button>
      </div>
    </div>
  </div>
`;

   container.appendChild(div);
   salvarDados();
   return div;
}

function adicionarUserStory(storiesId) {
   const container = document.getElementById(storiesId);
   const storyDiv = document.createElement("div");
   storyDiv.className = "card p-3 mb-3 bg-white border";

   storyDiv.innerHTML = `
    <div class="mb-2">
      <label class="form-label">User Story</label>
      <input type="text" class="form-control border-secondary userStory">
    </div>
    <div class="mb-2">
      <label class="form-label">Introdução</label>
      <textarea class="form-control border-secondary introducao"></textarea>
    </div>
    <div class="row">
      <div class="col-md-6 mb-2">
        <label class="form-label">Sistema</label>
        <input type="text" class="form-control border-secondary sistema">
      </div>
      <div class="col-md-6 mb-2">
        <label class="form-label">Caminho</label>
        <input type="text" class="form-control border-secondary caminho">
      </div>
    </div>
    <div class="mb-2">
      <label class="form-label">Regras</label>
      <textarea class="form-control border-secondary regras"></textarea>
    </div>
    <hr />
    <div class="form-check form-switch mb-2">
  <input class="form-check-input toggleFuncionalidade" type="checkbox" checked id="switchFunc${Date.now()}">
  <label class="form-check-label labelToggleFunc" for="switchFunc${Date.now()}">🧩 Terá funcionalidade?</label>
</div>
<div class="row blocoFuncionalidade">
  <div class="col-md-4 mb-2">
    <label class="form-label">Nome da Funcionalidade</label>
    <input type="text" class="form-control border-secondary funcName">
  </div>
  <div class="col-md-4 mb-2">
    <label class="form-label">Caminho no Menu</label>
    <input type="text" class="form-control border-secondary path">
  </div>
  <div class="col-md-4 mb-2">
    <label class="form-label">Descrição</label>
    <input type="text" class="form-control border-secondary descFunc">
  </div>
</div>
    </div>
    <div class="d-flex justify-content-end mt-3">
        <button type="button" class="btn btn-outline-danger btn-sm" onclick="removerUserStory(this)">
        <i class="fa-solid fa-trash"></i> Remover Story
        </button>
    </div>
  `;

   container.appendChild(storyDiv);
   salvarDados();

   storyDiv
     .querySelector(".toggleFuncionalidade")
     .addEventListener("change", function () {
       const bloco = storyDiv.querySelector(".blocoFuncionalidade");
       bloco.style.display = this.checked ? "" : "none";
     });

   return storyDiv;
}

document.addEventListener("DOMContentLoaded", () => {
   const form = document.getElementById("markdownForm");
   const hoje = new Date().toISOString().split("T")[0];
   form.data.value = hoje;

   $('.selectpicker').selectpicker();

   // Ctrl + Enter
   document.addEventListener("keydown", function (event) {
      if (event.ctrlKey && event.key === "Enter") {
         event.preventDefault();
         gerarMarkdown();
      }
   });

   // 🧠 Aqui dentro é onde deve carregar o localStorage:
   const dadosSalvos = localStorage.getItem("markdownForm");
   
   if (dadosSalvos) {
      const dados = JSON.parse(dadosSalvos);
      form.versao.value = dados.versao || "";
      form.data.value = dados.data || "";
      form.autor.value = dados.autor || "";
      form.alteracoes.value = dados.alteracoes || "";
      form.objetivo.value = dados.objetivo || "";
      form.projeto.value = dados.projeto || "";
      form.escopoProjeto.value = dados.escopoProjeto || "#";
      form.analiseRequisitos.value = dados.analiseRequisitos || "#";

      if (dados.times) {
        $("#selectTimes").selectpicker("val", dados.times);
      }       

      if (Array.isArray(dados.foraEscopo)) {
         itensForaEscopo = dados.foraEscopo;
         atualizarLista();
      }

      if (dados.versoes && Array.isArray(dados.versoes)) {
        historicoVersoes = dados.versoes;
        atualizarTabelaVersoes();
      }

      if (dados.requisitos) {
         dados.requisitos.forEach(req => {
            const accordion = adicionarRequisitoComUserStory(req); // agora retorna a div criada
            const storiesContainer = accordion.querySelector('[id^="userstories-"]');

            req.stories.forEach(story => {
               const storyDiv = adicionarUserStory(storiesContainer.id);
               storyDiv.querySelector('.userStory').value = story.userStory || "";
               storyDiv.querySelector('.introducao').value = story.introducao || "";
               storyDiv.querySelector('.sistema').value = story.sistema || "";
               storyDiv.querySelector('.caminho').value = story.caminho || "";
               storyDiv.querySelector('.regras').value = story.regras || "";
               storyDiv.querySelector('.funcName').value = story.funcName || "";
               storyDiv.querySelector('.path').value = story.path || "";
               storyDiv.querySelector('.descFunc').value = story.descFunc || "";

               if (!story.temFuncionalidade) {
                 storyDiv.querySelector(
                   ".toggleFuncionalidade"
                 ).checked = false;
                 storyDiv.querySelector(".blocoFuncionalidade").style.display =
                   "none";
               }
            });

            const inputTitulo = accordion.querySelector(".requisitoTitulo");
            const spanPreview = accordion.querySelector(".titulo-preview");
            if (inputTitulo && spanPreview) {
               spanPreview.textContent = inputTitulo.value || "Novo Requisito";
            }
         });
      }

      setTimeout(() => {
         document.querySelectorAll(".accordion-item").forEach(item => {
            const inputTitulo = item.querySelector(".requisitoTitulo");
            const spanPreview = item.querySelector(".titulo-preview");
            if (inputTitulo && spanPreview) {
               spanPreview.textContent = inputTitulo.value || "Novo Requisito";
            }
         });
      }, 0);

      carregando = false;
   }

   // Ctrl + Enter para gerar markdown
   document.addEventListener("keydown", function (event) {
      if (event.ctrlKey && event.key === "Enter") {
         event.preventDefault();
         gerarMarkdown();
      }
   });

   atualizarTituloPagina();
   atualizarSumario();

   $('#selectTimes').on('change', atualizarTituloPagina);

   carregando = false;
});

function salvarDados() {
   if (carregando) return;
   const form = document.getElementById("markdownForm");
   const dadosForm = {
      versao: form.versao.value,
      data: form.data.value,
      autor: form.autor.value,
      alteracoes: form.alteracoes.value,
      versoes: historicoVersoes,
      objetivo: form.objetivo.value,
      projeto: form.projeto.value,
      escopoProjeto: form.escopoProjeto.value,
      analiseRequisitos: form.analiseRequisitos.value,
      foraEscopo: itensForaEscopo,
      times: $('#selectTimes').val() || [],
      requisitos: []
   };

   document.querySelectorAll("#containerRequisitos > .accordion-item").forEach(requisito => {
        const titulo = requisito.querySelector(".requisitoTitulo")?.value || "";
        const stories = [];

        const storyCards = requisito.querySelectorAll('.accordion-body .card');
        storyCards.forEach(card => {
        stories.push({
            userStory: card.querySelector('.userStory')?.value || '',
            introducao: card.querySelector('.introducao')?.value || '',
            sistema: card.querySelector('.sistema')?.value || '',
            caminho: card.querySelector('.caminho')?.value || '',
            regras: card.querySelector('.regras')?.value || '',
            funcName: card.querySelector('.funcName')?.value || '',
            path: card.querySelector('.path')?.value || '',
            descFunc: card.querySelector('.descFunc')?.value || '',
            temFuncionalidade: card.querySelector('.toggleFuncionalidade')?.checked || false
        });
        });

      dadosForm.requisitos.push({
         titulo,
         stories
      });
   });

   localStorage.setItem("markdownForm", JSON.stringify(dadosForm));
}

document.getElementById("markdownForm").addEventListener("input", () => {
   if (!carregando) salvarDados();
});

document.getElementById("markdownForm").addEventListener("change", () => {
   if (!carregando) salvarDados();
});

function removerUserStory(botao) {
   const storyCard = botao.closest(".card");
   if (storyCard) {
      storyCard.remove();
      salvarDados(); // opcional também
   }
}

function removerRequisitoCard(botao) {
   const card = botao.closest(".accordion-item");
   if (card) {
      card.remove();
      salvarDados?.(); // só chama salvarDados() se existir
   }
}

function scrollParaFim() {
   window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
   });
}

function scrollParaTopo() {
   window.scrollTo({
      top: 0,
      behavior: 'smooth'
   });
}

function exportarJSON() {
   const dados = localStorage.getItem("markdownForm");

   if (!dados) {
      Swal.fire({
         icon: 'warning',
         title: 'Nada para exportar!',
         text: 'Nenhum dado encontrado para exportar.',
      });
      return;
   }

   const form = document.getElementById("markdownForm");

   const timesSelecionados =
     ($("#selectTimes").val() || [])
       .map((t) => t.replace(/\s+/g, "-"))
       .join("_") || "SemTime";

   const nomeProjeto = (form.projeto.value || "Projeto").replace(/\s+/g, '-');

   const nomeArquivo = `${timesSelecionados}-${nomeProjeto}.json`;

   const blob = new Blob([dados], {
      type: "application/json"
   });
   const url = URL.createObjectURL(blob);
   const a = document.createElement("a");

   a.href = url;
   a.download = nomeArquivo;
   a.click();

   URL.revokeObjectURL(url);
}

function importarJSON(event) {
   const file = event.target.files[0];
   if (!file) return;

   const reader = new FileReader();
   reader.onload = function (e) {
      try {
         const dados = JSON.parse(e.target.result);
         localStorage.setItem("markdownForm", JSON.stringify(dados));
         Swal.fire({
            icon: 'success',
            title: 'Importado!',
            text: 'Dados importados com sucesso. A página será recarregada.',
            timer: 2000,
            showConfirmButton: false
         });
         setTimeout(() => location.reload(), 2100);
      } catch (err) {
         Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Falha ao importar o arquivo JSON. Verifique o conteúdo.',
         });
         console.error(err);
      }
   };
   reader.readAsText(file);
}

function limparTemplate() {
   Swal.fire({
      title: 'Tem certeza?',
      text: 'Isso irá limpar todos os dados preenchidos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, limpar tudo',
      cancelButtonText: 'Cancelar'
   }).then((result) => {
      if (result.isConfirmed) {
         localStorage.removeItem("markdownForm");
         location.reload();
      }
   });
}

function atualizarTituloPagina() {
  const timesSelecionados = ($("#selectTimes").val() || []).map((t) => {
   const map = {
     "Digital Account": "DA",
     B2C: "B2C",
     PIX: "PIX",
     EVA: "EVA",
     Merchant: "Merchant",
     Bacen: "Bacen",
     "Payment Processor": "Payment Processor",
     B2B: "B2B",
   };
    return map[t] || t;
  });

  const timesFormatados = timesSelecionados.join(" + ");
  const projetoOriginal = document.getElementById("projeto").value.trim();

  let titulo = "Gerador de Markdown";
  if (projetoOriginal) titulo += ` — ${projetoOriginal}`;
  if (timesSelecionados.length) titulo += ` [${timesFormatados}]`;

  // Título da aba
  document.title = titulo;

  // Título no h1
  const elementoTitulo = document.getElementById("tituloPagina");
  elementoTitulo.innerHTML = `
    <span class="me-2">🧾</span>
    <strong>${projetoOriginal || "Formulário"}</strong>
    <small class="lead ms-2">${
      timesSelecionados.length ? `[ ${timesFormatados} ]` : ""
    }</small>
  `;
}

document.getElementById("projeto").addEventListener("input", atualizarTituloPagina);
document.querySelectorAll("#checkboxTimes input").forEach(cb => {
   cb.addEventListener("change", atualizarTituloPagina);
});

document.getElementById('projeto').addEventListener('input', function () {
   const valor = this.value.toLowerCase();
   const easter = document.getElementById('easterHippo');
   if (valor.includes('domar')) {
      easter.style.display = 'block';
   } else {
      easter.style.display = 'none';
   }
});

function atualizarSumario() {
   const lista = document.getElementById("listaSumario");
   lista.innerHTML = "";

   document.querySelectorAll(".accordion-item").forEach((item, index) => {
      const titulo = item.querySelector(".requisitoTitulo")?.value || `Requisito ${index + 1}`;
      const li = document.createElement("li");
      li.className = "list-group-item list-group-item-action";
      li.style.cursor = "pointer";
      li.style.color = "white";
      li.textContent = titulo;
      li.style.backgroundColor = '#212529'

      li.textContent = titulo;
      li.onclick = () => {
         item.scrollIntoView({
            behavior: "smooth",
            block: "center"
         });
         item.classList.add("destacar-requisito");

         // Remove destaque após X segundos
         setTimeout(() => {
            item.classList.remove("destacar-requisito");
         }, 6000); // tempo combinando com sua animação

         // Fecha o modal
         const modal = bootstrap.Modal.getInstance(document.getElementById('modalSumario'));
         if (modal) modal.hide();
      };

      lista.appendChild(li);
   });
}

function destacarRequisito(id) {
   const elemento = document.getElementById(id);
   if (elemento) {
      elemento.scrollIntoView({
         behavior: 'smooth',
         block: 'start'
      });

      elemento.classList.add('destacar-requisito');
      setTimeout(() => {
         elemento.classList.remove('destacar-requisito');
      }, 1000);
   }
}

document.getElementById("markdownForm").addEventListener("input", atualizarSumario);

document.addEventListener('keydown', function (e) {
   if (e.ctrlKey && e.key.toLowerCase() === 'm') {
      e.preventDefault();
      const modal = new bootstrap.Modal(document.getElementById('modalSumario'));
      modal.show();
   }
});

function adicionarVersao() {
  const form = document.getElementById("markdownForm");

  const nova = {
    versao: form.versao.value.trim(),
    data: form.data.value.trim(),
    autor: form.autor.value.trim(),
    alteracoes: form.alteracoes.value.trim(),
  };

  // Evita campos vazios
  if (!nova.versao || !nova.data || !nova.autor) {
    Swal.fire({
      icon: "warning",
      title: "Campos obrigatórios!",
      text: "Versão, data e autor são obrigatórios.",
    });
    return;
  }

  historicoVersoes.push(nova);
  atualizarTabelaVersoes();
  salvarDados();

  // Limpa campos
  form.versao.value = "";
  form.data.value = "";
  form.autor.value = "";
  form.alteracoes.value = "";
}

function atualizarTabelaVersoes() {
  const tbody = document.querySelector("#tabelaVersoes tbody");
  const blocoTabela = document.getElementById("blocoTabelaVersoes");

  if (historicoVersoes.length === 0) {
    blocoTabela.style.display = "none";
    return;
  }

  blocoTabela.style.display = "block";
  tbody.innerHTML = "";

  historicoVersoes.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
       <td>${item.versao}</td>
       <td>${item.data}</td>
       <td>${item.autor}</td>
       <td>${item.alteracoes}</td>
       <td class="text-center">
         <button type="button" class="btn btn-sm btn-outline-danger" onclick="excluirVersao(${index})">
           <i class="fa-solid fa-trash"></i>
         </button>
       </td>
     `;
    tbody.appendChild(tr);
  });
}
 

function excluirVersao(index) {
  Swal.fire({
    icon: "warning",
    title: "Excluir esta versão?",
    text: "Essa entrada será removida do histórico.",
    showCancelButton: true,
    confirmButtonText: "Sim, excluir",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      historicoVersoes.splice(index, 1);
      atualizarTabelaVersoes();
      salvarDados();
    }
  });
}