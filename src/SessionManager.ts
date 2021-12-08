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

export class SessionManager {
    redirectURL: http.Server | undefined;
    monday: any; 
    context: any; 
    async init(context: vscode.ExtensionContext) {
       this.monday = mondaySdk();  
       const currentSession = this.getSession(context);  
       if(!currentSession || !currentSession.access_token || this.isExpired(currentSession.access_token_expiration_date)) {
           this.setSession(context, undefined); 
       } else {
           this.setSession(context, currentSession); 
       }
    }

    public getSession(context: vscode.ExtensionContext): session | undefined {
        return context.globalState.get('Monday.Session', undefined);
    }

    private isExpired(expirationDate: Number) {
        return Date.now() <= expirationDate;
    }
    
    public setSession(context: vscode.ExtensionContext, session?: session): void {
        vscode.commands.executeCommand('setContext', 'Authenticated', !!session?.access_token);
        const _onSessionDidChanged = new vscode.EventEmitter<session | undefined>();
        _onSessionDidChanged.fire;
        context.globalState.update('Monday.Session', session); 
        if(session) {
            this.monday?.setToken(session.access_token);
        }
    }

    public logout(context: vscode.ExtensionContext) {
        context.globalState.update('Monday.Session', undefined); 
    }

    public isAuthenticated(context: vscode.ExtensionContext): boolean {
        const session = this.getSession(context); 
        return !!session && !this.isExpired(session.access_token_expiration_date); 
    }
}
