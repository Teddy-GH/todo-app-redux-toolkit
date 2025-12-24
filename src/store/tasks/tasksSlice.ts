import { createAsyncThunk,createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api/axios";
import { type Task, type TaskStatus, type TaskPriority, mapBackendStatus, type User } from "../../types/types";


export interface TasksState {
    items: Task[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    modalOpen: boolean;
    editing: Task | null;
}

const initialState: TasksState = {
  items: [],
  status: "idle",
  error: null,
  modalOpen: false,
  editing: null,
}


const taskResponse = (raw: any) => ({
    ...raw,
    status: mapBackendStatus(raw.status),
    priority: raw.priority as TaskPriority,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : undefined,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : undefined,

});


const requestTaskPayload  = (task: Partial<Task>) => ({
    title: task.title,
    description: task.description,
    status: task.status === "TODO" 
        ? 0
        : task.status === "IN_PROGRESS"
            ? 1
            : task.status === "DONE"
                ? 2
            : undefined,
    priority: task.priority,
    UpdatedBy: task.updatedBy,
    CreatedBy: task.createdBy,
})

export const getTasks = createAsyncThunk<Task[], {status?: TaskStatus; assignee?: string}>('tasks/fetchAll',  
    async (filters, {rejectWithValue}) => {
        try {
            const params: Record<string, any> = {};

            if (filters?.status) params.status = filters.status;
            if (filters?.assignee) params.assignee = filters.assignee;

            const response = await api.get('/tasks', {params});
            return response.data.map(taskResponse);
        } catch (err: any) {

       return rejectWithValue(err.message || "Failed to fetch tasks");
  }
}

);


export const createTask = createAsyncThunk<Task, Partial<Task>>(
    'tasks/create',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.post<Task>('/tasks', requestTaskPayload(payload));
            return taskResponse(data);
        } catch (error: any) {
            return rejectWithValue(error.response.message.data ||"Failed to create task");
        }
    }


);

export const updateTask = createAsyncThunk<
  Task,
  { id: string; task: Task, user: User }
>("tasks/update", async ({ id, task, user }, { rejectWithValue }) => {

 

  try {

    const payload = {
      ...task,
      status:
        task.status === "TODO"
          ? 0
          : task.status === "IN_PROGRESS"
          ? 1
          : 2,
      UpdatedBy: task.updatorId,
       CreatedBy: task.createdBy,
      updatorId: user.id,
    };

    const { data } = await api.put(`/tasks/${id}`, payload);

    return {
      ...data,
      status: data.status === 0 ? "TODO" : data.status === 1 ? "IN_PROGRESS" : "DONE",
      priority: data.priority as TaskPriority,
      createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt).toISOString() : undefined,
    };
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to update task");
  }
});


export const deleteTask = createAsyncThunk<string, string>(
  "tasks/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to delete task");
    }
  }
);


const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    openModal(state, action: PayloadAction<Task | null>) {
      state.modalOpen = true;
      state.editing = action.payload;
    },
    closeModal(state) {
      state.modalOpen = false;
      state.editing = null;
    },
    taskCreatedRealtime(state, action: PayloadAction<Task>) {
      const exists = state.items.find((t) => t.id === action.payload.id);
      if (!exists) state.items.unshift(action.payload);
    },
    taskUpdatedRealtime(state, action: PayloadAction<Task>) {
      const idx = state.items.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    taskDeletedRealtime(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
  },
});

export const {
  openModal,
  closeModal,
  taskCreatedRealtime,
  taskUpdatedRealtime,
  taskDeletedRealtime,
} = tasksSlice.actions;
export default tasksSlice.reducer;

