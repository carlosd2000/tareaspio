<template>
  <div class="about-container min-vh-100 d-flex flex-column justify-content-center align-items-center p-4" style="background: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%);">
    <div class="card p-5 shadow-lg rounded-4 text-center" style="max-width: 700px; width: 100%;">
      
      <!-- Botón de cerrar sesión arriba a la derecha -->
      <div class="text-end mb-3">
        <button class="btn btn-danger fw-bold" @click="handleLogout">Cerrar Sesión</button>
      </div>

      <h1 class="text-gradient mb-4">Gestión de Tareas</h1>
      <p class="mb-4">Aquí puedes gestionar tus tareas</p>

      <form @submit.prevent="handleCreateTask" class="d-flex flex-column gap-3 mb-4">
        <input v-model="newTask.title" type="text" class="form-control" placeholder="Título" required />
        <textarea v-model="newTask.description" class="form-control" placeholder="Descripción" required></textarea>
        <input v-model="newTask.dueDate" type="date" class="form-control" required />
        <select v-model="newTask.priority" class="form-control" required>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
        <button type="submit" class="btn btn-primary fw-bold">Crear Tarea</button>
      </form>

      <ul class="list-group">
        <li v-for="task in tasks" :key="task.id" class="list-group-item d-flex flex-column align-items-start mb-3 shadow-sm rounded p-3">
          <div class="mb-2">
            <strong>{{ task.title }}</strong> - {{ task.description }}<br />
            Fecha: {{ formatDate(task.dueDate) }} | Prioridad: {{ task.priority }} | Estado: {{ task.status }}
          </div>
          <div class="d-flex gap-2 w-100 justify-content-end">
            <button class="btn btn-warning btn-sm fw-bold" @click="handleUpdateStatus(task)">Cambiar Estado</button>
            <button class="btn btn-info btn-sm fw-bold" @click="handleEditTask(task)">Editar</button>
            <button class="btn btn-danger btn-sm fw-bold" @click="handleDeleteTask(task.id)">Eliminar</button>
          </div>
        </li>
      </ul>

    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loadTasks, createTask, updateTask, deleteTask } from '../firebase/tareasService'
import Swal from 'sweetalert2'

export default {
  name: 'About',
  setup() {
    const isLoggedIn = ref(false)
    const router = useRouter()
    const tasks = ref([])
    const newTask = ref({
      title: '',
      description: '',
      dueDate: '',
      priority: 'Alta',
      status: 'Pendiente'
    })

    const fetchTasks = async () => {
      tasks.value = await loadTasks()
    }

    const handleCreateTask = async () => {
      try {
        await createTask({
          ...newTask.value,
          dueDate: new Date(newTask.value.dueDate).toISOString()
        })
        Swal.fire('Éxito', 'Tarea creada', 'success')
        newTask.value = { title: '', description: '', dueDate: '', priority: 'Alta', status: 'Pendiente' }
        fetchTasks()
      } catch (error) {
        Swal.fire('Error', 'No se pudo crear la tarea', 'error')
      }
    }

    const handleUpdateStatus = async (task) => {
      try {
        const newStatus = task.status === 'Pendiente' ? 'Completada' : 'Pendiente'
        await updateTask(task.id, { status: newStatus })
        fetchTasks()
      } catch (error) {
        Swal.fire('Error', 'No se pudo actualizar el estado', 'error')
      }
    }

    const handleEditTask = async (task) => {
      const { value: formValues } = await Swal.fire({
        title: 'Editar Tarea',
        html: `
          <input id="swal-title" class="swal2-input" placeholder="Título" value="${task.title}">
          <textarea id="swal-description" class="swal2-textarea" placeholder="Descripción">${task.description}</textarea>
          <input id="swal-dueDate" class="swal2-input" type="date" value="${task.dueDate.split('T')[0]}">
          <select id="swal-priority" class="swal2-select">
            <option value="Alta" ${task.priority === 'Alta' ? 'selected' : ''}>Alta</option>
            <option value="Media" ${task.priority === 'Media' ? 'selected' : ''}>Media</option>
            <option value="Baja" ${task.priority === 'Baja' ? 'selected' : ''}>Baja</option>
          </select>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Actualizar',
        preConfirm: () => {
          const title = document.getElementById('swal-title').value
          const description = document.getElementById('swal-description').value
          const dueDate = document.getElementById('swal-dueDate').value
          const priority = document.getElementById('swal-priority').value
          if (!title || !description || !dueDate || !priority) {
            Swal.showValidationMessage('Por favor completa todos los campos')
            return
          }
          return { title, description, dueDate, priority }
        }
      })

      if (formValues) {
        try {
          await updateTask(task.id, {
            title: formValues.title,
            description: formValues.description,
            dueDate: new Date(formValues.dueDate).toISOString(),
            priority: formValues.priority
          })
          Swal.fire('Éxito', 'Tarea actualizada', 'success')
          fetchTasks()
        } catch (error) {
          Swal.fire('Error', 'No se pudo actualizar la tarea', 'error')
        }
      }
    }

    const handleDeleteTask = async (id) => {
      const confirmation = await Swal.fire({
        title: '¿Eliminar tarea?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      })

      if (confirmation.isConfirmed) {
        try {
          await deleteTask(id)
          fetchTasks()
        } catch (error) {
          Swal.fire('Error', 'No se pudo eliminar la tarea', 'error')
        }
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', { timeZone: 'UTC' })
    }

    const handleLogout = () => {
      localStorage.removeItem('auth')
      isLoggedIn.value = false
      router.push('/login') // <- Aquí te mando directo al login
    }

    onMounted(() => {
      const auth = localStorage.getItem('auth')
      if (auth === 'true') {
        isLoggedIn.value = true
      }
      fetchTasks()
    })

    return {
      isLoggedIn,
      tasks,
      newTask,
      handleCreateTask,
      handleUpdateStatus,
      handleEditTask,
      handleDeleteTask,
      handleLogout,
      formatDate
    }
  }
}
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(to right, #ff416c, #ff4b2b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
}

.about-container {
  background-size: cover;
  background-position: center;
}

.card {
  background-color: rgba(255, 255, 255, 0.95);
  border: none;
}

.list-group-item {
  background: #ffffff;
  border: 1px solid #ccc;
  border-radius: 12px;
}

.btn-primary {
  background-color: #ff4b2b;
  border: none;
}

.btn-primary:hover {
  background-color: #ff416c;
}

.btn-warning {
  background-color: #ffc107;
  border: none;
}

.btn-info {
  background-color: #0dcaf0;
  border: none;
}

.btn-danger {
  background-color: #dc3545;
  border: none;
}

.btn:hover {
  opacity: 0.9;
}
</style>
