import { db } from './firebase-config.js';
import {
  collection,
  query,
  where,
  onSnapshot
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
      const div = document.createElement("div");
      div.classList.add("agendamento");

      div.innerHTML = `
        <p><strong>${ag.nome}</strong> - ${ag.data} às ${ag.hora}</p>
        <p>Serviço: ${ag.servico} | Pagamento: ${ag.pagamento}</p>
        <p>Valor: R$ ${ag.valor},00</p>
        <hr>
      `;
      lista.appendChild(div);
    });
  });
});
