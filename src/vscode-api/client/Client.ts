import { vscode } from "../../ToolsContext";
import { Method } from "../common/method";
import { Request } from "../common/Request";
import { Response } from "../common/Response";

class Client {
    requests: Map<number, (any) => void> = new Map<number, (any) => void>();
    requestId: number = 10;

    constructor() {
        window.addEventListener("message", event => {
            const response = event.data as Response;
            const callback = this.requests.get(response.id);
            this.requests.delete(response.id);
            callback && callback(response.payload);
        });
    }

    sendRequest(handle: string, method: Method, payload: any, callback: (any) => void) {
        const id = this.requestId;
        this.requests.set(id, callback);
        const request: Request = {
            handle: handle,
            method: method,
            id: id,
            payload: payload,
        };
        vscode.postMessage(request);
    };
};

export const vscodeClient = new Client();