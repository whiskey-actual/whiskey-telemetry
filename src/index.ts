// external imports
import { WhiskeyUtilities } from 'whiskey-utilities'

// components
import { MicrosoftSql } from './database/MicrosoftSql'
import { SqlRequestCollection } from './database/SqlRequestCollection'

// collectors
import { ActiveDirectory } from './collectors/ActiveDirectory'
import { AzureActiveDirectory } from './collectors/AzureActiveDirectory'
import { AzureManaged } from './collectors/AzureManaged'
import { Connectwise } from './collectors/Connectwise'
import { Crowdstrike } from './collectors/Crowdstrike'

export class Telemetry {

    constructor(logStack:string[], MicrosoftSqlConfig:any, showDetails:boolean=false, showDebug:boolean=false) {
        this._logstack=logStack
        this._mssql=new MicrosoftSql(this._logstack, MicrosoftSqlConfig)
        this._showDetails=showDetails
        this._showDebug=showDebug
    }
    private _logstack:string[]=[]
    private _mssql:MicrosoftSql
    private _showDetails:boolean=false
    private _showDebug:boolean=false

    public async persistToMicrosoftSql(sqlRequestCollection:SqlRequestCollection, logFrequency:number=1000) {
        await this._mssql.writeToSql(sqlRequestCollection, logFrequency)
    }

    // public async isMongoDatabaseOK(mongoAdminURI:string, mongoURI:string, db:string):Promise<boolean> {
    //     this._logstack.push('isMongoDatabaseOK');
    //     let output:boolean = false;

    //     try {
    //         const d = new MongoDatabase(this._logstack);
    //         output = await d.checkMongoDatabase(mongoAdminURI, mongoURI, db);
    //     } catch(err) {
    //         WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logstack, `${err}`)
    //         throw(err);
    //     }
        
    //     this._logstack.pop()
    //     return new Promise<boolean>((resolve) => {resolve(output)})
    // }

    // public async persistToMongo(deviceObjects:any, logFrequency:number=1000, showDetails:boolean=false, showDebug:boolean=false) {
    //     this._logstack.push('persistToMongo');
    //     let output:boolean = false;

    //     try {
    //         const mp = new MongoPersister(this._logstack, this._mongooseConnection, showDetails, showDebug)
    //         await mp.persistDevices(deviceObjects, logFrequency);
    //     } catch(err) {
    //         WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logstack, `${err}`)
    //         throw(err);
    //     }
        
    //     this._logstack.pop()
    //     return new Promise<boolean>((resolve) => {resolve(output)})
    // }

    public async fetchActiveDirectory(ldapURL:string, bindDN:string, pw:string, searchDN:string, isPaged:boolean=true, sizeLimit:number=500):Promise<SqlRequestCollection> {
        this._logstack.push('ActiveDirectory');
        let output:SqlRequestCollection

        try {
            const ad = new ActiveDirectory(this._logstack, this._showDetails, this._showDebug);
            output = await ad.fetch(ldapURL, bindDN, pw, searchDN, isPaged, sizeLimit)
        } catch(err) {
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logstack, `${err}`)
            throw(err);
        }
        
        this._logstack.pop()
        return new Promise<SqlRequestCollection>((resolve) => {resolve(output)})
    }

    public async fetchAzureActiveDirectory(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<SqlRequestCollection> {
        this._logstack.push('AzureActiveDirectory');
        let output:SqlRequestCollection

        try {
            const aad = new AzureActiveDirectory(this._logstack, this._showDetails, this._showDebug);
            output = await aad.fetch(TENANT_ID, AAD_ENDPOINT, GRAPH_ENDPOINT, CLIENT_ID, CLIENT_SECRET)
        } catch(err) {
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logstack, `${err}`)
            throw(err);
        }
        
        this._logstack.pop()
        return new Promise<SqlRequestCollection>((resolve) => {resolve(output)})
    }

    public async fetchAzureManaged(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<SqlRequestCollection> {
        this._logstack.push('AzureManaged');
        let output:SqlRequestCollection

        try {
            const am = new AzureManaged(this._logstack, this._showDetails, this._showDebug);
            output = await am.fetch(TENANT_ID, AAD_ENDPOINT, GRAPH_ENDPOINT, CLIENT_ID, CLIENT_SECRET)
        } catch(err) {
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logstack, `${err}`)
            throw(err);
        }
        
        this._logstack.pop()
        return new Promise<SqlRequestCollection>((resolve) => {resolve(output)})
    }

    public async fetchConnectwise(baseURL:string, clientId:string, userName:string, password:string):Promise<SqlRequestCollection> {
        this._logstack.push('Connectwise');
        let output:SqlRequestCollection

        try {
            const cw = new Connectwise(this._logstack, this._showDetails, this._showDebug);
            output = await cw.fetch(baseURL, clientId, userName, password);
        } catch(err) {
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logstack, `${err}`)
            throw(err);
        }
        
        this._logstack.pop()
        return new Promise<SqlRequestCollection>((resolve) => {resolve(output)})
    }

    public async fetchCrowdstrike(baseURL:string, clientId:string, clientSecret:string):Promise<SqlRequestCollection> {
        this._logstack.push('Crowdstrike');
        let output:SqlRequestCollection

        try {
            const cs = new Crowdstrike(this._logstack, this._showDetails, this._showDebug)
            output = await cs.fetch(baseURL, clientId, clientSecret)
        } catch(err) {
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logstack, `${err}`)
            throw(err);
        }
        
        this._logstack.pop()
        return new Promise<SqlRequestCollection>((resolve) => {resolve(output)})
    }


}