import * as vscode from 'vscode';

let panel: vscode.WebviewPanel | undefined;
let statusBarItem: vscode.StatusBarItem | undefined;

function isSVGFile(fileName: string): boolean {
	const fileExtension = fileName.split('.').pop()?.toLowerCase();
	return fileExtension === 'svg';
}

function updateWebviewContent(fileName: string): void {
    if (panel) {
        const fileUri = vscode.Uri.file(fileName);
        const fileWebviewUri = panel.webview.asWebviewUri(fileUri);

        panel.webview.html = `
            <html>
                <head>
                    <title>SVG-Viewer</title>
                </head>
                <body>
					<img src="${fileWebviewUri}" alt="SVG" width="500" height="500">
                </body>
            </html>
        `;
    }
}

export function activate(context: vscode.ExtensionContext) {

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

	// Create tab rendering svg on click in svg file
	const openTextDocDisposable = vscode.workspace.onDidOpenTextDocument(document => {
		const fileName: string = document.fileName;

		if (isSVGFile(fileName)) {
			panel?.reveal(vscode.ViewColumn.One);

			if (!panel) {
				panel = vscode.window.createWebviewPanel(
					'SVG-Viewer',
					'SVG-Viewer',
					vscode.ViewColumn.One,
					{ enableScripts: true }
				);

				// Delete panel on dispose so it will be created again when another SVG file is opened
				panel.onDidDispose(() => panel = undefined);
			}

			updateWebviewContent(fileName);
		}
	});

	context.subscriptions.push(statusBarItem);
	context.subscriptions.push(openExtensionPageCommand);
	context.subscriptions.push(openTextDocDisposable);
	
}

export function deactivate() {
	panel?.dispose();
	statusBarItem?.dispose();
}

module.exports = {
    activate,
	deactivate
};
