import { db } from "./firebase-config.js";
import {
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("agendamentosPorBarbeiro");

  onSnapshot(collection(db, "agendamentos"), (snapshot) => {
    const agendamentos = {};

    snapshot.forEach((doc) => {
      const ag = doc.data();
      const barbeiro = ag.barbeiro || "Sem Barbeiro";
      if (!agendamentos[barbeiro]) agendamentos[barbeiro] = [];
      agendamentos[barbeiro].push(ag);
    });

    renderizarPorBarbeiro(agendamentos);
  });

  function renderizarPorBarbeiro(data) {
    container.innerHTML = "";

    for (const barbeiro in data) {
      const section = document.createElement("section");
      section.innerHTML = `<h2>Barbeiro: ${barbeiro}</h2>`;

      const ul = document.createElement("ul");

      data[barbeiro].forEach((ag) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${ag.nome}</strong> - ${ag.data} às ${ag.hora}<br>
          Serviço: ${ag.servico} | Pagamento: ${ag.pagamento} | Valor: R$ ${ag.valor}
        `;
        ul.appendChild(li);
      });

      section.appendChild(ul);
      container.appendChild(section);
    }
  }
});
