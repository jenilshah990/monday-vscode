/*
import * as vscode from 'vscode';
import * as http from 'http';
import mondaySdk from 'monday-sdk-js';

export type globalState = {
    globalState: vscode.Memento;
}

export interface session {
    access_token: string; 
    expires_in: string;
    refresh_token: string;
    access_token_expiration_date: number;
}

export class TreeViewer {
    redirectURL: http.Server | undefined;
    monday: any; 
    context: any; 
    async init(context: vscode.ExtensionContext, monday: any) {  
    }

    public getSession(context: vscode.ExtensionContext): session | undefined {
    }

    private isExpired(expirationDate: Number) {
    }

    public setSession(context: vscode.ExtensionContext, session?: session): void {
    }

    public logout(context: vscode.ExtensionContext){
    }

    public isAuthenticated(context: vscode.ExtensionContext): boolean{
    }
}

*/

//stack overflow
import * as vscode from 'vscode';
import { getAllBoard } from './extension'

// export function activate(context: vscode.ExtensionContext) {
//   console.log('Activating Tree View'); 
// }

export interface item {
  name: string; 
  id: string;
  description: string;
  items: number;
}

export interface board {
  name: string; 
  id: string;
  description: string;
  items: Array<item>;
}

export class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
  onDidChangeTreeData?: vscode.Event<TreeItem|null|undefined>|undefined;

  data: TreeItem[];

  constructor(context: vscode.ExtensionContext) {
    getAllBoard(context)
    const boards = context.workspaceState.get('boards') as Array<board>
    console.log(boards)
    // this.data = [new TreeItem('cars', [
    //   new TreeItem(
    //       'Ford', [new TreeItem('Fiesta'), new TreeItem('Focus'), new TreeItem('Mustang')]),
    //   new TreeItem(
    //       'BMW', [new TreeItem('320'), new TreeItem('X3'), new TreeItem('X5')])
    // ])];

    this.data = [new TreeItem(boards[0])];   
  }

  getTreeItem(element: TreeItem): vscode.TreeItem|Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem|undefined): vscode.ProviderResult<TreeItem[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }
}
// vscode.window.createTreeView('nodeDependencies', {
//     treeDataProvider: new TreeDataProvider(rootPath)
//   });
  
// const rootPath =
//   vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
//     ? vscode.workspace.workspaceFolders[0].uri.fsPath
//     : undefined;
// vscode.window.registerTreeDataProvider('nodeDependencies', new TreeDataProvider(rootPath));


class TreeItem extends vscode.TreeItem {
  children: TreeItem[]|undefined;

  constructor(label: board, children?: TreeItem[]) {
    super(
        label.name,
        children === undefined ? vscode.TreeItemCollapsibleState.None :
                                 vscode.TreeItemCollapsibleState.Expanded);
    this.children = children;
  }
}
