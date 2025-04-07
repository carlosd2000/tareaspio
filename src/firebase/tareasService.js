import { db } from './config'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore'

const tareasCollection = collection(db, 'tareas')

export const loadTasks = async () => {
  const snapshot = await getDocs(tareasCollection)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const createTask = async (task) => {
  return await addDoc(tareasCollection, task)
}

export const updateTask = async (taskId, updatedData) => {
  const taskDoc = doc(db, 'tareas', taskId)
  return await updateDoc(taskDoc, updatedData)
}

export const deleteTask = async (taskId) => {
  const taskDoc = doc(db, 'tareas', taskId)
  return await deleteDoc(taskDoc)
}
