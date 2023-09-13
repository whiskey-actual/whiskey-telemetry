import { MongoClient } from 'mongodb'
import mongoose, { mongo } from "mongoose";
import { WhiskeyUtilities } from "whiskey-utilities";
import { DeviceSchema } from '../Device'


export class MongoDatabase {

  _logStack:string[]=[]
  constructor(logStack:string[]) {
    this._logStack=logStack;
  }

  public async checkMongoDatabase(mongoAdminURI:string, mongoURI:string, db:string):Promise<boolean> {
    this._logStack.push('checkMongoDatabase');
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `verifying db: ${db}`)
    let output:boolean = false;
    
    try {

      const initClient = new MongoClient(mongoAdminURI);
      let initDB = initClient.db()
      const initAdmin = initDB.admin();
      const dbInfo = await initAdmin.listDatabases();

      const dbObject = dbInfo.databases.find(element => element.name==db)
      if(dbObject) {

        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. found db ${db} (size is ${dbObject.sizeOnDisk}b)`)
        mongoose.connect(`${mongoURI}`)

        const assetDB = initClient.db(db)
        const admin = assetDB.admin()

        output = await this.verifyCollection(admin, "devices", DeviceSchema);

      }
      else {
        throw(`.. db ${db} not found.`)  
      }

    } catch (err:any) {
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, err)
      throw(err)
    }

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. check complete.`)
    this._logStack.pop()
    return new Promise<boolean>((resolve) => {resolve(output)})

  }

  private async verifyCollection(admin:mongoose.mongo.Admin, collectionName:string, collectionSchema:mongoose.Schema):Promise<boolean> {
    this._logStack.push('verifyCollection')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack,`verifying collection ${collectionName} .. `)
    let output:boolean = false

    try {
      const collectionExists:boolean = await this.validateCollection(admin, collectionName)
      if(collectionExists) {
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack,`.. collection ${collectionName} ok. `)
      } else {
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack,`.. collection ${collectionName} does not exist`)
        await this.createCollection(collectionName, collectionSchema)
      }
    } catch (err:any) {
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, err)
      throw(err)
    }
    
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `collection verified`)
    this._logStack.pop()
    return new Promise<boolean>((resolve) => {resolve(output)})
  }

  private async validateCollection(admin:mongoose.mongo.Admin, collectionName:string):Promise<boolean> {
    this._logStack.push('validateCollection')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack,`validating collection ${collectionName} .. `)
    let output:boolean = false

    try {
      const doc = await admin.validateCollection(collectionName)
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack,`.. collection ${collectionName} OK. (found ${doc} records)`)
      output=true
    } catch (err:any) {
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, err)
      throw(err)
    }
        
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack,`collection ${collectionName} verified. `)
    this._logStack.pop()
    return new Promise<boolean>((resolve) => {resolve(output)})
  }

  private async createCollection(collectionName:string, collectionSchema:mongoose.Schema) {
    this._logStack.push('createCollection')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack,`creating collection ${collectionName} .. `)
    let output:boolean = false

    try {
      const mongoCollection:mongo.Collection = await mongoose.model(collectionName, collectionSchema).createCollection()
      output = true
    } catch (err:any) {
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, err)
      throw(err)
    }

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack,`collection ${collectionName} created`)
    this._logStack.pop()
    return new Promise<boolean>((resolve) => {resolve(output)})
  }
}
