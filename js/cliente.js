import { db } from "../firebaise/firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const selectBarbeiro = document.getElementById("barbeiro");

  try {
    const snapshot = await getDocs(collection(db, "barbeiros"));

    snapshot.forEach((doc) => {
      const barbeiro = doc.data().nome;
      const option = document.createElement("option");
      option.value = barbeiro;
      option.textContent = barbeiro;
      selectBarbeiro.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar barbeiros:", error);
  }
});

// Horários disponíveis fixos
const horariosDisponiveis = [
  "08:00",
  "08:40",
  "09:20",
  "10:00",
  "10:40",
  "11:20",
  "12:00",
  "12:40",
  "13:20",
  "14:00",
  "14:40",
  "15:20",
  "16:00",
  "16:40",
  "17:20",
  "18:00",
  "18:40",
  "19:20",
  "20:00",
];

// Elementos HTML
const form = document.getElementById("form-agendamento");
const selectHora = document.getElementById("hora");
const dataInput = document.getElementById("data");
const selectServico = document.getElementById("servico");
const divValorTotal = document.getElementById("totalAPagar");
const barbeiroSelect = document.getElementById("barbeiro");
const telefoneInput = document.getElementById("telefone");

// ✅ Valores dos serviços
const valores = {
  Corte: 30,
  Barba: 20,
  "Corte + Barba": 45,
  "Corte + Barba + Sobrancelha": 60,
  Sobrancelha: 15,
};

// ✅ Função para atualizar o valor total
function atualizarValorTotal() {
  const servicoSelecionado = selectServico.value;
  const preco = valores[servicoSelecionado] || 0;

  if (servicoSelecionado) {
    divValorTotal.style.display = "block";
    divValorTotal.innerHTML = `Valor total: <strong>R$ ${preco
      .toFixed(2)
      .replace(".", ",")}</strong>`;
  } else {
    divValorTotal.style.display = "none";
  }
}

// ✅ Atualiza o valor sempre que o serviço mudar
selectServico.addEventListener("change", atualizarValorTotal);

// ✅ Atualiza o valor quando a página carregar
document.addEventListener("DOMContentLoaded", atualizarValorTotal);

// Verifica horários disponíveis quando a data muda
dataInput.addEventListener("change", async () => {
  const dataSelecionada = dataInput.value;
  selectHora.innerHTML = '<option value="">Carregando horários...</option>';

  if (!dataSelecionada) return;

  try {
    const q = query(
      collection(db, "agendamentos"),
      where("data", "==", dataSelecionada)
    );
    const snapshot = await getDocs(q);
    const ocupados = snapshot.docs.map((doc) => doc.data().hora);

    selectHora.innerHTML = '<option value="">Escolha o horário</option>';
    let disponiveis = 0;

    horariosDisponiveis.forEach((hora) => {
      if (!ocupados.includes(hora)) {
        const option = document.createElement("option");
        option.value = hora;
        option.textContent = hora;
        selectHora.appendChild(option);
        disponiveis++;
      }
    });

    if (disponiveis === 0) {
      selectHora.innerHTML =
        '<option value="">Nenhum horário disponível</option>';
      alert(
        "Todos os horários já foram preenchidos para esta data. Escolha outro dia."
      );
      dataInput.focus();
    }
  } catch (erro) {
    console.error("Erro ao carregar horários:", erro);
    alert("Erro ao carregar horários. Tente novamente.");
  }
});

// Submete o agendamento
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const data = dataInput.value;
  const hora = selectHora.value;
  const servico = selectServico.value;
  const pagamento = document.getElementById("pagamento").value;
  const barbeiro = barbeiroSelect.value;

  // Verifica se o horário ainda está disponível
  const q = query(
    collection(db, "agendamentos"),
    where("data", "==", data),
    where("hora", "==", hora)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    alert("Esse horário já foi preenchido. Escolha outro.");
    return;
  }

  try {
    await addDoc(collection(db, "agendamentos"), {
      nome,
      data,
      hora,
      servico,
      pagamento,
      valor: valores[servico],
      status: "Pendente",
      barbeiro,
      arquivado: false,
      telefone: document.getElementById("telefone").value,
    });
    alert("Agendamento feito com sucesso!");
    form.reset();
    selectHora.innerHTML = '<option value="">Escolha o horário</option>';
    atualizarValorTotal(); // Limpa ou atualiza o valor após reset
  } catch (erro) {
    console.error("Erro ao agendar:", erro);
    alert("Erro ao agendar. Tente novamente.");
  }
});

document.addEventListener("DOMContentLoaded", function() {
  const btn = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");

  btn.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
});
const menuToggle = document.getElementById("menu-toggle");
menuToggle.addEventListener("click", () => {  

  // Acessibilidade: atualiza o atributo ARIA
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", !expanded);
});

document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector("video");
  video.play().catch((e) => {
    console.warn("Autoplay bloqueado. Usuário precisa interagir.");
  });
});
