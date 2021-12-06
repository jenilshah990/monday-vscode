// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import mondaySdk from 'monday-sdk-js';
import * as http from 'http';
import axios from 'axios';
import { parse } from 'url';

const finishedRequestHTML = 
	'<!DOCTYPE html> \
	<html lang="en"> \
	<head> \
		<meta charset="UTF-8"> \
		<meta name="viewport" content="width=device-width, initial-scale=1.0"> \
		<title>Monday VS Code Extension</title> \
	</head> \
	<body> \
		Authenticated Successfully! \
	</body> \
	</html>'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "monday-vscode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('monday-vscode.helloWorld', async () => {
		vscode.window.showInformationMessage('Hello World from Monday_VSCode!');
		//make axios request to google.com
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
	const clientid = 'fe08982fe04e8bc054cb0798041afee9'; // Your app's client ID
	const clientsecret = '40f84910b477006d7e6a7935e7ca4736'; // Your app's secret
	const redirecturi = 'http://localhost:3000/oauth/callback'; // The URI you will send your user to after auth
	const scopes = 'me:read boards:read'; // The scopes you will request from the user
	const oauth_url = 'https://auth.monday.com/oauth2/authorize?' + 
		new URLSearchParams({
			client_id: clientid,
			redirect_uri: redirecturi,
			scopes: scopes
		}).toString();
	console.log("Logging into Monday.com"); 
	let login = vscode.commands.registerCommand('monday-vscode.login', async () => {
		const monday = mondaySdk();
		console.log('OAuth Begins'); 

		http.createServer(async (req, res) => {
			res.writeHead(200, { 'Content-Type': 'text/html' }); // http header
			const { url, method } = req;
			if (method === 'GET' && url?.includes('/oauth/callback')) {
				const params = parse(url, true).query;
				const code = params.code;
				console.log(params);
				res.end(finishedRequestHTML);
				const body = {
					code,
					client_id: clientid,
					redirect_uri: redirecturi,
					client_secret: clientsecret,
				};
				const response = await axios.post('https://auth.monday.com/oauth2/token', body);
				console.log(response);
				//const token = response.data.access_token;
				//const accessInfo = await this.acquireToken(params.code as string);
				//this.handleAcquiredToken(accessInfo);
				//resolve();
				//this.shutdownRedirectServer(timeout);
			}
		})
		.listen(3000, () => {
			console.log('Redirect uri server instance up and waiting', 'monday kit');
			vscode.env.openExternal(vscode.Uri.parse(oauth_url));
		});

		vscode.env.openExternal(vscode.Uri.parse(oauth_url));

		console.log('OAuth Completed'); 	 
	});
	context.subscriptions.push(login);  
}

// this method is called when your extension is deactivated
export function deactivate() {}

