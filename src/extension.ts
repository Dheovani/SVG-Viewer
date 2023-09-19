import * as vscode from 'vscode';

function isSVGFile(fileName: string): boolean {
	const fileExtension = fileName.split('.').pop()?.toLowerCase();
	return fileExtension === 'svg';
}

export function activate(context: vscode.ExtensionContext) {
	// Customize statusbar
	const statusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		10000
	);

	statusBarItem.text = "SVG Visualizer";
	statusBarItem.tooltip = "Looking for SVG files";
	statusBarItem.show();

	// Create tab rendering svg on click in svg file
	const disposable = vscode.workspace.onDidOpenTextDocument(document => {
		const fileName: string = document.fileName;

		if (isSVGFile(fileName)) {
			const panel: vscode.WebviewPanel = vscode.window.createWebviewPanel(
				'SVG Visualizer',
				'SVG Visualizer',
				vscode.ViewColumn.One,
				{ enableScripts: true }
			);

			const fileUri = vscode.Uri.file(fileName);
            const fileWebviewUri = panel.webview.asWebviewUri(fileUri);

			panel.webview.html = `
				<html>
					<head>
						<title>SVG Visualizer</title>
					</head>
					<body>
						<img src="${fileWebviewUri}" alt="SVG" width="500" height="500">
					</body>
				</html>
			`;
		}
	});

	context.subscriptions.push(statusBarItem);
	context.subscriptions.push(disposable);
}

export function deactivate() {}

module.exports = {
    activate
};
