// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Create a function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Create a function to create a task card
function createTaskCard(task) {
  let taskColor = '';

  if (dayjs(task.deadline).isBefore(dayjs())) {
    taskColor = 'bg-danger text-white'; // overdue
  } else if (dayjs(task.deadline).isBefore(dayjs().add(2, 'day'))) {
    taskColor = 'bg-warning text-dark'; // nearing deadline
  }

  return `
    <div class="task-card card mb-2 ${taskColor}" id="task-${task.id}" draggable="true">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small>Due: ${dayjs(task.deadline).format('YYYY-MM-DD')}</small></p>
        <button class="btn btn-danger btn-sm" onclick="handleDeleteTask(${task.id})">Delete</button>
      </div>
    </div>
  `;
}

// Create a function to render the task list and make cards draggable
function renderTaskList() {
  // Clear existing tasks
  document.querySelector('#not-yet-started-cards').innerHTML = '';
  document.querySelector('#in-progress-cards').innerHTML = '';
  document.querySelector('#completed-cards').innerHTML = '';

  // Render tasks
  taskList.forEach(task => {
    const taskCard = createTaskCard(task);
    document.querySelector(`#${task.status}-cards`).innerHTML += taskCard;
  });

  // Make tasks draggable
  document.querySelectorAll('.task-card').forEach(taskCard => {
    taskCard.addEventListener('dragstart', event => {
      event.dataTransfer.setData('text/plain', event.target.id);
    });
  });
}

// Create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const title = document.querySelector('#task-title').value;
  const description = document.querySelector('#task-description').value;
  const deadline = document.querySelector('#task-deadline').value;

  if (title && description && deadline) {
    const newTask = {
      id: generateTaskId(),
      title,
      description,
      deadline,
      status: 'not-yet-started'
    };

    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));
    renderTaskList();
    $('#formModal').modal('hide');
    document.querySelector('#add-task-form').reset();
  }
}

// Create a function to handle deleting a task
function handleDeleteTask(id) {
  taskList = taskList.filter(task => task.id !== id);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Create a function to handle dropping a task into a new status lane
function handleDrop(event, status) {
  event.preventDefault();
  const taskId = event.dataTransfer.getData('text');
  const taskElement = document.getElementById(taskId);
  const task = taskList.find(task => `task-${task.id}` === taskId);

  task.status = status;
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  // Add event listeners for adding a task
  document.querySelector('#add-task-form').addEventListener('submit', handleAddTask);

  // Make lanes droppable
  document.querySelectorAll('.lane').forEach(lane => {
    lane.addEventListener('dragover', event => event.preventDefault());
    lane.addEventListener('drop', event => handleDrop(event, lane.id));
  });
});
