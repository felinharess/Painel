const form = document.getElementById('cadastroForm');
const roomSelect = document.getElementById('roomSelect');
const eventoDiv = document.getElementById('eventoDiv');
const customTimeDiv = document.getElementById('customTimeDiv');
const reservationsList = document.getElementById('reservationsList');
const deleteModal = document.getElementById('deleteModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');
const clearBtn = document.getElementById('clearBtn');
const viewRoomsBtn = document.getElementById('viewRoomsBtn');
const formTitle = document.getElementById('formTitle');
const formStatus = document.getElementById('formStatus');
const editIdInput = document.getElementById('editId');

let reservations = JSON.parse(localStorage.getItem('roomsData')) || {};
let reservationToDelete = null;

document.addEventListener('DOMContentLoaded', () => {
  updateDateTime();
  renderReservations();
  setupEventListeners();
});

function setupEventListeners() {
  roomSelect.addEventListener('change', (e) => {
    eventoDiv.classList.toggle('hidden', e.target.value !== 'auditorio');
  });

  document.getElementById('periodo').addEventListener('change', (e) => {
    customTimeDiv.classList.toggle('hidden', e.target.value !== 'custom');
  });

  form.addEventListener('submit', handleFormSubmit);

  clearBtn.addEventListener('click', resetForm);

  viewRoomsBtn.addEventListener('click', () => {
    window.location.href = "index.html";
  });

  closeDeleteModal.addEventListener('click', () => deleteModal.classList.add('hidden'));
  cancelDelete.addEventListener('click', () => deleteModal.classList.add('hidden'));
  confirmDelete.addEventListener('click', confirmDeleteReservation);
}

function handleFormSubmit(e) {
  e.preventDefault();

  const roomId = roomSelect.value;
  const turma = document.getElementById('turma').value;
  const materia = document.getElementById('materia').value;
  const professor = document.getElementById('professor').value;
  const evento = document.getElementById('evento').value;
  const periodo = document.getElementById('periodo').value;
  const editId = editIdInput.value;

  if (!roomId || !turma || !materia || !professor || !periodo) {
    showFormStatus('Preencha todos os campos obrigatórios', 'error');
    return;
  }

  let horario = '';
  if (periodo === 'custom') {
    const inicio = document.getElementById('horaInicio').value;
    const fim = document.getElementById('horaFim').value;
    
    if (!inicio || !fim) {
      showFormStatus('Preencha os horários personalizados', 'error');
      return;
    }
    
    horario = `${inicio.replace(':', 'h')} - ${fim.replace(':', 'h')}`;
  } else {
    const horarios = {
      matutino: '8:00 - 11:10',
      vespertino1: '13:00 - 15:00',
      vespertino2: '16:00 - 18:30',
      noturno: '19:00 - 22:00'
    };
    horario = horarios[periodo];
  }

  const reservation = {
    turma,
    materia,
    professor,
    horario,
    ...(roomId === 'auditorio' && { evento }),
    roomId,
    timestamp: new Date().toISOString()
  };

  const roomsData = JSON.parse(localStorage.getItem('roomsData')) || {};
  
  if (editId) {
    roomsData[editId] = reservation;
    showFormStatus('Reserva atualizada com sucesso!', 'success');
  } else {
    const reservationId = `res_${Date.now()}`;
    roomsData[reservationId] = reservation;
    showFormStatus('Reserva cadastrada com sucesso!', 'success');
  }

  localStorage.setItem('roomsData', JSON.stringify(roomsData));
  reservations = roomsData;
  
  resetForm();
  renderReservations();
  
  setTimeout(() => formStatus.classList.add('hidden'), 3000);
}

function renderReservations() {
  if (Object.keys(reservations).length === 0) {
    reservationsList.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fas fa-door-open text-3xl mb-2"></i>
        <p>Nenhuma reserva cadastrada</p>
      </div>
    `;
    return;
  }

  reservationsList.innerHTML = '';
  
  const sortedReservations = Object.entries(reservations).sort((a, b) => 
    new Date(b[1].timestamp) - new Date(a[1].timestamp)
  );

  sortedReservations.forEach(([id, reservation], index) => {
    const card = document.createElement('div');
    card.className = `reservation-card bg-gray-50 p-4 rounded-lg border border-gray-200 ${getStatusClass(reservation.horario)}`;
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <h4 class="font-bold text-indigo-700">${getRoomName(reservation.roomId)}</h4>
        <span class="text-xs px-2 py-1 rounded-full ${reservation.roomId === 'auditorio' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
          ${reservation.roomId === 'auditorio' ? 'Evento' : 'Aula'}
        </span>
      </div>
      
      <div class="space-y-1 text-sm">
        <p class="flex items-center gap-2"><i class="fas fa-users text-gray-500 w-4"></i> ${reservation.turma}</p>
        <p class="flex items-center gap-2"><i class="fas fa-book text-gray-500 w-4"></i> ${reservation.materia}</p>
        <p class="flex items-center gap-2"><i class="fas fa-user-tie text-gray-500 w-4"></i> ${reservation.professor}</p>
        <p class="flex items-center gap-2"><i class="fas fa-clock text-gray-500 w-4"></i> ${reservation.horario}</p>
        ${reservation.roomId === 'auditorio' && reservation.evento ? 
          `<p class="flex items-center gap-2"><i class="fas fa-calendar-alt text-gray-500 w-4"></i> ${reservation.evento}</p>` : ''}
      </div>
      
      <div class="flex justify-end gap-2 mt-3">
        <button class="edit-btn px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-all" data-id="${id}">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="delete-btn px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-all" data-id="${id}">
          <i class="fas fa-trash-alt"></i> Excluir
        </button>
      </div>
    `;
    
    reservationsList.appendChild(card);
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => editReservation(e.target.closest('button').dataset.id));
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => openDeleteModal(e.target.closest('button').dataset.id));
  });
}

function editReservation(id) {
  const reservation = reservations[id];
  if (!reservation) return;

  formTitle.textContent = 'Editar Reserva';
  editIdInput.value = id;
  
  roomSelect.value = reservation.roomId;
  document.getElementById('turma').value = reservation.turma;
  document.getElementById('materia').value = reservation.materia;
  document.getElementById('professor').value = reservation.professor;
  
  if (reservation.roomId === 'auditorio') {
    eventoDiv.classList.remove('hidden');
    document.getElementById('evento').value = reservation.evento || '';
  } else {
    eventoDiv.classList.add('hidden');
  }
  
  const [startTime, endTime] = reservation.horario.split(' - ');
  
  const predefinedPeriods = {
    '8:00 - 11:10': 'matutino',
    '13:00 - 15:00': 'vespertino1',
    '16:00 - 18:30': 'vespertino2',
    '19:00 - 22:00': 'noturno'
  };
  
  const periodoSelect = document.getElementById('periodo');
  
  if (predefinedPeriods[reservation.horario]) {
    periodoSelect.value = predefinedPeriods[reservation.horario];
    customTimeDiv.classList.add('hidden');
  } else {
    periodoSelect.value = 'custom';
    customTimeDiv.classList.remove('hidden');
    
    const formatTimeForInput = (timeStr) => {
      const [hours, minutes] = timeStr.replace('h', ':').split(':');
      return `${hours.padStart(2, '0')}:${minutes || '00'}`;
    };
    
    document.getElementById('horaInicio').value = formatTimeForInput(startTime);
    document.getElementById('horaFim').value = formatTimeForInput(endTime);
  }
  
  form.scrollIntoView({ behavior: 'smooth' });
  showFormStatus('Editando reserva...', 'info');
}

function openDeleteModal(id) {
  reservationToDelete = id;
  deleteModal.classList.remove('hidden');
}

function confirmDeleteReservation() {
  if (!reservationToDelete) return;

  const roomsData = JSON.parse(localStorage.getItem('roomsData')) || {};
  delete roomsData[reservationToDelete];
  localStorage.setItem('roomsData', JSON.stringify(roomsData));
  
  reservations = roomsData;
  renderReservations();
  deleteModal.classList.add('hidden');
  reservationToDelete = null;
  
  showFormStatus('Reserva excluída com sucesso!', 'success');
  setTimeout(() => formStatus.classList.add('hidden'), 3000);
}

function resetForm() {
  form.reset();
  editIdInput.value = '';
  formTitle.textContent = 'Cadastrar Sala';
  eventoDiv.classList.add('hidden');
  customTimeDiv.classList.add('hidden');
  formStatus.classList.add('hidden');
}

function showFormStatus(message, type) {
  formStatus.textContent = message;
  formStatus.classList.remove('hidden', 'bg-indigo-100', 'bg-red-100', 'bg-green-100', 'text-indigo-800', 'text-red-800', 'text-green-800');
  
  const typeClasses = {
    success: ['bg-green-100', 'text-green-800'],
    error: ['bg-red-100', 'text-red-800'],
    info: ['bg-indigo-100', 'text-indigo-800']
  };
  
  formStatus.classList.add(...typeClasses[type]);
}

function getRoomName(roomId) {
  const roomNames = {
    lab1: 'Laboratório 1',
    lab2: 'Laboratório 2',
    lab3: 'Laboratório 3',
    lab4: 'Laboratório 4',
    lab5: 'Laboratório 5',
    auditorio: 'Auditório',
    multiuso: 'Sala Multiuso'
  };
  return roomNames[roomId] || roomId;
}

function getStatusClass(horario) {
  if (!horario) return 'status-available';
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  try {
    const [startStr, endStr] = horario.split(' - ');
    const [startHour, startMinute] = startStr.replace('h', ':').split(':').map(Number);
    const [endHour, endMinute] = endStr.replace('h', ':').split(':').map(Number);
    
    const start = startHour * 60 + (startMinute || 0);
    const end = endHour * 60 + (endMinute || 0);
    
    return (currentMinutes >= start && currentMinutes <= end) ? 'status-occupied' : 'status-available';
  } catch {
    return 'status-available';
  }
}

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