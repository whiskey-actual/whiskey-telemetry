// external imports
import { Utilities } from 'whiskey-utilities'

// components
import { MicrosoftSql } from './database/MicrosoftSql'
import { MongoDB } from './database/MongoDB'
import { SqlRequestCollection } from './database/SqlRequestCollection'

// collectors
import { ActiveDirectory } from './collectors/ActiveDirectory'
import { AzureActiveDirectory } from './collectors/AzureActiveDirectory'
import { AzureManaged } from './collectors/AzureManaged'
import { Connectwise } from './collectors/Connectwise'
import { Crowdstrike } from './collectors/Crowdstrike'
import { ActiveDirectoryDevice, AzureActiveDirectoryDevice, AzureManagedDevice } from './Device'

export class Telemetry {

    constructor(logStack:string[], logFrequency:number=1000, showDetails:boolean=false, showDebug:boolean=false) {
        this._logFrequency=logFrequency
        this._showDetails=showDetails
        this._showDebug=showDebug
        this._utilities = new Utilities(logStack, showDetails, showDebug);
    }
    private _logFrequency:number=1000
    private _showDetails:boolean=false
    private _showDebug:boolean=false
    private _utilities:Utilities=new Utilities([])

    public async persistToMicrosoftSql(MicrosoftSqlConfig:any, sqlRequestCollection:SqlRequestCollection):Promise<boolean> {
        const mssql:MicrosoftSql=new MicrosoftSql(this._utilities.logStack, MicrosoftSqlConfig)
        await mssql.writeToSql(sqlRequestCollection, this._logFrequency)
        return new Promise<boolean>((resolve) => {resolve(true)})
    }

    public async verifyMongoDB(mongoAdminURI:string, mongoURI:string, dbName:string):Promise<boolean> {
        const mongoCheck:MongoDB.CheckDB = new MongoDB.CheckDB(this._utilities.logStack);
        await mongoCheck.checkMongoDatabase(mongoAdminURI, mongoURI, dbName);
        return new Promise<boolean>((resolve) => {resolve(true)})
    }

    public async persistToMongoDB(mongoURI:string, mongoConnectionOptions:Object={}, deviceObjects:any):Promise<boolean> {
        const mongodb:MongoDB.Persist = new MongoDB.Persist(this._utilities.logStack, mongoURI, mongoConnectionOptions)
        mongodb.persistDevices(deviceObjects, this._logFrequency)
        return new Promise<boolean>((resolve) => {resolve(true)})
    }

    public async fetchActiveDirectory(ldapURL:string, bindDN:string, pw:string, searchDN:string, isPaged:boolean=true, sizeLimit:number=500):Promise<ActiveDirectoryDevice[]> {
        this._utilities.logStack.push('ActiveDirectory');
        let output:ActiveDirectoryDevice[]=[]

        try {
            const ad = new ActiveDirectory(this._utilities.logStack, this._showDebug);
            output = await ad.fetch(ldapURL, bindDN, pw, searchDN, isPaged, sizeLimit)
        } catch(err) {
            this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `${err}`)
            throw(err);
        }
        
        this._utilities.logStack.pop()
        return new Promise<ActiveDirectoryDevice[]>((resolve) => {resolve(output)})
    }

    public async fetchAzureActiveDirectory(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<AzureActiveDirectoryDevice[]> {
        this._utilities.logStack.push('AzureActiveDirectory');
        let output:AzureActiveDirectoryDevice[]

        try {
            const aad = new AzureActiveDirectory(this._utilities.logStack, this._showDetails, this._showDebug);
            output = await aad.fetch(TENANT_ID, AAD_ENDPOINT, GRAPH_ENDPOINT, CLIENT_ID, CLIENT_SECRET)
        } catch(err) {
            this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `${err}`)
            throw(err);
        }
        
        this._utilities.logStack.pop()
        return new Promise<AzureActiveDirectoryDevice[]>((resolve) => {resolve(output)})
    }

    public async fetchAzureManaged(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<AzureManagedDevice[]> {
        this._utilities.logStack.push('AzureManaged');
        let output:AzureManagedDevice[]

        try {
            const am = new AzureManaged(this._utilities.logStack, this._showDetails, this._showDebug);
            output = await am.fetch(TENANT_ID, AAD_ENDPOINT, GRAPH_ENDPOINT, CLIENT_ID, CLIENT_SECRET)
        } catch(err) {
            this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `${err}`)
            throw(err);
        }
        
        this._utilities.logStack.pop()
        return new Promise<AzureManagedDevice[]>((resolve) => {resolve(output)})
    }

    public async fetchConnectwise(baseURL:string, clientId:string, userName:string, password:string):Promise<SqlRequestCollection> {
        this._utilities.logStack.push('Connectwise');
        let output:SqlRequestCollection

        try {
            const cw = new Connectwise(this._utilities.logStack, this._showDetails, this._showDebug);
            output = await cw.fetch(baseURL, clientId, userName, password);
        } catch(err) {
            this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `${err}`)
            throw(err);
        }
        
        this._utilities.logStack.pop()
        return new Promise<SqlRequestCollection>((resolve) => {resolve(output)})
    }

    public async fetchCrowdstrike(baseURL:string, clientId:string, clientSecret:string):Promise<SqlRequestCollection> {
        this._utilities.logStack.push('Crowdstrike');
        let output:SqlRequestCollection

        try {
            const cs = new Crowdstrike(this._utilities.logStack, this._showDetails, this._showDebug)
            output = await cs.fetch(baseURL, clientId, clientSecret)
        } catch(err) {
            this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `${err}`)
            throw(err);
        }
        
        this._utilities.logStack.pop()
        return new Promise<SqlRequestCollection>((resolve) => {resolve(output)})
    }


}