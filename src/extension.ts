// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import mondaySdk from 'monday-sdk-js';
import * as http from 'http';
import axios from 'axios';
import { parse } from 'url';
import { session } from './SessionManager';
import { SessionManager } from './SessionManager';

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

const allBoardsQuery = `{ boards {
	name
	id
	description
	items {
	  name
	  column_values {
		title
		id
		type
		text
  } } } }`;

function itemsQuery(boardid: string){
	return `query {
		boards (ids: ${boardid}) {
		  items {
			id
			name
			column_values {
			  id
			  title
			  value
			}
		  }
		} }`;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed\

//global sdk - not sure if this will work
const monday = mondaySdk();

export async function activate(context: vscode.ExtensionContext) {
	//sdk
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('monday-vscode.helloWorld', async () => {
		vscode.window.showInformationMessage('Hello World from Monday_VSCode!');
		//make axios request to google.com
	});
	context.subscriptions.push(disposable);
	showDate(context); 
	showBoards(context);
	commentItems(context);
	modifyItemStatus(context);
	createItem(context);
	const session = new SessionManager(); 
	session.init(context, monday); 
	login(context, session);
	logout(context, session); 
	//execute login, showBoards, commentItems?
}

function createItem(context: vscode.ExtensionContext) {
	let disposableCreateItem = vscode.commands.registerCommand('monday-vscode.createItem', async () => {
		const boardSelection = context.workspaceState.get('boardSelection') as string;

		/*
		was tring to make it so that you can create a new item in a specific group, but apparently groups
		don't have names???*/
		const group_query = `{
			boards(ids: ${boardSelection}) {
			id
			groups {
			id
			title
			items {
			id
			name
		}}}}`;
		const groups = await monday.api(group_query);
		console.log(groups);
		const groupNames = groups.data.boards[0].groups.map( (group: any) => group.title);
		const selectedGroup = await vscode.window.showQuickPick(groupNames);
		const selectedGroupId = groups.data.boards[0].groups.find( (group: any) => group.title === selectedGroup).id;
		

		const itemName = await vscode.window.showInputBox();
		const query = `mutation createItem($value: JSON!) {
			create_item(board_id: ${boardSelection}, item_name: ${itemName}, 
				 column_values: $value, group_id: ${selectedGroupId}) {
				id
			}
		}`;
		const response = await monday.api(query, {variables: {"value": "{\"label\":\"Working on it\", \
																		\"priority\":\"High\"}"}});
		console.log(response);
	});
	context.subscriptions.push(disposableCreateItem);
}

function modifyItemStatus(context: vscode.ExtensionContext) {
	console.log('Modifying Item'); 
	let disposableCompleteItem = vscode.commands.registerCommand('monday-vscode.completeItem', async () => {
		const boardSelection = context.workspaceState.get('boardSelection') as string;
		//get items from context
		const items = context.workspaceState.get('items') as any[];
		console.log(items);
		//get item names
		const itemNames = items.map( (item: any) => item.name);
		//show quickpick
		const selectedItem = await vscode.window.showQuickPick(itemNames);
		//get selectedItemId
		const selectedItemId = items.find( (item: any) => item.name === selectedItem).id;
		//complete selectedItem
		/*const response = await monday.api(`mutation change_column($value: JSON!) {

			change_column_value(board_id: ${boardSelection}, item_id: ${selectedItemId}, column_id: "status", value: "done") {
				 id
			}
	   
	   }`);*/
	   const possibleStatus = ["Done", "Working on it", "Ready for review", "On hold", "Stuck", "Planned", "Up next", "Future steps"];
	 	//quickpick
	   const selectedStatus = await vscode.window.showQuickPick(possibleStatus) as string;
	   console.log(selectedStatus);
	   const status = "Done";
	   const query = `mutation changeValues($value: JSON!) {
        change_column_value (board_id: ${boardSelection}, item_id: ${selectedItemId} , column_id: status, value: $value) {
          id
        } 
      }`;
	  const response = await monday.api(query, {variables: {"value": "{\"label\":\""+selectedStatus+"\"}"}});
	   console.log(response);
		  /*const response = await monday.api(`mutation{
		   change_column_value(item_id:${selectedItemId}, board_id:${boardSelection}, 
			column_id:"status", value:\"{\\\"label\\\" : \\\"Done\\\"}\"){id}}`);
		console.log(response);
		});*/
	});
	context.subscriptions.push(disposableCompleteItem); 
}

function commentItems(context: vscode.ExtensionContext){
	let disposableItems = vscode.commands.registerCommand('monday-vscode.commentItems', async () => {
		
	});
	context.subscriptions.push(disposableItems); 
}

function logout(context: vscode.ExtensionContext, SessionManager: SessionManager) {
	let disposableLogout = vscode.commands.registerCommand('monday-vscode.logout', () => {
		SessionManager.logout(context); 
		vscode.window.showInformationMessage('Successfully logged out');
	});
	context.subscriptions.push(disposableLogout); 
}

function showDate(context: vscode.ExtensionContext) {	
	console.log('Showing Date!');
	let disposableDateTime = vscode.commands.registerCommand('monday-vscode.showTime', () => {
		let dateTime = Date();
		vscode.window.showInformationMessage('Current Date: ' + dateTime);
	});
	context.subscriptions.push(disposableDateTime);
}

function showBoards(context: vscode.ExtensionContext) {
	console.log('Showing Boards!');
	let disposableBoards = vscode.commands.registerCommand('monday-vscode.showBoards', async () => {
		//get boards
		const response = await monday.api(allBoardsQuery);
		const boards = response.data.boards;
		const boardNames = boards.map( (board: any) => board.name);
		//show quickpick
		const selectedBoardName = await vscode.window.showQuickPick(boardNames);
		//get id of selectedBoardName
		const selectedBoard = boards.find( (board: any) => board.name === selectedBoardName).id;
		//add boardSelection to context
		context.workspaceState.update('boardSelection', selectedBoard);
		getItemsMonday(context, selectedBoard); 
	});
	context.subscriptions.push(disposableBoards);
}

async function getItemsMonday(context: vscode.ExtensionContext, selectedBoard: any) {
	const items = await monday.api(itemsQuery(selectedBoard));
	//add to context
	context.workspaceState.update('items', items.data.boards[0].items);
}

function login(context: vscode.ExtensionContext, SessionManager: SessionManager) {
	const clientid = 'fe08982fe04e8bc054cb0798041afee9'; // Your app's client ID
	const clientsecret = '40f84910b477006d7e6a7935e7ca4736'; // Your app's secret
	const redirecturi = 'http://localhost:3000/oauth/callback'; // The URI you will send your user to after auth
	const scopes = '*'; // The scopes you will request from the user
	const oauth_url = 'https://auth.monday.com/oauth2/authorize?' + 
		new URLSearchParams({
			client_id: clientid,
			redirect_uri: redirecturi,
			scopes: scopes
		}).toString();
	console.log("Logging into Monday.com"); 
	console.log(SessionManager.getSession(context));
	let login = vscode.commands.registerCommand('monday-vscode.login', async () => {

		if(SessionManager.isAuthenticated(context)) {
			console.log('User already authenticated'); 
			vscode.window.showInformationMessage('User Logged In!');
			return; 
		}

		var server = http.createServer(async (req, res) => {
			console.log('OAuth Begins'); 
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
				if(response.status == 200) {
					vscode.window.showInformationMessage('Authentication Successful');
					console.log(response); 
					monday.setToken(response.data.access_token);
					updateSession(response.data as session, context,SessionManager);
				} else {
					vscode.window.showInformationMessage("Authetication Failed. Please retry");
				}
				server.close();
			}
		})
		.listen(3000, () => {
			console.log('Redirect uri server instance up and waiting', 'monday kit');
			vscode.env.openExternal(vscode.Uri.parse(oauth_url));
		});
		console.log('OAuth Completed'); 	 
	});
	context.subscriptions.push(login);  
}

function updateSession(acquiredSession: session, context: vscode.ExtensionContext, SessionManager: SessionManager) {
	monday.setToken(acquiredSession.access_token);  
	const currSession = SessionManager.getSession(context);
	console.log('Current Session', currSession); 
	let newSession = { ...currSession, ...acquiredSession}; 
	SessionManager.setSession(context, newSession); 
	console.log('New Session Started:', newSession); 
}

// this method is called when your extension is deactivated
export function deactivate() {}

