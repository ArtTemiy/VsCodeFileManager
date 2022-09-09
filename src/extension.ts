import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { ServerMessage } from "./types/ServerMessage";
import { ElementInfo, ElementType } from "./types/ElementInfo";
import * as os from 'os';
import { ClientGoToDirMessage, ClientMessage, ClientOpenFileMessage } from "./types/ClientMessage";
import { instanceStateStorage } from "./types/extentionInstanceState";

export function activate(context: vscode.ExtensionContext) {
	const extensionUri = context.extensionUri;

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'FileManager.hello',
			async () => {
				vscode.window.showInformationMessage('Hello world!');
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'FileManager.openFileManager',
			() => {
				const manager = vscode.window.createWebviewPanel(
					'fileManagerWindow',
					'File Manager',
					vscode.ViewColumn.One,
					{
						enableScripts: true,
					}
				);
				instanceStateStorage.set(manager, {
					currentDirectory: vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : os.homedir(),
				});

				manager.onDidDispose(() => {
					console.log('disposed called');
					
				}, null, context.subscriptions);

				const indexJsPath = manager.webview.asWebviewUri(
					vscode.Uri.joinPath(extensionUri, 'out', 'index.js')
				);
				const indexCssPath = manager.webview.asWebviewUri(
					vscode.Uri.joinPath(extensionUri, 'css', 'index.css')
				);
				const htmlContent = getWebViewContent(indexJsPath, indexCssPath);
				manager.webview.html = htmlContent;

				console.log("View created");

				const sendUpdateCurrentDirectoryMessage = () => {
					const message = createServerUpdateDirectoryMessage(instanceStateStorage.get(manager).currentDirectory);
					manager.webview.postMessage(message);
				};

				manager.webview.onDidReceiveMessage(
					message => {
						console.log("Extension received message", message);
						
						const data = message as ClientMessage;
						switch (data.type) {
							case "GoToDir":
								(() => {
									const payload = data.payload as ClientGoToDirMessage;
									instanceStateStorage.set(manager, {
										...instanceStateStorage.get(manager),
										currentDirectory: fs.realpathSync(path.join(payload.currentDir, payload.dirName)),
									});
									sendUpdateCurrentDirectoryMessage();
								})();
								break;
							case "InitDir":
								(() => {
									sendUpdateCurrentDirectoryMessage();
								})();
								break;
							case "OpenFile":
								(() => {
									const payload = data.payload as ClientOpenFileMessage;
									const filePath = path.join(payload.currentDir, payload.fileName);
									vscode.window.showTextDocument(vscode.Uri.file(filePath));
								})();
								break;
							default:
								vscode.window.showErrorMessage(`Unknown message type: ${data.type}`);
								break;
						}
					},
					undefined,
					context.subscriptions
				);
			}
		)
	);
}

export function deactivate() {}

function getWebViewContent(indexJsPath: vscode.Uri, indexCssPath: vscode.Uri) {
	return `
	<html>
		<head>
			<title>File Manager</title>
			<link rel="stylesheet" href="${indexCssPath}">
		</head>
		<body>
			<div id="root"></div>

			<script type="module" src="${indexJsPath}"></script>
		</body>
	</html>`;
}

function getElementType(pathToElemetn: string): ElementType {
	const stats = fs.lstatSync(pathToElemetn);
	if (stats.isDirectory()) {
		return "Directory";
	}
	if (stats.isFile()) {
		return "File";
	}
	if (stats.isSymbolicLink()) {
		return "Symlink";
	}
	console.warn(`Unknown type of element ${pathToElemetn}`);
	
	return "Unknown";
}

function makeElementsList(pathToDir: string) {
	return ((pathToDir === "/" ? [] : ['..']).concat(fs.readdirSync(pathToDir))).map((elementName, index): ElementInfo => ({
		name: elementName,
		type: getElementType(path.join(pathToDir, elementName)),
	}));
}

function createServerUpdateDirectoryMessage(pathToDir: string): ServerMessage {
	return {
		messageType: "UpdateCurrentDir",
		payloadType: "DirContentDescription",
		payload: {
			currentDir: pathToDir,
			elementsList: makeElementsList(pathToDir),
		}
	};
};