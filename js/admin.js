import { db } from "./firebase-config.js";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
window.Arquivar = async (id) => {
  try {
    const ref = doc(db, "agendamentos", id);
    await updateDoc(ref, { arquivado: true });

    // Remove do DOM visualmente
    const div = document.querySelector(`[data-id='${id}']`);
    if (div) div.remove();
  } catch (error) {
    console.error("Erro ao arquivar:", error);
  }
};
window.Arquivar = (id, botao) => {

  // Remover o elemento pai do botão (o div do agendamento)
  const divAgendamento = botao.closest(".agendamento");
  if (divAgendamento) {
    divAgendamento.remove();
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
  const containerFinalizados = document.getElementById(
    "agendamentos-finalizados"
  );

  const hoje = new Date().toISOString().split("T")[0];
  const q = query(collection(db, "agendamentos"), where("data", "==", hoje));

  onSnapshot(q, (snapshot) => {
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
          <p><strong>${agendamento.nome}</strong> - ${agendamento.hora} - ${
          agendamento.servico
        }</p>
          <p>Pagamento: ${agendamento.pagamento} | Valor: R$ ${
          agendamento.valor
        },00</p>
          <p>Status: <strong>${agendamento.status}</strong></p>
          ${
            agendamento.status !== "Confirmado"
              ? `<button onclick="confirmarAgendamento('${id}')">Confirmar</button>`
              : ""
          }
          <button onclick="cancelarAgendamento('${id}')">Cancelar</button>
          ${
            agendamento.status === "Confirmado"
              ? `<button onclick="finalizarAgendamento('${id}')">Finalizar</button>`
              : ""
          }
        `;
        lista.appendChild(div);
      }

      if (["Confirmado", "Finalizado"].includes(agendamento.status)) {
        pagamentosPorTipo[agendamento.pagamento] += agendamento.valor;
        total += agendamento.valor;
        quantidade++;
      }
    });

    totalAgendamentos.textContent = quantidade;
    valorTotal.textContent = total.toFixed(2).replace(".", ",");

    atualizarGraficoFiltrado(
      ctx,
      btnDiario.classList.contains("ativo") ? "diario" : "mensal"
    );
  });

  // Atualiza lista de agendamentos finalizados, se container existir
  if (containerFinalizados) {
    onSnapshot(
      query(
        collection(db, "agendamentos"),
        where("status", "==", "Finalizado")
      ),
      (snapshot) => {
        if (snapshot.empty) {
          containerFinalizados.innerHTML =
            "<p>Nenhum agendamento finalizado ainda.</p>";
          return;
        }

        containerFinalizados.innerHTML = "";
        snapshot.forEach((doc) => {
          const ag = doc.data();
          const div = document.createElement("div");
          div.classList.add("agendamento");
          div.innerHTML = `
  <p><strong>${ag.nome}</strong> - ${ag.data} às ${ag.hora}</p>
  <p>Serviço: ${ag.servico} | Pagamento: ${ag.pagamento}</p>
  <p>Valor: R$ ${ag.valor},00</p>
  <button onclick="Arquivar('${doc.id}', this)">Arquivar</button>
  <hr>
`;

          containerFinalizados.appendChild(div);
        });
      }
    );
  }

  btnDiario.addEventListener("click", () => {
    btnDiario.classList.add("ativo");
    btnMensal.classList.remove("ativo");
    atualizarGraficoFiltrado(ctx, "diario");
  });

  btnMensal.addEventListener("click", () => {
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
    if (
      agendamento.status !== "Confirmado" &&
      agendamento.status !== "Finalizado"
    )
      return;

    const dataAgendamento = new Date(agendamento.data);
    const pagamento = agendamento.pagamento;
    const valor = agendamento.valor || 0;

    const condicaoDiaria = agendamento.data === dataHoje;
    const condicaoMensal =
      dataAgendamento.getMonth() === mesAtual &&
      dataAgendamento.getFullYear() === anoAtual;

    if (
      (filtro === "diario" && condicaoDiaria) ||
      (filtro === "mensal" && condicaoMensal)
    ) {
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
