<template>
  <div class="about-container min-vh-100 d-flex flex-column justify-content-center align-items-center p-4"
       style="background: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%);">

    <div class="card p-5 shadow-lg rounded-4 text-center mb-5" style="max-width: 800px; width: 100%;">
      
      <div class="text-end mb-3">
        <button class="btn btn-danger fw-bold" @click="handleLogout">Cerrar Sesión</button>
      </div>

      <h1 class="text-gradient mb-4">Gestión de Tareas</h1>
      <p class="mb-4">Bienvenido, {{ currentUserName }}</p>

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

    <div style="width: 100%;">
      <Kanboard ref="kanbanBoard" />
    </div>

  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '../firebase/auth'
import { createTask } from '../firebase/tareasService'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
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
    const kanbanBoard = ref(null)

    const handleCreateTask = async () => {
      try {
        await createTask({
          ...newTask.value,
          dueDate: new Date(newTask.value.dueDate).toISOString(),
          userId: currentUserId.value,
          userName: currentUserName.value
        })
        Swal.fire('¡Éxito!', 'Tarea creada correctamente', 'success')

        if (kanbanBoard.value && kanbanBoard.value.reloadTasks) {
          kanbanBoard.value.reloadTasks()
        }

        newTask.value = { title: '', description: '', dueDate: '', priority: 'Alta', status: 'Pendiente' }
      } catch (error) {
        Swal.fire('Error', 'No se pudo crear la tarea', 'error')
      }
    }

    const handleLogout = async () => {
      await AuthService.logout()
      router.push('/login')
    }

    onMounted(() => {
      const auth = getAuth()
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          currentUserId.value = user.uid
          const profile = await AuthService.getUserProfile(user.uid)
          if (profile) {
            currentUserName.value = profile.nombre
          }
        } else {
          router.push('/login')
        }
      })
    })

    return { newTask, handleCreateTask, handleLogout, currentUserId, currentUserName, kanbanBoard }
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

input.form-control {
  height: 50px;
  font-size: 1.1rem;
  border-radius: 12px;
  border: 2px solid #000;
  background-color: white;
}

input.form-control:focus {
  box-shadow: 0 0 0 0.25rem rgba(255, 215, 0, 0.25);
  border-color: #000;
}

textarea.form-control {
  font-size: 1.1rem;
  border-radius: 12px;
  border: 2px solid #000;
  background-color: white;
}

select.form-control {
  font-size: 1.1rem;
  border-radius: 12px;
  border: 2px solid #000;
  background-color: white;
}

.btn-primary {
  background-color: #ff4b2b;
  border: none;
}

.btn-primary:hover {
  background-color: #ff416c;
}

.btn-danger {
  background-color: #dc3545;
  border: none;
}

.btn-danger:hover {
  background-color: #bb2d3b;
}
</style>
