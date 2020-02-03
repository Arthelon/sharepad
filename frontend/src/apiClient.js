import axios from "axios";

const httpClient = axios.create({
    baseURL: process.env.REACT_APP_API_HOST + "/api"
});

export const getProgram = id => httpClient.get("/program/" + id);
export const createProgram = () => httpClient.post("/program");
