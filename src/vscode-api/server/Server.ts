import * as vscode from 'vscode';
import { Method } from '../common/method';
import { Request } from '../common/Request';
import { Response } from '../common/Response';

export class Server {
    handlers: Map<string, (payload: any) => any> = new Map<string, (payload: any) => any>();

    constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
        panel.webview.onDidReceiveMessage(
            message => {
                panel.webview.postMessage(
                    this.processEequest(
                        message as Request
                    )
                );
            },
            undefined,
            context.subscriptions
        );
    }

    processEequest(request: Request) : Response {
        const handler = this.handlers.get(request.handle);
        if (handler === undefined) {
            console.error(`unknown handler ${request.handle}`, request, this.handlers);
            return {
                id: request.id,
                payload: undefined
            };
        }
        return {
            id: request.id,
            payload: handler(request.payload),
        };
    }

    addHandler(handler: string, method: Method, callback: (data: any) => any) {
        this.handlers.set(handler, callback);
    }
};
