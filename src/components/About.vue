<template>
  <div class="about-container min-vh-100 d-flex flex-column justify-content-center align-items-center p-4"
       style="background: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%);">

    <!-- FORMULARIO -->
    <div class="card p-5 shadow-lg rounded-4 text-center mb-5" style="max-width: 800px; width: 100%;">
      
      <!-- Botón de cerrar sesión -->
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

    </div>

    <!-- Kanban FUERA del formulario -->
    <div style="width: 100%;">
      <Kanboard id="kanban" />
    </div>

  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createTask } from '../firebase/tareasService'
import Swal from 'sweetalert2'
import Kanboard from './Kanboard.vue'

export default {
  name: 'About',
  components: { Kanboard },
  setup() {
    const router = useRouter()
    const newTask = ref({
      title: '',
      description: '',
      dueDate: '',
      priority: 'Alta',
      status: 'Pendiente'
    })
    const currentUserId = ref('')
    const currentUserName = ref('')

    const handleCreateTask = async () => {
      try {
        await createTask({
          ...newTask.value,
          dueDate: new Date(newTask.value.dueDate).toISOString(),
          userId: currentUserId.value,
          userName: currentUserName.value
        })
        Swal.fire('¡Éxito!', 'Tarea creada correctamente', 'success')

        // 🔥 Actualizar el Kanban
        const kanban = document.getElementById('kanban')
        if (kanban) {
          kanban.dispatchEvent(new CustomEvent('reload-tasks'))
        }

        newTask.value = { title: '', description: '', dueDate: '', priority: 'Alta', status: 'Pendiente' }
      } catch (error) {
        Swal.fire('Error', 'No se pudo crear la tarea', 'error')
      }
    }

    const handleLogout = () => {
      localStorage.clear()
      router.push('/login')
    }

    onMounted(() => {
      const auth = localStorage.getItem('auth')
      if (auth === 'true') {
        currentUserId.value = localStorage.getItem('userId')
        currentUserName.value = localStorage.getItem('userName')
      } else {
        router.push('/login')
      }
    })

    return { newTask, handleCreateTask, handleLogout }
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
</style>
