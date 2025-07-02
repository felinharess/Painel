// Atualização de data e hora em tempo real
function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const formattedDateTime = now.toLocaleDateString('pt-BR', options);
    document.getElementById('currentDateTime').textContent = formattedDateTime;
}

setInterval(updateDateTime, 1000);
updateDateTime();

// Atualizar conteúdo das salas
function updateRoomDisplays() {
    const roomsData = JSON.parse(localStorage.getItem('roomsData')) || {};
    for (const roomId in roomsData) {
        const room = roomsData[roomId];
        const contentElement = document.getElementById(`${roomId}-content`);
        if (contentElement) {
            if (room.turma && room.materia && room.professor && room.horario) {
                let contentHTML = `
                    <p><i class="fas fa-users mr-2"></i> ${room.turma}</p>
                    <p><i class="fas fa-book mr-2"></i> ${room.materia}</p>
                    <p><i class="fas fa-user-tie mr-2"></i> ${room.professor}</p>
                    <p><i class="fas fa-clock mr-2"></i> ${room.horario}</p>
                `;
                if (roomId === 'auditorio' && room.evento) {
                    contentHTML += `<p><i class="fas fa-calendar-alt mr-2"></i> ${room.evento}</p>`;
                }
                contentElement.innerHTML = contentHTML;
            } else {
                contentElement.innerHTML = `<p><i class="fas fa-clock mr-2"></i> Disponível</p>`;
            }
        }
    }
}

// Atualizar status das salas
function checkRoomStatus() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const roomsData = JSON.parse(localStorage.getItem('roomsData')) || {};

    for (const roomId in roomsData) {
        const room = roomsData[roomId];
        const [startHour, startMinute] = room.horario.split(' - ')[0].replace('h', ':').split(':').map(Number);
        const [endHour, endMinute] = room.horario.split(' - ')[1].replace('h', ':').split(':').map(Number);

        const start = startHour * 60 + startMinute;
        const end = endHour * 60 + endMinute;

        const isOccupied = currentMinutes >= start && currentMinutes <= end;

        const roomElement = document.getElementById(roomId);
        if (roomElement) {
            roomElement.classList.remove('available', 'occupied');
            roomElement.classList.add(isOccupied ? 'occupied' : 'available');

            const dot = roomElement.querySelector('.status-dot');
            dot?.classList.remove('available-dot', 'occupied-dot');
            dot?.classList.add(isOccupied ? 'occupied-dot' : 'available-dot');
        }
    }

    updateRoomDisplays();
}

// Botão para redirecionar à página de cadastro
document.getElementById('adminBtn').addEventListener('click', () => {
    window.location.href = "cadastro.html";
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    updateRoomDisplays();
    checkRoomStatus();
    setInterval(checkRoomStatus, 60000);
});
