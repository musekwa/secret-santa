import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // send the cookie with the request
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

export const apiRoutes = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
    signOut: "/auth/sign-out",
  },
  groups: {
    findMany: "/groups",
    findById: "/groups/:id",
    create: "/groups",
  },
  participants: {
    findMany: "/participants",
    findById: "/participants/:id",
    create: "/participants",
  },
  users: {
    findMany: "/users",
    findById: "/users/:id",
    create: "/users",
  },
};
