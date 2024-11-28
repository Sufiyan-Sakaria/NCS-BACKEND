import { Request } from "express";

// Define a custom type for the user object
export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

// Extend the Express Request interface
export interface CustomRequest extends Request {
  user?: User;
}
