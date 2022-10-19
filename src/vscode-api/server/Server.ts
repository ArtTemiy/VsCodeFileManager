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
        console.log('Request:', request);
        
        const handler = this.handlers.get(request.handle);
        if (handler === undefined) {
            console.error(`unknown handler ${request.handle}`, request, this.handlers);
            return {
                id: request.id,
                payload: undefined
            };
        }
        const respone = handler(request.payload);
        console.log('Response:', respone);
        
        return {
            id: request.id,
            payload: respone,
        };
    }

    addHandler(handler: string, method: Method, callback: (data: any) => any) {
        this.handlers.set(handler, callback);
    }
};
