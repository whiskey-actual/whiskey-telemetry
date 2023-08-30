import { MongoClient } from 'mongodb'
import mongoose, { mongo } from "mongoose";
import { WhiskeyUtilities } from "whiskey-utilities";
import { DeviceSchema } from './Device'


export class DB {

  constructor(logStack:string[], mongoAdminURI:string, mongoURI:string, db:string) {
    this._logStack=logStack;
    this._mongoAdminURI=mongoAdminURI;
    this._mongoURI=mongoURI;
    this._db=db
  }

  _logStack:string[]=[]
  _mongoAdminURI:string=''
  _mongoURI:string=''
  _db:string=''

  public async checkDB() {

    this._logStack.push('checkDB');
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `verifying db: ${this._db}`)

    try {

      const initClient = new MongoClient(this._mongoAdminURI);
      let initDB = initClient.db()
      const initAdmin = initDB.admin();
      const dbInfo = await initAdmin.listDatabases();

      const dbObject = dbInfo.databases.find(element => element.name==this._db)
      if(dbObject) {

        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. found db ${this._db} (size is ${dbObject.sizeOnDisk}b)`)
        mongoose.connect(`${this._mongoURI}`)

        const assetDB = initClient.db(this._db)
        const admin = assetDB.admin()

        await this.verifyCollection(admin, "devices", DeviceSchema);

      }
      else {
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `.. db ${this._db} not found.`)
      }

    } catch (error) {
      console.error(error);
    }

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. check complete.`)
    this._logStack.pop()
    return

  }

  private async verifyCollection(admin:mongoose.mongo.Admin, collectionName:string, collectionSchema:mongoose.Schema):Promise<boolean> {

    let output:boolean = false

    this._logStack.push('verifyCollection')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack,`.. verifying collection ${collectionName} .. `)

    const collectionExists:boolean = await this.validateCollection(admin, collectionName)
    if(!collectionExists) {
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack,`.. collection ${collectionName} does not exist, creating .. `)
      await this.createCollection(collectionName, collectionSchema).then(() => {
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack,`.. collection ${collectionName} created. `)
      }, (reason) => {
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack,`ERROR: ${reason}`)
        throw (reason);
      })
    } else {
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack,`.. collection ${collectionName} ok. `)
    }
    this._logStack.pop()
    return new Promise<boolean>((resolve) => {resolve(output)})
  }

  private async validateCollection(admin:mongoose.mongo.Admin, collection:string):Promise<boolean> {

    let output:boolean = false
    this._logStack.push('validateCollection')

    await admin.validateCollection(collection).then((d) => {
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack,`.. found ${collection} (${d.nrecords} records)`)
      output=true
    }).catch((e) => {
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `${e}`)
    })
    this._logStack.pop()
    return new Promise<boolean>((resolve) => {resolve(output)})
  }

  private async createCollection(collectionName:string, collectionSchema:mongoose.Schema) {
    this._logStack.push('createCollection')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack,`.. collection not found: ${collectionName}; creating .. `)
    const mongoCollection:mongo.Collection = await mongoose.model(collectionName, collectionSchema).createCollection()
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. collection ${mongoCollection.collectionName} created.`)
    this._logStack.pop()
  }
}
