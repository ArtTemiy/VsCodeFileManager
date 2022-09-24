interface VsCode {
    postMessage(message: any): void;
}
declare function acquireVsCodeApi(): VsCode;
export const vscode = acquireVsCodeApi();
