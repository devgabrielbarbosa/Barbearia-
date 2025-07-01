import { db } from './firebase-config.js';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const lista = document.getElementById("listaArquivados");

  const q = query(
    collection(db, "agendamentos"),
    where("status", "==", "Finalizado"),
    where("arquivado", "==", true)
  );

  onSnapshot(q, (snapshot) => {
    lista.innerHTML = "";

    if (snapshot.empty) {
      lista.innerHTML = "<p>Nenhum agendamento arquivado.</p>";
      return;
    }

    snapshot.forEach(doc => {
      const ag = doc.data();
      ag.id = doc.id; // salva o ID do documento para depois poder excluir
      renderAgendamento(ag);
    });
  });

  function cancelarAgendamento(id, divElemento) {
    if (confirm("Tem certeza que deseja cancelar esse agendamento?")) {
      const docRef = doc(db, "agendamentos", id);

      deleteDoc(docRef)
        .then(() => {
          divElemento.remove(); // Remove o agendamento da tela
          console.log("Agendamento cancelado com sucesso.");
        })
        .catch((error) => {
          console.error("Erro ao cancelar agendamento:", error);
        });
    }
  }

  function renderAgendamento(item) {
    const div = document.createElement("div");
    div.classList.add("agendamento");

    div.innerHTML = `
      <p><strong>${item.nome}</strong> - ${item.data} às ${item.hora}</p>
      <p>Serviço: ${item.servico} | Pagamento: ${item.pagamento}</p>
      <p>Valor: R$ ${item.valor},00</p>
      <p>Status: ${item.status}</p>
      <button class="btn-cancelar">Cancelar</button>
      <hr>
    `;

    div.querySelector(".btn-cancelar").addEventListener("click", () => {
      cancelarAgendamento(item.id, div);
    });

    lista.appendChild(div);
  }
});
