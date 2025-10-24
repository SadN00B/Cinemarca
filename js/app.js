    const CineApp = {
    
    // Configurações
    ticketPrice: 30.00, // Preço do ingresso (Inteira)

    // Estado da Aplicação
    selection: {
        movieId: null,
        movieName: null,
        showtime: null,
        seats: [] // Array de objetos: { id: "A1", type: "inteira" }
    },
    
    auth: {
        
        /**
         * Função auxiliar para pegar um cookie específico pelo nome
         * @param {string} name - O nome do cookie
         * @returns {string|undefined} - O valor do cookie ou undefined
         */
        getCookie: function(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        },


        logout: function() {
            // Apaga o cookie setando a data de expiração para o passado
            document.cookie = "loggedInUser=; max-age=0; path=/";
            // Redireciona para o login
            window.location.href = "login.html";
        },

        checkState: function() {
            // 'this.getCookie' usa a função dentro deste objeto 'auth'
            const userEmail = this.getCookie("loggedInUser"); 
            const loginLink = document.getElementById("login-nav-link");
            
            // Se não houver link de login no header, não faz nada
            if (!loginLink) return; 

            // 1. SE ESTIVER LOGADO
            if (userEmail) {
                // Se está logado e tentando acessar login/cadastro, manda para home
                if (window.location.pathname.includes("login.html") || window.location.pathname.includes("cadastro.html")) {
                    window.location.href = "index.html";
                    return; 
                }
                
                // Atualiza o botão de "Login" para "Logout"
                loginLink.textContent = "Logout";
                loginLink.href = "#"; 
                loginLink.onclick = this.logout.bind(this); // Garante que o 'this' no logout seja o objeto 'auth'

            } 
            // 2. SE ESTIVER DESLOGADO
            else {
                loginLink.textContent = "Login";
                loginLink.href = "login.html";
                loginLink.onclick = null; 
            }
        }
    },

    pages: {

        initLogin: function() {
            const loginForm = document.getElementById("login-form");
            // Se o formulário de login não existir nesta página, não faz nada
            if (!loginForm) return; 

            const emailInput = document.getElementById("email");
            const passwordInput = document.getElementById("senha");
            const errorElement = document.getElementById("login-error");

            loginForm.addEventListener("submit", function(event) {
                event.preventDefault(); 
                const email = emailInput.value.trim();
                const password = passwordInput.value.trim();
                errorElement.textContent = "";

                if (email === "" || password === "") {
                    errorElement.textContent = "Por favor, preencha todos os campos.";
                    return;
                }

                // Busca usuários do "banco de dados" localStorage
                const users = JSON.parse(localStorage.getItem("users")) || [];
                const foundUser = users.find(user => user.email === email && user.password === password);

                if (foundUser) {
                    // Sucesso! Cria o cookie
                    document.cookie = "loggedInUser=" + email + "; max-age=3600; path=/";
                    window.location.href = "index.html";
                } else {
                    errorElement.textContent = "E-mail ou senha incorretos.";
                }
            });
        },

        initCadastro: function() {
            const cadastroForm = document.getElementById("cadastro-form");
            // Se o formulário de cadastro não existir, não faz nada
            if (!cadastroForm) return; 

            const emailInput = document.getElementById("email");
            const passInput = document.getElementById("senha");
            const passConfirmInput = document.getElementById("senha-confirma");
            const msgElement = document.getElementById("cadastro-msg");

            cadastroForm.addEventListener("submit", function(event) {
                event.preventDefault(); 
                const email = emailInput.value.trim();
                const password = passInput.value.trim();
                const passwordConfirm = passConfirmInput.value.trim();

                msgElement.textContent = "";
                msgElement.className = "text-center mb-3";

                // Validações
                if (email === "" || password === "" || passwordConfirm === "") {
                    msgElement.textContent = "Por favor, preencha todos os campos.";
                    msgElement.classList.add("text-danger");
                    return;
                }
                if (password !== passwordConfirm) {
                    msgElement.textContent = "As senhas não coincidem.";
                    msgElement.classList.add("text-danger");
                    return;
                }

                let users = JSON.parse(localStorage.getItem("users")) || [];
                const userExists = users.find(user => user.email === email);

                if (userExists) {
                    msgElement.textContent = "Este e-mail já está cadastrado.";
                    msgElement.classList.add("text-danger");
                    return;
                }

                // Salva o novo usuário
                users.push({ email: email, password: password });
                localStorage.setItem("users", JSON.stringify(users));

                msgElement.textContent = "Cadastro realizado com sucesso! Redirecionando...";
                msgElement.classList.add("text-success");

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            });
        },

        initHome: function() {
        },

        initCompra: function() {
            const seatContainer = document.getElementById('assentos');
            // Se não estamos na página de compra, encerra
            if (!seatContainer) return;

            // 1. Pegar dados da URL
            const urlParams = new URLSearchParams(window.location.search);
            CineApp.selection.movieId = urlParams.get('id');
            CineApp.selection.movieName = urlParams.get('nome');
            const movieImg = urlParams.get('img');

            // 2. Popular infos do filme
            document.getElementById('movie-title').textContent = CineApp.selection.movieName;
            document.getElementById('movie-img').src = movieImg;

            // 3. Gerar Assentos (32 assentos, 4 fileiras de 8)
            const fileiras = ['A', 'B', 'C', 'D'];
            for (let f of fileiras) {
                for (let i = 1; i <= 8; i++) {
                    const seatId = f + i;
                    const seatEl = document.createElement('div');
                    seatEl.classList.add('seat');
                    seatEl.dataset.seatId = seatId; // ex: data-seat-id="A1"
                    seatEl.textContent = seatId;
                    seatContainer.appendChild(seatEl);
                }
            }

            // 4. Adicionar Listeners
            // Listener para Horários
            document.getElementById('horarios').addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    CineApp.helpers.selectShowtime(e.target);
                }
            });

            // Listener para Assentos
            seatContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
                    CineApp.helpers.toggleSeat(e.target);
                }
            });
            
            // Listener para Botão de Confirmar
            document.getElementById('confirm-btn').addEventListener('click', () => {
                CineApp.helpers.confirmBooking();
            });
        }
    },

    helpers: {
        
        selectShowtime: function(buttonEl) {
            // Limpa seleção anterior
            document.querySelectorAll('#horarios .btn').forEach(btn => btn.classList.remove('active'));
            buttonEl.classList.add('active');
            
            CineApp.selection.showtime = buttonEl.dataset.time;

            // Limpa assentos selecionados e atualiza o resumo
            CineApp.selection.seats = [];
            this.updateSummary();
            
            // Carrega os assentos ocupados para este filme/horário
            this.loadOccupiedSeats();
        },

        loadOccupiedSeats: function() {
            // Limpa todos os assentos (remove 'occupied' e 'selected')
            document.querySelectorAll('#assentos .seat').forEach(seat => {
                seat.classList.remove('occupied', 'selected');
            });
            
            const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
            const movieId = CineApp.selection.movieId;
            const showtime = CineApp.selection.showtime;

            // Filtra as reservas para ESTE filme e ESTA sessão
            const relevantBookings = bookings.filter(b => b.movieId === movieId && b.showtime === showtime);

            // Marca os assentos como ocupados
            relevantBookings.forEach(booking => {
                booking.seats.forEach(seatObj => {
                    const seatEl = document.querySelector(`.seat[data-seat-id="${seatObj.id}"]`);
                    if (seatEl) {
                        seatEl.classList.add('occupied');
                    }
                });
            });
        },

        toggleSeat: function(seatEl) {
            if (!CineApp.selection.showtime) {
                alert("Por favor, selecione um horário primeiro.");
                return;
            }

            const seatId = seatEl.dataset.seatId;
            const isSelected = seatEl.classList.toggle('selected');

            if (isSelected) {
                // Adiciona à seleção
                CineApp.selection.seats.push({ id: seatId, type: 'inteira' });
            } else {
                // Remove da seleção
                CineApp.selection.seats = CineApp.selection.seats.filter(seat => seat.id !== seatId);
            }
            
            // Atualiza o resumo e o preço
            this.updateSummary();
        },


        updateSummary: function() {
            const summaryEl = document.getElementById('selected-seats-list');
            const totalEl = document.getElementById('total-price');
            let totalPrice = 0;

            if (CineApp.selection.seats.length === 0) {
                summaryEl.innerHTML = "<p>Selecione um horário e os assentos.</p>";
                totalEl.textContent = "0.00";
                return;
            }
            
            summaryEl.innerHTML = ""; // Limpa o resumo

            CineApp.selection.seats.forEach(seat => {
                const price = (seat.type === 'inteira') ? CineApp.ticketPrice : (CineApp.ticketPrice / 2);
                totalPrice += price;

                const itemEl = document.createElement('div');
                itemEl.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-2');
                itemEl.innerHTML = `
                    <span>Assento ${seat.id}</span>
                    <select class="ticket-type-selector" data-seat-id="${seat.id}">
                        <option value="inteira" ${seat.type === 'inteira' ? 'selected' : ''}>Inteira (R$ ${CineApp.ticketPrice.toFixed(2)})</option>
                        <option value="meia" ${seat.type === 'meia' ? 'selected' : ''}>Meia (R$ ${(CineApp.ticketPrice / 2).toFixed(2)})</option>
                    </select>
                `;
                summaryEl.appendChild(itemEl);
            });

            summaryEl.querySelectorAll('.ticket-type-selector').forEach(select => {
                select.addEventListener('change', (e) => {
                    const changedSeatId = e.target.dataset.seatId;
                    const newType = e.target.value;
                    const seatToUpdate = CineApp.selection.seats.find(s => s.id === changedSeatId);
                    if (seatToUpdate) {
                        seatToUpdate.type = newType;
                    }
                    // Recalcula tudo
                    this.updateSummary();
                });
            });

            // Atualiza o valor total
            totalEl.textContent = totalPrice.toFixed(2);
        },


        confirmBooking: function() {
            const user = CineApp.auth.getCookie('loggedInUser');

            // 1. Verifica se está logado
            if (!user) {
                alert("Você precisa estar logado para confirmar a compra. Redirecionando para o login...");
                window.location.href = "login.html";
                return;
            }
            
            // 2. Verifica se selecionou tudo
            if (!CineApp.selection.showtime || CineApp.selection.seats.length === 0) {
                alert("Por favor, selecione um horário e pelo menos um assento.");
                return;
            }

            // 3. Salva a reserva
            const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
            
            const newBooking = {
                userEmail: user,
                movieId: CineApp.selection.movieId,
                movieName: CineApp.selection.movieName,
                showtime: CineApp.selection.showtime,
                seats: CineApp.selection.seats, 
                total: parseFloat(document.getElementById('total-price').textContent)
            };
            
            bookings.push(newBooking);
            localStorage.setItem('bookings', JSON.stringify(bookings));

            // 4. Confirma e redireciona
            alert(`Compra confirmada para ${user}!\nFilme: ${newBooking.movieName}\nHorário: ${newBooking.showtime}\nAssentos: ${newBooking.seats.map(s => s.id).join(', ')}\n\nObrigado!`);
            window.location.href = "index.html";
        }
    },

    init: function() {
        // 1. Sempre verifica o estado de login em qualquer página
        // 'this' aqui se refere ao objeto CineApp
        this.auth.checkState(); 

        // 2. Executa a lógica da página atual
        this.pages.initHome();
        this.pages.initLogin();
        this.pages.initCadastro();
        this.pages.initCompra();
    }
};

// O .bind(CineApp) é para garantir que o 'this' dentro de init() seja o objeto CineApp

document.addEventListener("DOMContentLoaded", CineApp.init.bind(CineApp));
