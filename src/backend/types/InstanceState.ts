import { Server } from "../../vscode-api/server/server";

export interface InstanceState {
    server: Server;
    currentDirectory: string;
    prevDir?: string;
};
