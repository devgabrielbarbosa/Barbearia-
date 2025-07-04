import { db } from "./firebase-config.js";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  deleteDoc,
  getDoc,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

menuToggle.addEventListener('click', () => {
  menu.classList.toggle('ativo');
});

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");

  toggle.addEventListener("click", () => {
    menu.classList.toggle("ativo");
  });

  carregarBarbeirosComAgendamentos();
});

window.Arquivar = async (id, botao) => {
  try {
    const ref = doc(db, "agendamentos", id);
    await updateDoc(ref, { arquivado: true });

    const divAgendamento = botao.closest(".agendamento");
    if (divAgendamento) divAgendamento.remove();
  } catch (error) {
    console.error("Erro ao arquivar:", error);
    alert("Erro ao arquivar. Verifique a conexão.");
  }
};

let chart;
const pagamentosPorTipo = {
  Pix: 0,
  Débito: 0,
  Crédito: 0,
  Dinheiro: 0,
};

document.addEventListener("DOMContentLoaded", () => {
  const lista = document.getElementById("lista-agendamentos");
  const totalAgendamentos = document.getElementById("totalAgendamentos");
  const valorTotal = document.getElementById("valorTotal");
  const ctx = document.getElementById("graficoPagamento").getContext("2d");
  const btnDiario = document.getElementById("btnDiario");
  const btnMensal = document.getElementById("btnMensal");
  const containerFinalizados = document.getElementById("agendamentos-finalizados");

  const hoje = new Date().toISOString().split("T")[0];
  const q = query(collection(db, "agendamentos"), where("data", "==", hoje));

  onSnapshot(collection(db, "agendamentos"), (snapshot) => {
    lista.innerHTML = "";
    pagamentosPorTipo.Pix = 0;
    pagamentosPorTipo.Débito = 0;
    pagamentosPorTipo.Crédito = 0;
    pagamentosPorTipo.Dinheiro = 0;

    let total = 0;
    let quantidade = 0;

    snapshot.forEach((docSnap) => {
      const agendamento = docSnap.data();
      const id = docSnap.id;

      if (agendamento.status !== "Finalizado") {
        const div = document.createElement("div");
        div.classList.add("agendamento");

        if (agendamento.status === "Confirmado") {
          div.classList.add("confirmado");
        } else if (agendamento.status === "Cancelado") {
          div.classList.add("cancelado");
        } else {
          div.classList.add("pendente");
        }

        div.innerHTML = `
          <p><strong>${agendamento.nome}</strong> - ${agendamento.data} às ${agendamento.hora} - ${agendamento.servico}</p>
          <p>Pagamento: ${agendamento.pagamento} | Valor: R$ ${agendamento.valor.toFixed(2).replace('.', ',')}</p>
          <p>Status: <strong>${agendamento.status}</strong></p>
          <p>Barbeiro: ${agendamento.barbeiro || "Não especificado"}</p>
          ${agendamento.status !== "Confirmado" ? `<button onclick="confirmarAgendamento('${id}')">Confirmar</button>` : ""}
          <button onclick="cancelarAgendamento('${id}')">Cancelar</button>
          ${agendamento.status === "Confirmado" ? `<button onclick="finalizarAgendamento('${id}')">Finalizar</button>` : ""}
        `;

        lista.appendChild(div);
      }

      if (["Confirmado", "Finalizado"].includes(agendamento.status)) {
        pagamentosPorTipo[agendamento.pagamento] += agendamento.valor;
        total += agendamento.valor;
        quantidade++;
      }
    });

    if (totalAgendamentos) totalAgendamentos.textContent = quantidade;
    if (valorTotal) valorTotal.textContent = total.toFixed(2).replace(".", ",");

    if (ctx) {
      atualizarGraficoFiltrado(
        ctx,
        btnDiario.classList.contains("ativo") ? "diario" : "mensal"
      );
    }
  });

  if (containerFinalizados) {
    onSnapshot(
      query(
        collection(db, "agendamentos"),
        where("status", "==", "Finalizado"),
        where("arquivado", "==", false)
      ),
      (snapshot) => {
        containerFinalizados.innerHTML = "";
        if (snapshot.empty) {
          containerFinalizados.innerHTML = "<p>Nenhum agendamento finalizado ainda.</p>";
          return;
        }

        snapshot.forEach((doc) => {
          const ag = doc.data();
          const div = document.createElement("div");
          div.classList.add("agendamento");
          div.innerHTML = `
            <p><strong>${ag.nome}</strong> - ${ag.data} às ${ag.hora}</p>
            <p>Serviço: ${ag.servico} | Pagamento: ${ag.pagamento}</p>
            <p>Valor: R$ ${ag.valor},00</p>
            <button onclick="Arquivar('${doc.id}', this)">Arquivar</button>
            <button onclick="cancelarAgendamento('${doc.id}')">Cancelar</button>
            <hr>
          `;
          containerFinalizados.appendChild(div);
        });
      }
    );
  }

  btnDiario?.addEventListener("click", () => {
    btnDiario.classList.add("ativo");
    btnMensal.classList.remove("ativo");
    atualizarGraficoFiltrado(ctx, "diario");
  });

  btnMensal?.addEventListener("click", () => {
    btnMensal.classList.add("ativo");
    btnDiario.classList.remove("ativo");
    atualizarGraficoFiltrado(ctx, "mensal");
  });
});

window.confirmarAgendamento = async (id) => {
  const agRef = doc(db, "agendamentos", id);
  await updateDoc(agRef, { status: "Confirmado" });
};

window.cancelarAgendamento = async (id) => {
  const agRef = doc(db, "agendamentos", id);
  await updateDoc(agRef, { status: "Cancelado" });
};

window.finalizarAgendamento = async (id) => {
  const agRef = doc(db, "agendamentos", id);
  await updateDoc(agRef, { status: "Finalizado" });
};

async function atualizarGraficoFiltrado(ctx, filtro = "diario") {
  const snapshot = await getDocs(collection(db, "agendamentos"));
  const hoje = new Date();
  const dataHoje = hoje.toISOString().split("T")[0];
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const dados = { Pix: 0, Débito: 0, Crédito: 0, Dinheiro: 0 };

  snapshot.forEach((docSnap) => {
    const agendamento = docSnap.data();
    if (!["Confirmado", "Finalizado"].includes(agendamento.status)) return;

    const dataAgendamento = new Date(agendamento.data);
    const pagamento = agendamento.pagamento;
    const valor = agendamento.valor || 0;

    const condicaoDiaria = agendamento.data === dataHoje;
    const condicaoMensal =
      dataAgendamento.getMonth() === mesAtual &&
      dataAgendamento.getFullYear() === anoAtual;

    if ((filtro === "diario" && condicaoDiaria) || (filtro === "mensal" && condicaoMensal)) {
      if (dados[pagamento] !== undefined) {
        dados[pagamento] += valor;
      }
    }
  });

  const labels = Object.keys(dados);
  const valores = Object.values(dados);

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data: valores,
          backgroundColor: ["#4caf50", "#2196f3", "#ff9800", "#f44336"],
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text:
            filtro === "diario"
              ? "Faturamento de Hoje (Confirmado e Finalizado)"
              : "Faturamento do Mês (Confirmado e Finalizado)",
        },
      },
    },
  });
}

async function carregarBarbeirosComAgendamentos() {
  const barbeirosSnap = await getDocs(collection(db, "barbeiros"));
  const container = document.getElementById("barbeiros-container");
  if (!container) return;
  container.innerHTML = "";

  for (const docBarbeiro of barbeirosSnap.docs) {
    const barbeiro = docBarbeiro.data().nome;
    const agQuery = query(
      collection(db, "agendamentos"),
      where("barbeiro", "==", barbeiro),
      where("status", "!=", "Finalizado")
    );

    const snapshot = await getDocs(agQuery);
    const div = document.createElement("div");
    div.classList.add("secao-barbeiro");
    div.innerHTML = `<h3>${barbeiro}</h3>`;

    if (snapshot.empty) {
      div.innerHTML += "<p>Nenhum agendamento.</p>";
    } else {
      snapshot.forEach((ag) => {
        const a = ag.data();
        div.innerHTML += `
          <p><strong>${a.nome}</strong> - ${a.data} às ${a.hora} (${a.servico})</p>
        `;
      });
    }

    container.appendChild(div);
  }
}

// Modais
const modalCadastro = document.getElementById("modalCadastro");
const modalLista = document.getElementById("modalLista");
const abrirCadastro = document.getElementById("abrirCadastro");
const abrirLista = document.getElementById("abrirLista");
const fecharCadastro = document.getElementById("fecharCadastro");
const fecharLista = document.getElementById("fecharLista");

abrirCadastro.onclick = () => modalCadastro.style.display = "flex";
abrirLista.onclick = async () => {
  modalLista.style.display = "flex";
  await carregarBarbeiros();
};
fecharCadastro.onclick = () => modalCadastro.style.display = "none";
fecharLista.onclick = () => modalLista.style.display = "none";

// Formulário
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formBarbeiro");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nomeBarbeiro").value.trim();
    const msg = document.getElementById("msgBarbeiro");
    if (!nome) return;

    // Verifica se já existe um barbeiro com o mesmo nome
    const q = query(collection(db, "barbeiros"), where("nome", "==", nome));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      msg.textContent = "Esse barbeiro já está cadastrado.";
      return;
    }

    await addDoc(collection(db, "barbeiros"), { nome });
    msg.textContent = "Barbeiro cadastrado!";
    form.reset();
  });
});


// Listar e excluir
async function carregarBarbeiros() {
  const lista = document.getElementById("listaBarbeiros");
  lista.innerHTML = "";
  const snapshot = await getDocs(collection(db, "barbeiros"));
  snapshot.forEach(docSnap => {
    const li = document.createElement("li");
    li.textContent = docSnap.data().nome;
    const btn = document.createElement("button");
    btn.textContent = "Excluir";
    btn.onclick = async () => {
      await deleteDoc(doc(db, "barbeiros", docSnap.id));
      li.remove();
    };
    li.appendChild(btn);
    lista.appendChild(li);
  });
}
const secoesContainer = document.getElementById("secoesBarbeiros");

onSnapshot(collection(db, "agendamentos"), (snapshot) => {
  const agendamentos = {};

  snapshot.forEach((doc) => {
    const dados = doc.data();
    const barbeiro = dados.barbeiro || "Desconhecido";

    if (!agendamentos[barbeiro]) {
      agendamentos[barbeiro] = [];
    }

    agendamentos[barbeiro].push({ id: doc.id, ...dados });
  });

  renderizarSeções(agendamentos);
});

function renderizarSeções(agendamentosPorBarbeiro) {
  secoesContainer.innerHTML = ""; // limpa tudo antes de renderizar

  for (const barbeiro in agendamentosPorBarbeiro) {
    const agendamentos = agendamentosPorBarbeiro[barbeiro];

    const secao = document.createElement("section");
    secao.className = "secao-barbeiro";

    const titulo = document.createElement("h2");
    titulo.textContent = `Barbeiro: ${barbeiro}`;
    secao.appendChild(titulo);

    const lista = document.createElement("ul");

    agendamentos.forEach((ag) => {
      const item = document.createElement("li");
      item.innerHTML = `
        <strong>${ag.nome}</strong> - ${ag.data} às ${ag.hora} (${ag.servico}) 
        | Pagamento: ${ag.pagamento} | R$ ${ag.valor.toFixed(2)}
        <br>Status: <strong>${ag.status}</strong>
      `;
      lista.appendChild(item);
    });

    secao.appendChild(lista);
    secoesContainer.appendChild(secao);
  }
}