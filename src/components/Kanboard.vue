<template>
  <div class="kanban-container p-4">
    <h1 class="text-center text-gradient mb-4">Tablero de Tareas Kanban</h1>

    <div class="kanban-board d-flex justify-content-center gap-4 flex-wrap">
      
      <!-- Pendiente -->
      <div class="kanban-column">
        <h3 class="column-title bg-warning text-dark p-2 rounded">Pendiente</h3>
        <draggable v-model="pendingTasks" group="tasks" item-key="id" @end="updateStatus" :move="checkMove">
          <template #item="{ element }">
            <div class="kanban-card p-3 mb-3" :class="{ 'blocked': !isOwner(element) }">
              <div>
                <strong>{{ element.title }}</strong><br />
                <small>{{ element.description }}</small><br />
                <small><i>Creado por: {{ element.userName || 'Desconocido' }}</i></small><br />
                <small><strong>Prioridad:</strong> 
                  <span :class="priorityColor(element.priority)">
                    {{ element.priority }}
                  </span>
                </small>
              </div>
              <div class="mt-2 d-flex gap-2">
                <button class="btn btn-sm btn-warning" @click="handleUpdateStatus(element)">Estado</button>
                <button class="btn btn-sm btn-info" @click="handleEditTask(element)">Editar</button>
                <button class="btn btn-sm btn-danger" @click="handleDeleteTask(element)">Eliminar</button>
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <!-- En Progreso -->
      <div class="kanban-column">
        <h3 class="column-title bg-info text-dark p-2 rounded">En Progreso</h3>
        <draggable v-model="inProgressTasks" group="tasks" item-key="id" @end="updateStatus" :move="checkMove">
          <template #item="{ element }">
            <div class="kanban-card p-3 mb-3" :class="{ 'blocked': !isOwner(element) }">
              <div>
                <strong>{{ element.title }}</strong><br />
                <small>{{ element.description }}</small><br />
                <small><i>Creado por: {{ element.userName || 'Desconocido' }}</i></small><br />
                <small><strong>Prioridad:</strong> 
                  <span :class="priorityColor(element.priority)">
                    {{ element.priority }}
                  </span>
                </small>
              </div>
              <div class="mt-2 d-flex gap-2">
                <button class="btn btn-sm btn-warning" @click="handleUpdateStatus(element)">Estado</button>
                <button class="btn btn-sm btn-info" @click="handleEditTask(element)">Editar</button>
                <button class="btn btn-sm btn-danger" @click="handleDeleteTask(element)">Eliminar</button>
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <!-- Finalizado -->
      <div class="kanban-column">
        <h3 class="column-title bg-success text-white p-2 rounded">Finalizado</h3>
        <draggable v-model="doneTasks" group="tasks" item-key="id" @end="updateStatus" :move="checkMove">
          <template #item="{ element }">
            <div class="kanban-card p-3 mb-3" :class="{ 'blocked': !isOwner(element) }">
              <div>
                <strong>{{ element.title }}</strong><br />
                <small>{{ element.description }}</small><br />
                <small><i>Creado por: {{ element.userName || 'Desconocido' }}</i></small><br />
                <small><strong>Prioridad:</strong> 
                  <span :class="priorityColor(element.priority)">
                    {{ element.priority }}
                  </span>
                </small>
              </div>
              <div class="mt-2 d-flex gap-2">
                <button class="btn btn-sm btn-warning" @click="handleUpdateStatus(element)">Estado</button>
                <button class="btn btn-sm btn-info" @click="handleEditTask(element)">Editar</button>
                <button class="btn btn-sm btn-danger" @click="handleDeleteTask(element)">Eliminar</button>
              </div>
            </div>
          </template>
        </draggable>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import draggable from 'vuedraggable'
import { useRouter } from 'vue-router'
import { loadTasks, updateTask, deleteTask } from '../firebase/tareasService'
import Swal from 'sweetalert2'

export default {
  components: { draggable },
  name: 'Kanboard',
  setup() {
    const router = useRouter()
    const tasks = ref([])
    const currentUserId = ref('')

    const fetchTasks = async () => {
      tasks.value = await loadTasks()
    }

    const pendingTasks = computed(() => tasks.value.filter(task => task.status === 'Pendiente'))
    const inProgressTasks = computed(() => tasks.value.filter(task => task.status === 'En Progreso'))
    const doneTasks = computed(() => tasks.value.filter(task => task.status === 'Completada' || task.status === 'Finalizado'))

    const isOwner = (task) => {
      if (!currentUserId.value) return false
      return task.userId === currentUserId.value
    }

    const priorityColor = (priority) => {
      if (priority === 'Alta') return 'text-danger'
      if (priority === 'Media') return 'text-warning'
      if (priority === 'Baja') return 'text-success'
      return ''
    }

    const checkMove = (event) => {
      const draggedTask = event.draggedContext.element
      if (!isOwner(draggedTask)) {
        Swal.fire('¡Acceso Denegado!', 'No puedes mover tareas que no creaste.', 'warning')
        return false
      }
      return true
    }

    const updateStatus = async (event) => {
      const item = event.item?.__draggable_context?.element
      const newColumnTitle = event.to.closest('.kanban-column').querySelector('h3').textContent.trim()

      let newStatus = ''
      if (newColumnTitle === 'Pendiente') newStatus = 'Pendiente'
      else if (newColumnTitle === 'En Progreso') newStatus = 'En Progreso'
      else if (newColumnTitle === 'Finalizado') newStatus = 'Completada'

      if (item && item.status !== newStatus) {
        await updateTask(item.id, { status: newStatus })
        fetchTasks()
      }
    }

    const handleUpdateStatus = async (task) => {
      if (!isOwner(task)) {
        return Swal.fire('Acceso Denegado', 'No puedes cambiar el estado.', 'warning')
      }

      let newStatus = ''
      if (task.status === 'Pendiente') {
        newStatus = 'En Progreso'
      } else if (task.status === 'En Progreso') {
        newStatus = 'Completada'
      } else if (task.status === 'Completada') {
        newStatus = 'Pendiente'
      }

      await updateTask(task.id, { status: newStatus })
      fetchTasks()
    }

    const handleEditTask = async (task) => {
      if (!isOwner(task)) {
        return Swal.fire('Acceso Denegado', 'No puedes editar esta tarea.', 'warning')
      }
      
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
            Swal.showValidationMessage('Completa todos los campos')
            return
          }

          return { title, description, dueDate, priority }
        }
      })

      if (formValues) {
        await updateTask(task.id, {
          title: formValues.title,
          description: formValues.description,
          dueDate: new Date(formValues.dueDate).toISOString(),
          priority: formValues.priority
        })
        fetchTasks()
      }
    }

    const handleDeleteTask = async (task) => {
      if (!isOwner(task)) {
        return Swal.fire('Acceso Denegado', 'No puedes eliminar esta tarea.', 'warning')
      }

      const confirmation = await Swal.fire({
        title: '¿Eliminar tarea?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      })

      if (confirmation.isConfirmed) {
        await deleteTask(task.id)
        fetchTasks()
      }
    }

    onMounted(() => {
      const auth = getAuth()
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          currentUserId.value = user.uid
          await fetchTasks()
        } else {
          router.push('/login')
        }
      })
    })

    return {
      pendingTasks,
      inProgressTasks,
      doneTasks,
      updateStatus,
      handleEditTask,
      handleDeleteTask,
      handleUpdateStatus,
      checkMove,
      isOwner,
      priorityColor
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

.kanban-container {
  min-height: 100vh;
}

.kanban-board {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.kanban-column {
  background: white;
  padding: 1rem;
  width: 300px;
  min-height: 500px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.kanban-card {
  background: #f8f9fa;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: grab;
}

.kanban-card.blocked {
  background: #ececec;
  cursor: not-allowed;
  opacity: 0.6;
}

.kanban-card:active {
  cursor: grabbing;
}

.text-danger {
  color: #dc3545;
}
.text-warning {
  color: #ffc107;
}
.text-success {
  color: #28a745;
}
</style>
