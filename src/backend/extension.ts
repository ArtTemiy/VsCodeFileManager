import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { DirContentDescription, ServerMessage } from "../types/ServerMessage";
import { ElementInfo, ElementType } from "../types/ElementInfo";
import * as os from 'os';
import { ClientGoToDirMessage, ClientInitDirMessage, ClientMessage, ClientOpenFileMessage } from "../types/ClientMessage";
import { InstanceState } from "./types/instanceState";
import { instanceStateStorage } from "./extentionInstanceState";
import { LVL_UP_DIR } from "../constants";
import { Server } from "../vscode-api/server/server";
import { uris } from "../constants";

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
				// Create webview
				const manager = vscode.window.createWebviewPanel(
					'fileManagerWindow',
					'File Manager',
					vscode.ViewColumn.One,
					{
						enableScripts: true,
					}
				);

				// Fill instance storage
				const server = new Server(manager, context);
				instanceStateStorage.set(manager, {
					server: server,
					currentDirectory: vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : os.homedir(),
				});

				// Initialize methods of webview
				manager.onDidDispose(() => {
					instanceStateStorage.delete(manager);
				}, null, context.subscriptions);

				// Helper functions
				const getUpdateCurrentDirectoryMessage = () => {
					const state = instanceStateStorage.get(manager);
					return {
						currentDir: state.currentDirectory,
						elementsList: getElementsList(state.currentDirectory),
						prevDir: state.prevDir,
					};
				};

				// Initialize server handlers
				server.addHandler(uris.goToDir, "POST", (data: ClientGoToDirMessage) => {
					instanceStateStorage.set(manager, {
						...instanceStateStorage.get(manager),
						currentDirectory: fs.realpathSync(path.join(data.currentDir, data.dirName)),
						prevDir: data.dirName === LVL_UP_DIR ? path.basename(instanceStateStorage.get(manager).currentDirectory) : undefined,
					});
					return getUpdateCurrentDirectoryMessage();
				});
				server.addHandler(uris.getDirInfo, "GET", (data: ClientGoToDirMessage) => {
					if (data.dirName === LVL_UP_DIR) {
						return [];
					}
					const destPath = fs.realpathSync(path.join(data.currentDir, data.dirName));
					const response: DirContentDescription = {
						currentDir: destPath,
						elementsList: getElementType(destPath) === "Directory" ? getElementsList(destPath) : [],
						// elementsList: getElementsList(destPath),
					};
					return response;
				});
				server.addHandler(uris.initDir, "GET", (data: ClientInitDirMessage) => {
					return getUpdateCurrentDirectoryMessage();
				});
				server.addHandler(uris.openFile, "POST", (data: ClientOpenFileMessage) => {	
					const filePath = path.join(data.currentDir, data.fileName);
					vscode.window.showTextDocument(vscode.Uri.file(filePath));
					instanceStateStorage.get(manager).prevDir = data.fileName;
				});
				
				// Load html content
				const indexJsPath = manager.webview.asWebviewUri(
					vscode.Uri.joinPath(extensionUri, 'out', 'index.js')
				);
				const indexCssPath = manager.webview.asWebviewUri(
					vscode.Uri.joinPath(extensionUri, 'css', 'index.css')
				);
				const htmlContent = getWebViewContent(indexJsPath, indexCssPath);
				manager.webview.html = htmlContent;
				console.log("View Created");
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
			<div class="content" id="root"></div>

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

function getElementsList(pathToDir: string) {
	return ((pathToDir === "/" ? [] : ['..']).concat(fs.readdirSync(pathToDir))).map((elementName, index): ElementInfo => ({
		name: elementName,
		type: getElementType(path.join(pathToDir, elementName)),
	}));
}
