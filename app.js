// Função para alternar o tema
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Atualiza o atributo data-theme
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // Atualiza o ícone do botão
  const themeIcon = document.getElementById('themeToggle').querySelector('i');
  themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  
  // Salva a preferência no localStorage
  localStorage.setItem('theme', newTheme);
}

// Verifica o tema salvo ou preferência do sistema
function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const themeIcon = document.getElementById('themeToggle').querySelector('i');
  themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Atualizar data e hora
function updateDateTime() {
  const now = new Date();
  const datetimeElement = document.getElementById('currentDateTime');
  
  // Formatar hora
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}:${seconds}`;
  
  // Formatar data
  const options = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  const dateString = now.toLocaleDateString('pt-BR', options);
  
  // Atualizar elementos
  const timePart = datetimeElement.querySelector('.time-part');
  const datePart = datetimeElement.querySelector('.date-part');
  
  timePart.textContent = timeString;
  datePart.textContent = dateString;
}

// Atualiza os cards das salas
function updateRoomDisplays() {
  const roomsData = JSON.parse(localStorage.getItem('roomsData')) || {};
  const roomsContainer = document.querySelector('.rooms-container');

  const allRooms = [
    { id: 'lab1', name: 'Laboratório 1', type: 'lab' },
    { id: 'lab2', name: 'Laboratório 2', type: 'lab' },
    { id: 'lab3', name: 'Laboratório 3', type: 'lab' },
    { id: 'lab4', name: 'Laboratório 4', type: 'lab' },
    { id: 'lab5', name: 'Laboratório 5', type: 'lab' },
    { id: 'auditorio', name: 'Auditório', type: 'event' },
    { id: 'multiuso', name: 'Sala Multiuso', type: 'class' }
  ];

  roomsContainer.innerHTML = '';

  allRooms.forEach(room => {
    const reservation = Object.values(roomsData).find(r => r.roomId === room.id);

    const roomCard = document.createElement('div');
    roomCard.className = 'room-card';
    roomCard.setAttribute('data-type', room.type);
    roomCard.style.animationDelay = `${Math.random() * 0.5}s`;

    roomCard.innerHTML = `
      <div class="content">
        <h3>${room.name}</h3>
        <div class="details">
          ${reservation ? `
            <p><i class="fas fa-users"></i> ${reservation.turma}</p>
            <p><i class="fas fa-book"></i> ${reservation.materia}</p>
            <p><i class="fas fa-user-tie"></i> ${reservation.professor}</p>
            <p><i class="fas fa-clock"></i> ${reservation.horario}</p>
            ${room.id === 'auditorio' && reservation.evento ? `
              <p><i class="fas fa-calendar-alt"></i> ${reservation.evento}</p>
            ` : ''}
          ` : `
            <p><i class="fas fa-door-open"></i> Sala disponível</p>
          `}
        </div>
      </div>
    `;

    roomsContainer.appendChild(roomCard);
  });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  // Carrega o tema
  loadTheme();
  
  // Configura o botão de alternar tema
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  
  // Atualiza data/hora e salas
  updateDateTime();
  updateRoomDisplays();

  // Atualiza a cada segundo para o relógio
  setInterval(updateDateTime, 1000);
  
  // Atualiza salas a cada minuto
  setInterval(updateRoomDisplays, 60000);

  // Verifica se há edição pela URL
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');
  if (editId) {
    window.location.href = `cadastro.html?edit=${editId}`;
  }
});