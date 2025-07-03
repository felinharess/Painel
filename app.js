function updateDateTime() {
  const now = new Date();
  const datetimeElement = document.getElementById('currentDateTime');
  
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}:${seconds}`;
  
  const options = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  const dateString = now.toLocaleDateString('pt-BR', options);
  
  const timePart = datetimeElement.querySelector('.time-part');
  const datePart = datetimeElement.querySelector('.date-part');
  
  timePart.textContent = timeString;
  datePart.textContent = dateString;
}

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

document.addEventListener('DOMContentLoaded', () => {
  updateDateTime();
  updateRoomDisplays();

  setInterval(updateDateTime, 1000);
  
  setInterval(updateRoomDisplays, 60000);

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');
  if (editId) {
    window.location.href = `cadastro.html?edit=${editId}`;
  }
});