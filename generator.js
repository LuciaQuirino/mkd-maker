async function exportarPDFComJsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const dados = JSON.parse(localStorage.getItem("markdownForm") || "{}");

  if (!dados?.requisitos?.length) {
    Swal.fire({ icon: 'warning', title: 'Nada para exportar' });
    return;
  }

  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const nomeProjeto = dados.projeto?.replace(/\s+/g, '_') || 'Projeto';
  const nomeTimes = (dados.times || []).map(t => {
    const map = { "Digital Account": "DA", "B2C": "B2C", "PIX": "PIX", "EVA": "EVA" };
    return map[t] || t;
  }).join("-");
  const nomeArquivo = `(${nomeTimes} | ${nomeProjeto}) - ${dataAtual}.pdf`;

  // CAPA
  doc.setFillColor('#C0392B');
  doc.rect(0, 0, 210, 297, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("Relatório Técnico", 105, 80, { align: "center" });
  doc.setFontSize(22);
  doc.text(dados.projeto || "Projeto sem nome", 105, 100, { align: "center" });
  doc.setFontSize(14);
  doc.text(`Versão: ${dados.versao || "-"}`, 105, 125, { align: "center" });
  doc.text(`Autor: ${dados.autor || "-"}`, 105, 135, { align: "center" });
  doc.text(`Data: ${dados.data || dataAtual}`, 105, 145, { align: "center" });
  const timesFormatados = nomeTimes.replace(/-/g, " + ");
  if (timesFormatados) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`[ ${timesFormatados} ]`, 105, 160, { align: "center" });
  }

  // SUMÁRIO - Reservar página
  doc.addPage();
  const sumarioIndex = doc.internal.getCurrentPageInfo().pageNumber;
  doc.text("📑 Sumário", 14, 20);
  const paginaRequisitos = [];

  // PÁGINA DE CONTEÚDO
  doc.addPage();
  let y = 20;

  function garantirEspaco(altura) {
    if (y + altura > 275) {
      doc.addPage();
      y = 20;
    }
  }

  function escreverTextoComQuebra(texto) {
    const linhas = doc.splitTextToSize(texto || "-", 180);
    const alturaTotal = linhas.length * 6.5;
    garantirEspaco(alturaTotal);
    for (let i = 0; i < linhas.length; i++) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(linhas[i], 14, y);
      y += 6.5;
    }
  }

  function renderSecao(titulo, texto) {
    garantirEspaco(16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor("#C0392B");
    doc.text(titulo, 14, y);
    doc.setTextColor(0, 0, 0);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    escreverTextoComQuebra(texto);
  }

  renderSecao("Objetivo", dados.objetivo);
  renderSecao("Escopo do Projeto", dados.escopoProjeto);
  renderSecao("Análise de Requisitos", dados.analiseRequisitos);

  if (dados.foraEscopo?.length) {
    garantirEspaco((dados.foraEscopo.length + 1) * 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor('#C0392B');
    doc.text("Fora do Escopo", 14, y);
    doc.setTextColor(0, 0, 0);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    dados.foraEscopo.forEach(item => {
      escreverTextoComQuebra(`• ${item}`);
    });
  }

  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(14, y, 195, y);
  y += 10;

  dados.requisitos.forEach(req => {
    garantirEspaco(30);
    paginaRequisitos.push({ titulo: req.titulo, pagina: doc.internal.getCurrentPageInfo().pageNumber });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor('#C0392B');
    doc.text(`Requisito: ${req.titulo}`, 14, y);
    doc.setTextColor(0, 0, 0);
    y += 8;

    req.stories.forEach(story => {
      garantirEspaco(60);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("História:", 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(story.userStory || "-", 40, y);
      y += 6;

      escreverTextoComQuebra(story.introducao || "-");

      garantirEspaco(12);
      doc.setFont("helvetica", "bold");
      doc.text("Sistema:", 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(story.sistema || "-", 35, y);
      doc.setFont("helvetica", "bold");
      doc.text("Caminho:", 100, y);
      doc.setFont("helvetica", "normal");
      const caminhoFormatado = (story.caminho || "").replace(/\s*>\s*/g, " > ");
      const caminhoLinhas = doc.splitTextToSize(caminhoFormatado || "-", 60);
      doc.text(caminhoLinhas, 130, y);
      y += 6;

      doc.setFont("helvetica", "bold");
      doc.text("Regras:", 14, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      escreverTextoComQuebra(story.regras || "-");

      if (story.temFuncionalidade) {
        doc.autoTable({
          head: [["Nome", "Menu", "Descrição"]],
          body: [[story.funcName || "-", story.path || "-", story.descFunc || "-"]],
          startY: y,
          headStyles: { fillColor: [255, 44, 31], textColor: 255 },
          styles: { fontSize: 9 },
          theme: "grid"
        });
        y = doc.lastAutoTable.finalY + 10;
      }

      doc.setDrawColor(200);
      doc.setLineWidth(0.3);
      doc.line(14, y, 195, y);
      y += 10;
    });
  });

  // Volta e preenche a página de sumário
  // Volta e preenche a página de sumário
    doc.setPage(sumarioIndex);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor("#C0392B");
    doc.text("Sumário", 14, 20);

    let ySumario = 32;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);

    paginaRequisitos.forEach((item, i) => {
      const texto = `${i + 1}. ${item.titulo}`;
      const dots = ".".repeat(Math.max(0, 80 - texto.length));
      doc.text(`${texto} ${dots}`, 20, ySumario);
      doc.text(`${item.pagina}`, 190, ySumario, { align: "right" });
      ySumario += 7;

      if (ySumario > 275) {
        doc.addPage();
        ySumario = 20;
      }
    });

  // Numeração de páginas
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Página ${i} de ${totalPages} | ${dataAtual}`, 200, 290, { align: "right" });
  }

  doc.save(nomeArquivo);
}
