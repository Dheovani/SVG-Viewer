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
	width: 100%;
	height: 100%;
	object-fit: contain;
`;

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
                <body style="${bodyStyle}">
					<div style="${divStyle}">
						<img src="${fileWebviewUri}" alt="SVG" style="${imgStyle}">
					</div>
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
	const openTextDocDisposable = vscode.workspace.onDidOpenTextDocument(async (document) => {
		const fileName: string = document.fileName;

		if (isSVGFile(fileName)) {
			panel?.reveal(vscode.ViewColumn.One);

			if (!panel) {
				const selectedOption = await vscode.window.showInformationMessage("Open preview?", "Yes", "No");
				
				if (selectedOption === "No")
					return;

				panel = vscode.window.createWebviewPanel(
					'SVG-Viewer',
					'SVG-Viewer',
					vscode.ViewColumn.One,
					{ enableScripts: true }
				);

				// Deletar o painel ao ser descartado para que ele seja criado novamente quando outro arquivo SVG for aberto
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
