import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../firebaise/firebase-config.js";

let agendamentosArquivados = [];

document.addEventListener("DOMContentLoaded", () => {
  const lista = document.getElementById("listaArquivados");

  const q = query(
    collection(db, "agendamentos"),
    where("status", "==", "Finalizado"),
    where("arquivado", "==", true)
  );

  onSnapshot(q, (snapshot) => {
    agendamentosArquivados = [];
    lista.innerHTML = "";

    if (snapshot.empty) {
      lista.innerHTML = "<p>Nenhum agendamento arquivado.</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const ag = docSnap.data();
      ag.id = docSnap.id;
      agendamentosArquivados.push(ag);
    });

    renderizarAgendamentos(agendamentosArquivados);
  });
});

function renderizarAgendamentos(lista) {
  const container = document.getElementById("listaArquivados");
  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML = "<p>Nenhum agendamento encontrado.</p>";
    return;
  }

  lista.forEach((agendamento) => {
    const div = document.createElement("div");
    div.classList.add("agendamento");
    div.innerHTML = `
      <p><strong>${agendamento.nome}</strong> - ${agendamento.data} às ${
      agendamento.hora
    }</p>
      <p>Serviço: ${agendamento.servico} | Pagamento: ${
      agendamento.pagamento
    }</p>
      <p>Valor: R$ ${agendamento.valor},00</p>
      <p>Status: ${agendamento.status}</p>
      <p>Barbeiro: ${
        agendamento.nomeBarbeiro || agendamento.barbeiro || "Não informado"
      }</p>
      <button class="btn-cancelar">Cancelar</button>
      <hr />
    `;

    div.querySelector(".btn-cancelar").addEventListener("click", () => {
      cancelarAgendamento(agendamento.id, div);
    });

    container.appendChild(div);
  });
}

function cancelarAgendamento(id, divElemento) {
  if (confirm("Tem certeza que deseja cancelar esse agendamento?")) {
    const docRef = doc(db, "agendamentos", id);
    deleteDoc(docRef)
      .then(() => {
        divElemento.remove();
        console.log("Agendamento cancelado com sucesso.");
      })
      .catch((error) => {
        console.error("Erro ao cancelar agendamento:", error);
      });
  }
}
async function filtrarAgendamentos() {
  const data = document.getElementById("filtroData").value;
  const barbeiro = document
    .getElementById("filtroBarbeiro")
    .value.toLowerCase();
  const status = document.getElementById("filtroStatus").value;

  const q = query(
    collection(db, "agendamentos"),
    where("arquivado", "==", true)
  );
  const snapshot = await getDocs(q);

  const resultados = [];

  snapshot.forEach((docSnap) => {
    const item = docSnap.data();

    const condData = data ? item.data === data : true;
    const condBarbeiro = barbeiro
      ? (item.barbeiro || "").toLowerCase().includes(barbeiro)
      : true;
    const condStatus = status ? item.status === status : true;

    if (condData && condBarbeiro && condStatus) {
      resultados.push({ id: docSnap.id, ...item });
    }
  });

  renderizarAgendamentos(resultados);
}

// Botões
document
  .getElementById("botaoFiltrar")
  .addEventListener("click", filtrarAgendamentos);
document.getElementById("botaoLimpar").addEventListener("click", () => {
  document.getElementById("filtroData").value = "";
  document.getElementById("filtroBarbeiro").value = "";
  document.getElementById("filtroStatus").value = "";
  renderizarAgendamentos(agendamentosArquivados);
});
