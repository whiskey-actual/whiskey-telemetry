import { MongoClient } from 'mongodb'
import mongoose, { mongo } from "mongoose";
import { Utilities } from "whiskey-utilities";
import { DeviceSchema } from '../Device'

const _ActiveDeviceThresholdInDays:number=30

export namespace MongoDB {

  export class Persist {

    constructor(logStack:string[], mongoURI:string, mongoConnectionOptions:mongoose.ConnectOptions={}, showDetails:boolean=false, showDebug:boolean=false) {
      this._mongoURI=mongoURI;
      this._mongoConnectionOptions=mongoConnectionOptions;
      this._showDetails=showDetails;
      this._showDebug=showDebug;
      this._utilities = new Utilities(logStack, showDetails, showDebug);
    }
    private _mongoURI:string=""
    private _mongoConnectionOptions:mongoose.ConnectOptions={}
    private _showDetails:boolean=false;
    private _showDebug:boolean=false;
    private _utilities:Utilities=new Utilities([])
    
    public async persistDevices(deviceObjects:any[], logFrequency:number=1000):Promise<Number> {
      this._utilities.logStack.push("persistDevices");
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Info, `persisting ${deviceObjects.length} devices ..`)

      try {

        await mongoose.connect(this._mongoURI, this._mongoConnectionOptions)

        let persistPool:Promise<void>[]=[]

        const startDate = new Date()
        for(let i=0;i<deviceObjects.length; i++) {
          const persistAction = this.persistDevice(deviceObjects[i]).then((isNewDevice) => {
            if(isNewDevice) {
              this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Add, `.. persisted new device: ${deviceObjects[i].deviceName}`)
            }
          })
          persistPool.push(persistAction);
        }

        await Promise.all(persistPool);

        this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `.. persisted ${deviceObjects.length} devices.`)
      } catch(err) {
        this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `${err}`)
        throw(err);
      }

      this._utilities.logStack.pop()
      return new Promise<Number>((resolve) => {resolve(deviceObjects.length)})

    }

    private async persistDevice(incomingDeviceObject:any):Promise<Boolean> {

      let isNewDevice:boolean=false;

      this._utilities.logStack.push("persistDevice");

      const fieldsToPrune:string[] = [
        'observedByActiveDirectory',
        'observedByAzureActiveDirectory',
        'observedByAzureMDM',
        'observedByConnectwise',
        'observedByCrowdstrike'
      ]

      const dateFields:string[] = [
        'activeDirectoryWhenCreated',
        'activeDirectoryWhenChanged',
        'activeDirectoryLastLogon',
        'activeDirectoryPwdLastSet',
        'azureDeletedDateTime',
        'azureApproximateLastSignInDateTime',
        'azureComplianceExpirationDateTime',
        'azureCreatedDateTime',
        'azureOnPremisesLastSyncDateTime',
        'azureRegistrationDateTime',
        'azureManagedEnrolledDateTime',
        'azureManagedLastSyncDateTime',
        'azureManagedEASActivationDateTime',
        'azureManagedExchangeLastSuccessfulSyncDateTime',
        'azureManagedComplianceGracePeriodExpirationDateTime',
        'azureManagedManagementCertificateExpirationDateTime',
        'connectwiseFirstSeen',
        'connectwiseLastObserved',
        'crowdstrikeFirstSeenDateTime',
        'crowdstrikeLastSeenDateTime',
        'crowdstrikeModifiedDateTime',
      ]

      incomingDeviceObject.deviceLastObserved = this._utilities.getMaxDateFromObject(incomingDeviceObject, dateFields);

      let lastActiveThreshold:Date= new Date()
      lastActiveThreshold.setDate(lastActiveThreshold.getDate()-30)

      incomingDeviceObject.deviceIsActive = (incomingDeviceObject.deviceLastObserved>lastActiveThreshold)

      const prunedDeviceObject:any = this._utilities.pruneJsonObject(incomingDeviceObject,fieldsToPrune,true);

      await mongoose.model('Device').findOne({deviceName:prunedDeviceObject.deviceName}).then(async(result) => {
        if(result) {

          const existingDeviceObject:any = result._doc

          //Utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, prunedDeviceObject.deviceName, `.. found existing device`)
          let updateDeviceObject:any = {deviceName: existingDeviceObject.deviceName}

          const prunedDeviceObjectKeys = Object.keys(prunedDeviceObject);
          const existingDeviceObjectKeys = Object.getOwnPropertyNames(existingDeviceObject);

          updateDeviceObject.operatingSystem = this.normalizeOperatingSystem(existingDeviceObject, prunedDeviceObject)
          updateDeviceObject.deviceType = this.determineDeviceType(updateDeviceObject.operatingSystem, existingDeviceObject, prunedDeviceObject)

          // for(let i=0; i<existingDeviceObjectKeys.length; i++) {
          //   this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, prunedDeviceObject.deviceName, `.. found key: ${existingDeviceObjectKeys[i]}`)
          // }

          // iterate through the keys ..
          for(let j=0;j<prunedDeviceObjectKeys.length;j++) {

            const key = prunedDeviceObjectKeys[j]

            // does this key already exist for the retreived object?
            if(existingDeviceObjectKeys.includes(key)) {

              // if the key is different, we need add it to the update object
              if(existingDeviceObject[key]!==prunedDeviceObject[key]) {
                if(this._showDetails) {
                  this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Change, `${prunedDeviceObject.deviceName}.${key}: ${existingDeviceObject[key]} -> ${prunedDeviceObject[key]}`)
                }
                updateDeviceObject[key] = prunedDeviceObject[key]
              } else {
                if(this._showDetails) {
                  this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `${prunedDeviceObject.deviceName}.${key}: ${prunedDeviceObject[key]}`)
                }
              }
            } else {
              // is the key value undefined?
              if(prunedDeviceObject[key]!=undefined) {
                // add the new key
                updateDeviceObject[key] = prunedDeviceObject[key];
                if(this._showDetails) {
                  this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Add, `${prunedDeviceObject.deviceName}.${key}: ${prunedDeviceObject[key]}`)
                }
              }
            }
          }

          // do we have pending updates?
          if(Object.keys(updateDeviceObject).length>0) {
            if(this._showDetails) {
              this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Info, `${prunedDeviceObject.deviceName}.${Object.keys(updateDeviceObject).length} updates needed.`)
            }

            try {
              await mongoose.model('Device').updateOne(
                { deviceName: prunedDeviceObject.deviceName},
                {
                  $set: updateDeviceObject
                },
                {
                  new: true,
                  upsert: true,
                }
              )
            } catch(err:any) {
              this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, `${prunedDeviceObject.deviceName}: ${err.toString()}`)
            }

          }
        } else {
          isNewDevice = true;

          //Utilities.AddLogEntry(Utilities.LogEntrySeverity.Add, `.. new device detected: ${prunedDeviceObject.deviceName}`)

          prunedDeviceObject.deviceFirstObserved = new Date()
          const emptyDeviceObject:any = {deviceName: prunedDeviceObject.deviceName}
          prunedDeviceObject.operatingSystem = this.normalizeOperatingSystem(emptyDeviceObject, prunedDeviceObject)

          await mongoose.model('Device').updateOne(
            { deviceName: prunedDeviceObject.deviceName },
            {
              $set: prunedDeviceObject
            },
            {
              new: true,
              upsert: true
            }
          );
        }
      },
      (reason:any) => {
        throw reason
      }
      )

      this._utilities.logStack.pop();
      return new Promise<boolean>((resolve) => {resolve(isNewDevice)})

    }

    private async getUpdateObject(incomingDeviceObject:any):Promise<Boolean> {

      let isNewDevice:boolean=false;

      this._utilities.logStack.push("getUpdateObject");

      const fieldsToPrune:string[] = [
        'observedByActiveDirectory',
        'observedByAzureActiveDirectory',
        'observedByAzureMDM',
        'observedByConnectwise',
        'observedByCrowdstrike'
      ]

      const dateFields:string[] = [
        'activeDirectoryWhenCreated',
        'activeDirectoryWhenChanged',
        'activeDirectoryLastLogon',
        'activeDirectoryPwdLastSet',
        'azureDeletedDateTime',
        'azureApproximateLastSignInDateTime',
        'azureComplianceExpirationDateTime',
        'azureCreatedDateTime',
        'azureOnPremisesLastSyncDateTime',
        'azureRegistrationDateTime',
        'azureManagedEnrolledDateTime',
        'azureManagedLastSyncDateTime',
        'azureManagedEASActivationDateTime',
        'azureManagedExchangeLastSuccessfulSyncDateTime',
        'azureManagedComplianceGracePeriodExpirationDateTime',
        'azureManagedManagementCertificateExpirationDateTime',
        'connectwiseFirstSeen',
        'connectwiseLastObserved',
        'crowdstrikeFirstSeenDateTime',
        'crowdstrikeLastSeenDateTime',
        'crowdstrikeModifiedDateTime',
      ]

      incomingDeviceObject.deviceLastObserved = this._utilities.getMaxDateFromObject(incomingDeviceObject, dateFields)

      let lastActiveThreshold:Date= new Date()
      lastActiveThreshold.setDate(lastActiveThreshold.getDate()-_ActiveDeviceThresholdInDays)

      incomingDeviceObject.deviceIsActive = (incomingDeviceObject.deviceLastObserved>lastActiveThreshold)

      const prunedDeviceObject:any = this._utilities.pruneJsonObject(incomingDeviceObject,fieldsToPrune,true);

      await mongoose.model('Device').findOne({deviceName:prunedDeviceObject.deviceName}).then(async(result) => {
        if(result) {

          const existingDeviceObject:any = result._doc

          //Utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, prunedDeviceObject.deviceName, `.. found existing device`)
          let updateDeviceObject:any = {deviceName: existingDeviceObject.deviceName}

          const prunedDeviceObjectKeys = Object.keys(prunedDeviceObject);
          const existingDeviceObjectKeys = Object.getOwnPropertyNames(existingDeviceObject);

          updateDeviceObject.operatingSystem = this.normalizeOperatingSystem(existingDeviceObject, prunedDeviceObject)
          updateDeviceObject.deviceType = this.determineDeviceType(updateDeviceObject.operatingSystem, existingDeviceObject, prunedDeviceObject)

          // for(let i=0; i<existingDeviceObjectKeys.length; i++) {
          //   this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, prunedDeviceObject.deviceName, `.. found key: ${existingDeviceObjectKeys[i]}`)
          // }

          // iterate through the keys ..
          for(let j=0;j<prunedDeviceObjectKeys.length;j++) {

            const key = prunedDeviceObjectKeys[j]

            // does this key already exist for the retreived object?
            if(existingDeviceObjectKeys.includes(key)) {

              // if the key is different, we need add it to the update object
              if(existingDeviceObject[key]!==prunedDeviceObject[key]) {
                if(this._showDetails) {
                  this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Change, `${prunedDeviceObject.deviceName}.${key}: ${existingDeviceObject[key]} -> ${prunedDeviceObject[key]}`)
                }
                updateDeviceObject[key] = prunedDeviceObject[key]
              } else {
                if(this._showDetails) {
                  this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `${prunedDeviceObject.deviceName}.${key}: ${prunedDeviceObject[key]}`)
                }
              }
            } else {
              // is the key value undefined?
              if(prunedDeviceObject[key]!=undefined) {
                // add the new key
                updateDeviceObject[key] = prunedDeviceObject[key];
                if(this._showDetails) {
                  this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Add, `${prunedDeviceObject.deviceName}.${key}: ${prunedDeviceObject[key]}`)
                }
              }
            }
          }

          // do we have pending updates?
          if(Object.keys(updateDeviceObject).length>0) {
            if(this._showDetails) {
              this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Info, `${prunedDeviceObject.deviceName}.${Object.keys(updateDeviceObject).length} updates needed.`)
            }

            try {
              await mongoose.model('Device').updateOne(
                { deviceName: prunedDeviceObject.deviceName},
                {
                  $set: updateDeviceObject
                },
                {
                  new: true,
                  upsert: true,
                }
              )
            } catch(err:any) {
              this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, `${prunedDeviceObject.deviceName}: ${err.toString()}`)
            }

          }
        } else {
          isNewDevice = true;

          //Utilities.AddLogEntry(Utilities.LogEntrySeverity.Add, `.. new device detected: ${prunedDeviceObject.deviceName}`)

          prunedDeviceObject.deviceFirstObserved = new Date()
          const emptyDeviceObject:any = {deviceName: prunedDeviceObject.deviceName}
          prunedDeviceObject.operatingSystem = this.normalizeOperatingSystem(emptyDeviceObject, prunedDeviceObject)

          await mongoose.model('Device').updateOne(
            { deviceName: prunedDeviceObject.deviceName },
            {
              $set: prunedDeviceObject
            },
            {
              new: true,
              upsert: true
            }
          );
        }
      },
      (reason:any) => {
        throw reason
      }
      )

      this._utilities.logStack.pop();
      return new Promise<boolean>((resolve) => {resolve(isNewDevice)})

    }


    private isEqualDates(d1:Date, d2:Date):boolean {

      let output = false;

      try {
        output = (d1.getTime()===d2.getTime())

      } catch(err) {
        //Utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, 'isEqualDates', `${err}`)
        throw(err)
      }

      return output
    }

    private determineDeviceType(determinedOperatingSystem:string, existingDeviceObject:any, newDeviceObject:any):string {

      let output:any = 'UNKNOWN'
      this._utilities.logStack.push('determineDeviceType')

      try {

        if(determinedOperatingSystem.includes('server')) {
          output = "Server"
        }
        else if(Object.keys(existingDeviceObject).includes('azureDeviceCategory')) {
          if(existingDeviceObject.azureDeviceCategory==='Printer') {
            output = 'Printer'
          }
        }


        // get the azuredevicetype

      } catch(err) {
        //Utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, 'determineDeviceType', `${err}`)
        throw(err)
      }

      this._utilities.logStack.pop();

      return output

    }

    private normalizeOperatingSystem(existingDeviceObject:any, newDeviceObject:any):string {

      let output:any = 'UNKNOWN';
      this._utilities.logStack.push('normalizeOperatingSystem')

      // these should be in REVERSE priority order because each subsequent value will supercede prior ones.
      const keys = [
        'activeDirectoryOperatingSystem',
        'azureOperatingSystem',
        'azureManagedOperatingSystem',
        'crowdstrikeOSVersion',
      ]

      type allValuesType = {
        [key: string]: string | undefined
      }

    const allValues:allValuesType = {}

      try {

        for(let i=0;i<keys.length;i++) {
          if(newDeviceObject[keys[i]])  {
            allValues[keys[i]]=newDeviceObject[keys[i]]?.toString()
          } else if(existingDeviceObject[keys[i]]) {
            allValues[keys[i]]=existingDeviceObject[keys[i]]?.toString()
          }
        }

        for(let i=0; i<Object.keys(allValues).length; i++) {
          Object.values(allValues)[0]
        }

        Object.keys(allValues).length>0 ? output=Object.values(allValues)[0]?.toString() : 'UNKNOWN'


      } catch(err) {
        this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, `${newDeviceObject.deviceName}: ${err}`)
        throw(err)
      }

      //Utilities.AddLogEntry(Utilities.LogEntrySeverity.Debug, newDeviceObject.deviceName, `.. using OS: ${output}`)

      this._utilities.logStack.pop();
      return output;

    }
  }

  export class CheckDB {

    constructor(logStack:string[], showDetails:boolean=false, showDebug:boolean=false) {
      this._utilities = new Utilities(logStack, showDetails, showDebug);
    }
    private _utilities:Utilities=new Utilities([])

    public async checkMongoDatabase(mongoAdminURI:string, mongoURI:string, db:string):Promise<boolean> {
      this._utilities.logStack.push('checkMongoDatabase');
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Info, `verifying db: ${db}`)
      let output:boolean = false;
      
      try {

        const initClient = new MongoClient(mongoAdminURI);
        let initDB = initClient.db()
        const initAdmin = initDB.admin();
        const dbInfo = await initAdmin.listDatabases();

        const dbObject = dbInfo.databases.find(element => element.name==db)
        if(dbObject) {

          this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `.. found db ${db} (size is ${dbObject.sizeOnDisk}b)`)
          mongoose.connect(`${mongoURI}`)

          const assetDB = initClient.db(db)
          const admin = assetDB.admin()

          output = await this.verifyCollection(admin, "devices", DeviceSchema);

        }
        else {
          throw(`.. db ${db} not found.`)  
        }

      } catch (err:any) {
        this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, err)
        throw(err)
      }

      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `.. check complete.`)
      this._utilities.logStack.pop()
      return new Promise<boolean>((resolve) => {resolve(output)})

    }

    private async verifyCollection(admin:mongoose.mongo.Admin, collectionName:string, collectionSchema:mongoose.Schema):Promise<boolean> {
      this._utilities.logStack.push('verifyCollection')
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Info, `verifying collection ${collectionName} .. `)
      let output:boolean = false

      try {
        const collectionExists:boolean = await this.validateCollection(admin, collectionName)
        if(collectionExists) {
          this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `.. collection ${collectionName} ok. `)
        } else {
          this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Info, `.. collection ${collectionName} does not exist`)
          await this.createCollection(collectionName, collectionSchema)
        }
      } catch (err:any) {
        this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, err)
        throw(err)
      }
      
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `collection verified`)
      this._utilities.logStack.pop()
      return new Promise<boolean>((resolve) => {resolve(output)})
    }

    private async validateCollection(admin:mongoose.mongo.Admin, collectionName:string):Promise<boolean> {
      this._utilities.logStack.push('validateCollection')
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Info, `validating collection ${collectionName} .. `)
      let output:boolean = false

      try {
        const doc = await admin.validateCollection(collectionName)
        this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `.. collection ${collectionName} OK. (found ${doc} records)`)
        output=true
      } catch (err:any) {
        this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, err)
        throw(err)
      }
          
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Info, `collection ${collectionName} verified. `)
      this._utilities.logStack.pop()
      return new Promise<boolean>((resolve) => {resolve(output)})
    }

    private async createCollection(collectionName:string, collectionSchema:mongoose.Schema) {
      this._utilities.logStack.push('createCollection')
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Info, `creating collection ${collectionName} .. `)
      let output:boolean = false

      try {
        const mongoCollection:mongo.Collection = await mongoose.model(collectionName, collectionSchema).createCollection()
        output = true
      } catch (err:any) {
        this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, err)
        throw(err)
      }

      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Info, `collection ${collectionName} created`)
      this._utilities.logStack.pop()
      return new Promise<boolean>((resolve) => {resolve(output)})
    }
  }

}