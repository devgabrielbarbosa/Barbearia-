document.addEventListener("DOMContentLoaded", function () {
  const abrirBtn = document.getElementById("abrirChat");
  const chat = document.getElementById("chatbot");
  const chatBox = document.querySelector(".chatbot-container");
  const mensagens = document.getElementById("chatMessages");
  const input = document.getElementById("userInput");
  const enviarBtn = document.getElementById("enviarMensagem");
  const fecharBtn = document.getElementById("fecharChat");
  const encerrarBtn = document.getElementById("encerrarAtendimento");

  abrirBtn.addEventListener("click", () => {
    chat.classList.toggle("visivel");
  });

  fecharBtn.addEventListener("click", () => {
    chat.classList.remove("visivel");
  });

  enviarBtn.addEventListener("click", enviarMensagem);
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") enviarMensagem();
  });

  encerrarBtn.addEventListener("click", () => {
    mensagens.innerHTML = "";
    chatBox.style.display = "none";
  });

  function enviarMensagem() {
    const mensagem = input.value.trim();
    if (mensagem === "") return;

    adicionarMensagem("Você", mensagem);
    input.value = "";

    setTimeout(() => {
      const resposta = gerarResposta(mensagem);
      adicionarMensagem("Atendente", resposta.texto);

      if (resposta.redirecionar) {
        window.open(
          "https://wa.me/5563991300213?text=Olá%2C+gostaria+de+atendimento",
          "_blank"
        );
      }

      if (resposta.encerrar) {
        mensagens.innerHTML = "";
        chatBox.style.display = "none";
      }
    }, 500);
  }

  function adicionarMensagem(remetente, mensagem) {
    const novaMensagem = document.createElement("div");
    novaMensagem.innerHTML = `<strong>${remetente}:</strong> ${mensagem}`;
    mensagens.appendChild(novaMensagem);
    mensagens.scrollTop = mensagens.scrollHeight;
  }

  function gerarResposta(pergunta) {
    const texto = pergunta.toLowerCase();
    let resposta = "Desculpe, não entendi. Pode reformular sua pergunta?";
    let redirecionar = false;
    let encerrar = false;

    const respostas = [
      {
        chaves: ["bom dia", "boa tarde", "boa noite"],
        responder: (texto) => {
          if (texto.includes("bom dia")) {
            return "Olá! Bom dia, como posso te ajudar hoje?";
          } else if (texto.includes("boa tarde")) {
            return "Olá! Boa tarde, em que posso te ajudar?";
          } else if (texto.includes("boa noite")) {
            return "Olá! Boa noite, em que posso te ajudar .";
          }
        },
      },
      {
        chaves: ["horário", "funciona", "abre", "fecha"],
        opcoes: [
          "Estamos abertos de segunda a sábado, das 08h às 20h.",
          "Nosso horário é das 08h às 20h, de segunda a sábado.",
          "Abrimos de segunda a sábado, sempre das 8 às 20 horas.",
        ],
      },
      {
        chaves: ["corte", "serviço", "barbearia", "fazem"],
        opcoes: [
          "Oferecemos cortes, barba, sobrancelha, pigmentação e muito mais.",
          "Temos serviços como cortes tradicionais, modernos e design de barba.",
          "Aqui você encontra desde cortes simples até cuidados completos com a barba.",
        ],
      },
      {
        chaves: ["valor", "preço", "quanto custa"],
        opcoes: [
          "Os serviços variam entre R$ 20 e R$ 70, dependendo do que for solicitado.",
          "Nossos preços vão de R$ 20 a R$ 70.",
          "Cada serviço tem um valor, mas todos cabem no seu bolso!",
        ],
      },
      {
        chaves: ["agendar", "marcar", "agendamento"],
        opcoes: [
          "Você pode agendar clicando no botão de agendamento no topo do site.",
          "Para marcar um horário, acesse a seção de agendamentos no site.",
          "Agende seu horário sem sair de casa, aqui mesmo pelo nosso site!",
        ],
      },
      {
        chaves: ["pagamento", "forma de pagamento", "pix", "pagar"],
        opcoes: [
          "Aceitamos PIX, cartão de crédito, débito e dinheiro.",
          "Você pode pagar com dinheiro, cartão ou PIX, como preferir.",
          "Trabalhamos com várias formas de pagamento: PIX, cartão ou dinheiro.",
        ],
      },
      {
        chaves: ["atendente", "falar", "whatsapp"],
        opcoes: [
          "Redirecionando você para nosso WhatsApp, só um instante...",
          "Aguarde, você será enviado para o atendimento agora mesmo!",
          "Conectando com nosso time via WhatsApp...",
        ],
        redirecionar: true,
      },
      {
        chaves: ["encerrar", "finalizar", "sair"],
        opcoes: [
          "Atendimento encerrado. Se precisar, é só chamar!",
          "Obrigado pelo contato. Encerrando o atendimento.",
          "Encerramos por aqui, mas estamos sempre disponíveis para te atender!",
        ],
        encerrar: true,
      },
      {
        chaves: ["promoção", "desconto", "oferta", "pacote"],
        opcoes: [
          "Estamos com promoções especiais para cortes e barba! Consulte diretamente no atendimento.",
          "Temos pacotes promocionais para corte + barba. Fale com a gente pra saber mais!",
          "Descontos de fidelidade? Aqui tem! Clientes frequentes ganham benefícios.",
          "Confira nossas ofertas do mês diretamente com a equipe no WhatsApp!",
        ],
      },
      {
        chaves: ["endereço", "localização", "onde fica", "como chegar"],
        opcoes: [
          "Estamos localizados na Rua Exemplo, nº 123, centro. Fácil de encontrar!",
          "Nossa barbearia fica em um ponto central, com fácil acesso e estacionamento.",
          "Pode colocar no Google Maps: Barbearia Exemplo – vai te trazer direto aqui!",
          "Venha nos visitar! Endereço completo disponível no rodapé do site.",
        ],
      },
      {
        chaves: ["estilo", "corte da moda", "tendência", "qual corte combina"],
        opcoes: [
          "Os cortes degradê e low fade estão em alta! Mas tudo depende do seu estilo.",
          "Quer algo moderno? O mid fade com risca marcada está super em tendência!",
          "Podemos sugerir o corte ideal pro seu rosto. Fale com um dos nossos barbeiros.",
          "Cada pessoa tem um estilo. A gente te ajuda a encontrar o corte ideal!",
        ],
      },
      {
        chaves: ["produtos", "pomada", "gel", "creme", "shampoo"],
        opcoes: [
          "Utilizamos produtos de alta qualidade profissional, aprovados por dermatologistas.",
          "Nossas pomadas e finalizadores são todos de marcas reconhecidas no mercado.",
          "Trabalhamos com linhas premium para barba e cabelo. Aqui é só o melhor!",
          "Quer saber qual produto usamos? Fale com um barbeiro pelo WhatsApp!",
        ],
      },
      {
        chaves: ["barbeiro", "equipe", "quem atende", "profissionais"],
        opcoes: [
          "Temos uma equipe de barbeiros experientes e apaixonados pelo que fazem.",
          "Nossos profissionais são treinados nas últimas técnicas de corte e barba.",
          "Quer ser atendido por um barbeiro específico? É só informar na hora do agendamento!",
          "Nossa equipe está pronta pra te oferecer o melhor atendimento e estilo.",
        ],
      },
      {
        chaves: ["ambiente", "estrutura", "conforto", "espaço"],
        opcoes: [
          "Nossa barbearia tem ar-condicionado, TV, Wi-Fi e um ambiente super confortável.",
          "Enquanto espera, você pode relaxar com uma água gelada ou assistir TV!",
          "Um ambiente moderno, limpo e acolhedor te espera aqui!",
          "A estrutura foi pensada para te oferecer conforto e uma experiência top!",
        ],
      },
    ];

    for (let item of respostas) {
      for (let chave of item.chaves) {
        if (texto.includes(chave)) {
          if (item.responder) {
            resposta = item.responder(texto);
          } else {
            resposta =
              item.opcoes[Math.floor(Math.random() * item.opcoes.length)];
          }
          if (item.redirecionar) redirecionar = true;
          if (item.encerrar) encerrar = true;

          return { texto: resposta, redirecionar, encerrar };
        }
      }
    }

    return { texto: resposta, redirecionar, encerrar };
  }
});
