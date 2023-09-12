// external imports
import { WhiskeyUtilities } from 'whiskey-utilities'
import { Mongoose } from 'mongoose'

// components
import { MongoDatabase } from './Database'
import { MongoPersister } from './Persister'
import { ActiveDirectoryDevice, AzureActiveDirectoryDevice, ConnectwiseDevice, CrowdstrikeDevice } from './Device'

// collectors
import { ActiveDirectory } from './collectors/ActiveDirectory'
import { AzureActiveDirectory } from './collectors/AzureActiveDirectory'
import { Connectwise } from './collectors/Connectwise'
import { Crowdstrike } from './collectors/Crowdstrike'


export class Telemetry {

    constructor(logStack:string[], mongooseConnection:Mongoose) {
        this._logstack=logStack
        this._mongooseConnection = mongooseConnection
    }
    _logstack:string[]=[]
    _mongooseConnection:Mongoose=new Mongoose()


    public async isMongoDatabaseOK(mongoAdminURI:string, mongoURI:string, db:string):Promise<boolean> {
        this._logstack.push('isMongoDatabaseOK');
        let output:boolean = false;

        try {
            const d = new MongoDatabase(this._logstack);
            output = await d.checkMongoDatabase(mongoAdminURI, mongoURI, db);
        } catch(err) {
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logstack, `${err}`)
            throw(err);
        }
        
        this._logstack.pop()
        return new Promise<boolean>((resolve) => {resolve(output)})
    }

    public async persistToMongo(deviceObjects:any, logFrequency:number=1000, showDetails:boolean=false, showDebug:boolean=false) {
        this._logstack.push('persistToMongo');
        let output:boolean = false;

        try {
            const mp = new MongoPersister(this._logstack, this._mongooseConnection, showDetails, showDebug)
            await mp.persistDevices(deviceObjects, logFrequency);
        } catch(err) {
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logstack, `${err}`)
            throw(err);
        }
        
        this._logstack.pop()
        return new Promise<boolean>((resolve) => {resolve(output)})
    }

    public async fetchActiveDirectory(ldapURL:string, bindDN:string, pw:string, searchDN:string, isPaged:boolean=true, sizeLimit:number=500, showDetails:boolean=false, showDebug:boolean=false):Promise<ActiveDirectoryDevice[]> {
        this._logstack.push('ActiveDirectory');
        let output:ActiveDirectoryDevice[] = []

        try {
            const ad = new ActiveDirectory(this._logstack, showDetails, showDebug);
            output = await ad.fetch(ldapURL, bindDN, pw, searchDN, isPaged, sizeLimit)
        } catch(err) {
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logstack, `${err}`)
            throw(err);
        }
        
        this._logstack.pop()
        return new Promise<ActiveDirectoryDevice[]>((resolve) => {resolve(output)})
    }

    public async fetchAzureActiveDirectory(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string, showDetails:boolean=false, showDebug:boolean=false):Promise<AzureActiveDirectoryDevice[]> {
        this._logstack.push('AzureActiveDirectory');
        let output:AzureActiveDirectoryDevice[] = []

        try {
            const aad = new AzureActiveDirectory(this._logstack, showDetails, showDebug);
            output = await aad.fetch(TENANT_ID, AAD_ENDPOINT, GRAPH_ENDPOINT, CLIENT_ID, CLIENT_SECRET)
        } catch(err) {
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logstack, `${err}`)
            throw(err);
        }
        
        this._logstack.pop()
        return new Promise<AzureActiveDirectoryDevice[]>((resolve) => {resolve(output)})
    }

    public async fetchConnectwise(baseURL:string, clientId:string, userName:string, password:string, showDetails:boolean=false, showDebug:boolean=false):Promise<ConnectwiseDevice[]> {
        this._logstack.push('Connectwise');
        let output:ConnectwiseDevice[] = []

        try {
            const cw = new Connectwise(this._logstack, showDetails, showDebug);
            output = await cw.fetch(baseURL, clientId, userName, password);
        } catch(err) {
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logstack, `${err}`)
            throw(err);
        }
        
        this._logstack.pop()
        return new Promise<ConnectwiseDevice[]>((resolve) => {resolve(output)})
    }

    public async fetchCrowdstrike(baseURL:string, clientId:string, clientSecret:string, showDetails:boolean=false, showDebug:boolean=false):Promise<CrowdstrikeDevice[]> {
        this._logstack.push('Crowdstrike');
        let output:CrowdstrikeDevice[] = []

        try {
            const cs = new Crowdstrike(this._logstack, showDetails, showDebug)
            output = await cs.fetch(baseURL, clientId, clientSecret)
        } catch(err) {
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logstack, `${err}`)
            throw(err);
        }
        
        this._logstack.pop()
        return new Promise<CrowdstrikeDevice[]>((resolve) => {resolve(output)})
    }


}