import * as vscode from "vscode";

export interface InstanceState {
    currentDirectory: string;
};

export const instanceStateStorage = new Map<vscode.WebviewPanel, InstanceState>();