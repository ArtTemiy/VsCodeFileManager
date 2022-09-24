import { Method } from "./Method";

export interface Request {
    handle: string;
    method: Method;
    id: number;
    payload: any;
};
