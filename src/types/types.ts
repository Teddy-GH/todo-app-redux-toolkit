
export const TaskStatus = {
  Todo: "TODO",
  InProgress: "IN_PROGRESS",
  Done: "DONE",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];


export const mapBackendStatus = (value: number): TaskStatus => {
  switch (value) {
    case 0:
      return TaskStatus.Todo;
    case 1:
      return TaskStatus.InProgress;
    case 2:
      return TaskStatus.Done;
    default:
      throw new Error(`Unknown status value: ${value}`);
  }
};

export const TaskPriority = {
  Low: 0,
  Medium: 1,
  High: 2,
} as const;

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];

// Domain models
export type ID = string;

export interface Task {
  id: ID;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: ID;
  assigneeName?: string;
  createdBy?: ID;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: ID;
  updatorId?: ID;
}

export interface User {
  id: ID;
  username?: string;
  email: string;
  fullName?: string;
  role?: string;
  createdAt?: string;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface RegisterPayload extends Credentials {
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}