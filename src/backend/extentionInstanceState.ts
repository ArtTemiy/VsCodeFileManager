import * as vscode from "vscode";
import { InstanceState } from "./types/instanceState";

export const instanceStateStorage = new Map<vscode.WebviewPanel, InstanceState>();