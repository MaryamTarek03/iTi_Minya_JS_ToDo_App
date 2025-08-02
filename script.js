class TodoApp {
  constructor() {
    this.todoTasks = [];
    this.finishedTasks = [];
    this.currentEditingTaskId = null;

    this.taskInput = document.getElementById("taskInput");
    this.addTaskBtn = document.getElementById("addTaskBtn");
    this.todoList = document.getElementById("todoList");
    this.finishedList = document.getElementById("finishedList");
    this.editModal = document.getElementById("editModal");
    this.editTaskInput = document.getElementById("editTaskInput");
    this.saveEditBtn = document.getElementById("saveEditBtn");
    this.cancelEditBtn = document.getElementById("cancelEditBtn");
    this.closeBtn = document.querySelector(".close");

    this.bindEvents();
    this.loadTasks();
    this.renderTasks();
  }

  bindEvents() {
    this.addTaskBtn.addEventListener("click", () => this.addTask());

    this.taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.addTask();
      }
    });

    // modal events
    this.saveEditBtn.addEventListener("click", () => this.saveEdit());
    this.cancelEditBtn.addEventListener("click", () => this.closeModal());
    this.closeBtn.addEventListener("click", () => this.closeModal());

    // close modal when clicking outside
    this.editModal.addEventListener("click", (e) => {
      if (e.target === this.editModal) {
        this.closeModal();
      }
    });

    this.editTaskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.saveEdit();
      }
    });
  }

  // unique ID for tasks
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  addTask() {
    const taskText = this.taskInput.value.trim();

    if (taskText === "") {
      alert("Please enter a task!");
      return;
    }

    const newTask = {
      id: this.generateId(),
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.todoTasks.push(newTask);
    this.taskInput.value = "";
    // to keep focus on input
    this.taskInput.focus();

    this.saveTasks();
    this.renderTasks();

    this.showNotification("Task added successfully!", "success");
  }

  toggleTask(taskId) {
    const todoIndex = this.todoTasks.findIndex((task) => task.id === taskId);

    if (todoIndex !== -1) {
      // move from todo to finished
      const task = this.todoTasks.splice(todoIndex, 1)[0];
      task.completed = true;
      task.completedAt = new Date().toISOString();
      this.finishedTasks.push(task);
      this.showNotification("Task completed!", "success");
    } else {
      const finishedIndex = this.finishedTasks.findIndex(
        (task) => task.id === taskId
      );
      if (finishedIndex !== -1) {
        // move from finished to todo
        const task = this.finishedTasks.splice(finishedIndex, 1)[0];
        task.completed = false;
        delete task.completedAt;
        this.todoTasks.push(task);
        this.showNotification("Task moved back to todo!", "info");
      }
    }

    this.saveTasks();
    this.renderTasks();
  }

  deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
      // put every thing except the taskId
      this.todoTasks = this.todoTasks.filter((task) => task.id !== taskId);
      this.finishedTasks = this.finishedTasks.filter(
        (task) => task.id !== taskId
      );

      this.saveTasks();
      this.renderTasks();
      this.showNotification("Task deleted!", "error");
    }
  }

  editTask(taskId) {
    let task =
      this.todoTasks.find((t) => t.id === taskId) ||
      this.finishedTasks.find((t) => t.id === taskId);

    if (task) {
      this.currentEditingTaskId = taskId;
      this.editTaskInput.value = task.text;
      this.editModal.style.display = "block"; // instead of none
      this.editTaskInput.focus();
      this.editTaskInput.select();
    }
  }

  // save button
  saveEdit() {
    const newText = this.editTaskInput.value.trim();

    if (newText === "") {
      this.showNotification("Task text cannot be empty!", "error");
      return;
    }

    // find and update task in todo list or finished list
    const todoTask =
      this.todoTasks.find((task) => task.id === this.currentEditingTaskId) ||
      this.finishedTasks.find((task) => task.id === this.currentEditingTaskId);
    todoTask.text = newText;
    todoTask.updatedAt = new Date().toISOString();

    this.closeModal();
    this.saveTasks();
    this.renderTasks();
    this.showNotification("Task updated!", "success");
  }

  closeModal() {
    this.editModal.style.display = "none";
    this.currentEditingTaskId = null;
    this.editTaskInput.value = "";
  }

  renderTasks() {
    this.renderTodoTasks();
    this.renderFinishedTasks();
  }

  renderTodoTasks() {
    this.todoList.innerHTML = "";

    if (this.todoTasks.length === 0) {
      this.todoList.innerHTML =
        '<div class="empty-message">No todo tasks. Add a new task above!</div>';
      return;
    }

    this.todoTasks.forEach((task) => {
      const taskElement = this.createTaskElement(task, false);
      this.todoList.appendChild(taskElement);
    });
  }

  renderFinishedTasks() {
    this.finishedList.innerHTML = "";

    if (this.finishedTasks.length === 0) {
      this.finishedList.innerHTML =
        '<div class="empty-message">No finished tasks yet.</div>';
      return;
    }

    this.finishedTasks.forEach((task) => {
      const taskElement = this.createTaskElement(task, true);
      this.finishedList.appendChild(taskElement);
    });
  }

  createTaskElement(task, isFinished) {
    const li = document.createElement("li");
    li.className = `task-item ${isFinished ? "finished" : ""}`;

    li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${
                  isFinished ? "checked" : ""
                }>
                <span class="task-text ${isFinished ? "completed" : ""}">${
      task.text
    }</span>
            </div>
            <div class="task-actions">
                <button class="btn btn-edit" onclick="todoApp.editTask('${
                  task.id
                }')">Edit</button>
                <button class="btn btn-delete" onclick="todoApp.deleteTask('${
                  task.id
                }')">Delete</button>
            </div>
        `;

    const checkbox = li.querySelector(".task-checkbox");
    checkbox.addEventListener("change", () => {
      this.toggleTask(task.id);
    });

    return li;
  }

  showNotification(message, type = "info") {
    // remove existing notifications
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1001;
        `;

    switch (type) {
      case "success":
        notification.style.backgroundColor = "#28a745";
        break;
      case "error":
        notification.style.backgroundColor = "#dc3545";
        break;
      case "info":
        notification.style.backgroundColor = "#17a2b8";
        break;
      default:
        notification.style.backgroundColor = "#6c757d";
    }

    document.body.appendChild(notification);

    // remove notification after 2 seconds
    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  saveTasks() {
    const data = {
      todoTasks: this.todoTasks,
      finishedTasks: this.finishedTasks,
      lastSaved: new Date().toISOString(),
    };

    try {
      localStorage.setItem("todoAppData", JSON.stringify(data));
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error);
      this.showNotification("Error saving tasks!", "error");
    }
  }

  loadTasks() {
    try {
      const data = localStorage.getItem("todoAppData");
      if (data) {
        const parsedData = JSON.parse(data);
        this.todoTasks = parsedData.todoTasks || [];
        this.finishedTasks = parsedData.finishedTasks || [];
      }
    } catch (error) {
      console.error("Error loading tasks from localStorage:", error);
      this.showNotification("Error loading saved tasks!", "error");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.todoApp = new TodoApp();
});
