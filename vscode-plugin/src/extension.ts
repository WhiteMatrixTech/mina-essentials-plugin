// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import fs from "node:fs";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vscode-mina" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "vscode-mina.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage(
        "Hello World from vscode-mina!!???!"
      );
    }
  );

  context.subscriptions.push(disposable);

  context.subscriptions.push(
    vscode.commands.registerCommand("example.showWebview", () => {
      const panel = vscode.window.createWebviewPanel(
        "exampleWebview",
        "Example Webview",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, "dist/web"),
          ],
        }
      );
    })
  );

  const provider = new ExampleViewProvider(context.extensionUri);
  vscode.window.registerWebviewViewProvider("exampleView", provider);
}

// This method is called when your extension is deactivated
export function deactivate() {}

class ExampleViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, "dist/web")],
    };

    const resourcePath = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "dist/web")
    );

    webviewView.webview.html = fs
      .readFileSync(
        vscode.Uri.joinPath(this.extensionUri, "dist/web/index.html").fsPath,
        "utf-8"
      )
      .replaceAll("/%STATIC_PATH%", resourcePath.toString());

    webviewView.webview.onDidReceiveMessage((message) => {
      const terminal = vscode.window.createTerminal({
        name: "mina",
        cwd: vscode.workspace.workspaceFolders?.[0].uri.fsPath,
      });
      switch (message.command) {
        case "config":
          terminal.sendText("zk config");
          terminal.show();
          return;

        case "compile":
          terminal.sendText("npm run build");
          terminal.show();
          return;

        case "deploy":
          terminal.sendText("zk deploy");
          terminal.show();
      }
    });

    setTimeout(() => {
      webviewView.webview.postMessage({
        type: "hello1111",
      });
    }, 1000);
  }
}

function getWebviewContent() {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Example Panel</title>
      </head>
      <body>
          <button onclick="runCommand()">Run LS Command</button>
          <script>
              const vscode = acquireVsCodeApi();
              function runCommand() {
                  vscode.postMessage({ command: 'runLS' });
              }
          </script>
      </body>
      </html>
  `;
}
