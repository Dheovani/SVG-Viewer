import * as vscode from 'vscode';

let panel: vscode.WebviewPanel | undefined;
let statusBarItem: vscode.StatusBarItem | undefined;

const bodyStyle = `
	background-color: white;
	background-image: 
		linear-gradient(45deg, lightgray 25%, transparent 25%, transparent 75%, lightgray 75%, lightgray),
		linear-gradient(45deg, lightgray 25%, transparent 25%, transparent 75%, lightgray 75%, lightgray);
	background-size: 20px 20px;
	background-position:0 0, 10px 10px;
`;

const divStyle = `
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
`;

const imgStyle = `
	width: 90%;
	height: 90%;
	object-fit: contain;
`;

/**
 * Checks if file is and SVG
 * @param fileName: string
 * @returns: boolean
 */
function isSVGFile(fileName: string): boolean {
	const fileExtension = fileName.split('.').pop()?.toLowerCase();
	return fileExtension === 'svg';
}

/**
 * Generates the webview content
 * @param fileName: string
 */
function updateWebviewContent(fileName: string): void {
    if (panel) {
        const fileUri = vscode.Uri.file(fileName);
        const fileWebviewUri = panel.webview.asWebviewUri(fileUri);

        panel.webview.html = `
            <html>
                <head>
                    <title>SVG-Viewer</title>
                </head>
                <body style="${bodyStyle}">
					<div style="${divStyle}">
						<img src="${fileWebviewUri}" alt="SVG" style="${imgStyle}">
					</div>
                </body>
            </html>
        `;
    }
}

/**
 * Opens the SVG file viewer
 * @param fileName: string
 */
async function openViewer(fileName: string): Promise<void> {
	panel?.reveal(vscode.ViewColumn.One);

	if (!panel) {
		panel = vscode.window.createWebviewPanel(
			'SVG-Viewer',
			'SVG-Viewer',
			vscode.ViewColumn.One,
			{ enableScripts: true }
		);

		// Delete panel on dispose
		panel.onDidDispose(() => panel = undefined);
	}

	updateWebviewContent(fileName);
}

export function activate(context: vscode.ExtensionContext): void {
	// Customize statusbar
	statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		10000
	);

	statusBarItem.text = "SVG-Viewer";
	statusBarItem.tooltip = "Looking for SVG files";
	statusBarItem.command = "extension.openExtensionPage";
	statusBarItem.show();

	// Open extension's page on click over statusbar item
	const openExtensionPageCommand = vscode.commands.registerCommand('extension.openExtensionPage', () => {
		const extensionPageUrl = `vscode:extension/Dheovani.svg-viewer`;
		vscode.env.openExternal(vscode.Uri.parse(extensionPageUrl));
	});

	// Open preview with command 'ctrl+shift+t' when text editor is open in an svg file
	const openPreviewOnFocusCommand = vscode.commands.registerCommand('extension.openPreviewOnFocus', () => {
		const activeTextEditor = vscode.window.activeTextEditor;

		if (activeTextEditor) {
			openViewer(activeTextEditor.document.fileName);
		} else {
			vscode.window.showInformationMessage("There's no open textfile.");
		}
	});

	// Open preview with mouse's right button
	const openPreviewMenuCommand = vscode.commands.registerCommand('extension.openPreviewMenu', (resource) => {
		if (resource)
			openViewer(resource.fsPath);
	});

	// Create tab rendering svg on click in svg file
	const openTextDocDisposable = vscode.workspace.onDidOpenTextDocument(async (document) => {
		const fileName: string = document.fileName;

		if (isSVGFile(fileName)) {
			const selectedOption = !panel
				? await vscode.window.showInformationMessage("Open preview?", "Yes", "No")
				: "Yes";
			
			if (selectedOption !== "Yes")
				return;
			
			openViewer(fileName);
		}
	});

	context.subscriptions.push(statusBarItem);
	context.subscriptions.push(openExtensionPageCommand);
	context.subscriptions.push(openPreviewOnFocusCommand);
	context.subscriptions.push(openPreviewMenuCommand);
	context.subscriptions.push(openTextDocDisposable);
}

export function deactivate(): void {
	panel?.dispose();
	statusBarItem?.dispose();
}

module.exports = {
    activate,
	deactivate
};
