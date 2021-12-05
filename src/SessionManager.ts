import * as vscode from 'vscode';
import * as http from 'http';
import monday_sdk from 'monday-sdk-js';

export interface session {
    accessToken: string; 
    expires_in: string;
    refresh_token: string;
    access_token_expiration_date: number;
}

class SessionManager {
    private redirectURL: http.Server | undefined;
}
