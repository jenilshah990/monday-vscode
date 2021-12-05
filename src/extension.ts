// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import mondaySdk from 'monday-sdk-js';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "monday-vscode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('monday-vscode.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Monday_VSCode!');
	});
	context.subscriptions.push(disposable);
	showDate(context); 
	login(context); 
}

function showDate(context: vscode.ExtensionContext) {	
	console.log('Showing Date!');
	let disposableDateTime = vscode.commands.registerCommand('monday-vscode.showTime', () => {
		let dateTime = Date();
		vscode.window.showInformationMessage('Current Date: ' + dateTime);
	});
	context.subscriptions.push(disposableDateTime);
}

function login(context: vscode.ExtensionContext) {
	var client_id = 'fe08982fe04e8bc054cb0798041afee9'; // Your app's client ID
	console.log("Logging into Monday.com"); 
	let login = vscode.commands.registerCommand('monday-vscode.login', () => {
		const monday = mondaySdk();
		console.log('OAuth Begins'); 
		monday.oauth();
		console.log('OAuth Completed'); 	 
	});
	context.subscriptions.push(login);  
}

// this method is called when your extension is deactivated
export function deactivate() {}
