import * as vscode from 'vscode';

let panel: vscode.WebviewPanel | undefined;

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
	const statusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		10000
	);

	statusBarItem.text = "SVG-Viewer";
	statusBarItem.tooltip = "Looking for SVG files";
	statusBarItem.show();

	// Create tab rendering svg on click in svg file
	const openTextDocDisposable = vscode.workspace.onDidOpenTextDocument(document => {
		const fileName: string = document.fileName;

		if (isSVGFile(fileName)) {
			if (!panel) {
				panel = vscode.window.createWebviewPanel(
					'SVG-Viewer',
					'SVG-Viewer',
					vscode.ViewColumn.One,
					{ enableScripts: true }
				);

				// Delete panel on dispose so it will be created again when another SVG file is opened
				panel.onDidDispose(() => panel = undefined);
			} else {
				panel.reveal(vscode.ViewColumn.One);
			}

			updateWebviewContent(fileName);
		}
	});

	context.subscriptions.push(statusBarItem);
	context.subscriptions.push(openTextDocDisposable);
}

export function deactivate() {}

module.exports = {
    activate
};
