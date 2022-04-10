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

export function activate(context: vscode.ExtensionContext) {
  vscode.window.registerTreeDataProvider('exampleView', new TreeDataProvider());
}

class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
  onDidChangeTreeData?: vscode.Event<TreeItem|null|undefined>|undefined;

  data: TreeItem[];

  constructor() {
    this.data = [new TreeItem('cars', [
      new TreeItem(
          'Ford', [new TreeItem('Fiesta'), new TreeItem('Focus'), new TreeItem('Mustang')]),
      new TreeItem(
          'BMW', [new TreeItem('320'), new TreeItem('X3'), new TreeItem('X5')])
    ])];
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

  constructor(label: string, children?: TreeItem[]) {
    super(
        label,
        children === undefined ? vscode.TreeItemCollapsibleState.None :
                                 vscode.TreeItemCollapsibleState.Expanded);
    this.children = children;
  }
}
