import mongoose, { Mongoose } from "mongoose";
import { WhiskeyUtilities } from "whiskey-utilities";

export class MongoPersister {

  constructor(logStack:string[], mongoConnection:Mongoose, showDetails:boolean=false, debugOutput:boolean=false) {
    this._logStack = logStack;
    this._mongoConnection = mongoConnection
    this._showDetails=showDetails
    this._debugOutput=debugOutput
  }

  _minDate:Date = new Date(-8640000000000000);
  _logStack:string[]=[]
  _mongoConnection:Mongoose=new Mongoose()
  _showDetails:Boolean = false
  _debugOutput = false

  public async persistDevices(deviceObjects:any[], logFrequency:number=1000):Promise<Number> {
    this._logStack.push("persistDevices");
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `persisting ${deviceObjects.length} devices ..`)

    try {
      const startDate = new Date()
      for(let i=0;i<deviceObjects.length; i++) {
        const isNewDevice = await this.persistDevice(deviceObjects[i])
        if(i>0 && i%logFrequency==0) {
          WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, WhiskeyUtilities.getProgressMessage('', 'persisted', i, deviceObjects.length, startDate, new Date()));
        }
        if(isNewDevice) {
          WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Add, this._logStack, `.. persisted new device: ${deviceObjects[i].deviceName}`)
        }
      }
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. persisted ${deviceObjects.length} devices`)
    } catch(err) {
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `${err}`)
      throw(err);
    }

    this._logStack.pop();
    return new Promise<Number>((resolve) => {resolve(deviceObjects.length)})

  }

  private async persistDevice(incomingDeviceObject:any):Promise<Boolean> {

    let isNewDevice:boolean=false;

    this._logStack.push("persistDevice");

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

    incomingDeviceObject.deviceLastObserved = this.getMaxDate(incomingDeviceObject, dateFields);

    let lastActiveThreshold:Date= new Date()
    lastActiveThreshold.setDate(lastActiveThreshold.getDate()-30)

    incomingDeviceObject.deviceIsActive = (incomingDeviceObject.deviceLastObserved>lastActiveThreshold)

    const prunedDeviceObject:any = this.pruneObject(incomingDeviceObject,fieldsToPrune,true);

    await mongoose.model('Device').findOne({deviceName:prunedDeviceObject.deviceName}).then(async(result) => {
      if(result) {

        const existingDeviceObject:any = result._doc

        //WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, prunedDeviceObject.deviceName, `.. found existing device`)
        let updateDeviceObject:any = {deviceName: existingDeviceObject.deviceName}

        const prunedDeviceObjectKeys = Object.keys(prunedDeviceObject);
        const existingDeviceObjectKeys = Object.getOwnPropertyNames(existingDeviceObject);

        updateDeviceObject.operatingSystem = this.normalizeOperatingSystem(existingDeviceObject, prunedDeviceObject)
        updateDeviceObject.deviceType = this.determineDeviceType(updateDeviceObject.operatingSystem, existingDeviceObject, prunedDeviceObject)

        // for(let i=0; i<existingDeviceObjectKeys.length; i++) {
        //   WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, prunedDeviceObject.deviceName, `.. found key: ${existingDeviceObjectKeys[i]}`)
        // }

        // iterate through the keys ..
        for(let j=0;j<prunedDeviceObjectKeys.length;j++) {

          const key = prunedDeviceObjectKeys[j]

          // does this key already exist for the retreived object?
          if(existingDeviceObjectKeys.includes(key)) {

            // if the key is different, we need add it to the update object
            if(existingDeviceObject[key]!==prunedDeviceObject[key]) {
              if(this._showDetails) {
                WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Change, this._logStack, `${prunedDeviceObject.deviceName}.${key}: ${existingDeviceObject[key]} -> ${prunedDeviceObject[key]}`)
              }
              updateDeviceObject[key] = prunedDeviceObject[key]
            } else {
              if(this._showDetails) {
                WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `${prunedDeviceObject.deviceName}.${key}: ${prunedDeviceObject[key]}`)
              }
            }
          } else {
            // is the key value undefined?
            if(prunedDeviceObject[key]!=undefined) {
              // add the new key
              updateDeviceObject[key] = prunedDeviceObject[key];
              if(this._showDetails) {
                WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Add, this._logStack, `${prunedDeviceObject.deviceName}.${key}: ${prunedDeviceObject[key]}`)
              }
            }
          }
        }

        // do we have pending updates?
        if(Object.keys(updateDeviceObject).length>0) {
          if(this._showDetails) {
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `${prunedDeviceObject.deviceName}.${Object.keys(updateDeviceObject).length} updates needed.`)
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
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `${prunedDeviceObject.deviceName}: ${err.toString()}`)
          }

        }
      } else {
        isNewDevice = true;

        //WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Add, this._logStack, `.. new device detected: ${prunedDeviceObject.deviceName}`)

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

    this._logStack.pop();
    return new Promise<boolean>((resolve) => {resolve(isNewDevice)})

  }

  private pruneObject(obj:any, keys:string[], valueToKeep:any):any {
    for(let i=0; i<keys.length; i++) {
      if(Object.keys(obj).includes(keys[i]) && (obj[keys[i]]!=valueToKeep || obj[keys[i]]===undefined)) {
        if(this._debugOutput) { WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Debug, this._logStack, `${obj.deviceName} :: pruning key: ${[keys[i]]} (${obj[keys[i]]})`) }
        delete obj[keys[i]]
      }
      else {
        if(this._debugOutput) { WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Debug, this._logStack, `${obj.deviceName} :: keeping key: ${[keys[i]]} (${obj[keys[i]]})`) }
      }
    }
    return obj
  }

  private isEqualDates(d1:Date, d2:Date):boolean {

    let output = false;

    try {
      output = (d1.getTime()===d2.getTime())

    } catch(err) {
      //WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, 'isEqualDates', `${err}`)
      throw(err)
    }

    return output
  }

  private determineDeviceType(determinedOperatingSystem:string, existingDeviceObject:any, newDeviceObject:any):string {

    let output:any = 'UNKNOWN'
    this._logStack.push('determineDeviceType')

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
      //WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, 'determineDeviceType', `${err}`)
      throw(err)
    }

    this._logStack.pop();

    return output

  }

  private getMaxDate(obj:any, keys:string[]):Date {

    let output:Date = this._minDate

    let dates:Date[] = []

    for(let i=0; i<keys.length; i++) {
      if(Object.keys(obj).includes(keys[i])) {
        dates.push(new Date(obj[keys[i]]));
      }
    }

    for(let i=0;i<dates.length; i++) {
      if(dates[i]>output) { output=dates[i] }
    }

    return output


  }

  private normalizeOperatingSystem(existingDeviceObject:any, newDeviceObject:any):string {

    let output:any = 'UNKNOWN';
    this._logStack.push('normalizeOperatingSystem')

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
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `${newDeviceObject.deviceName}: ${err}`)
      throw(err)
    }

    //WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Debug, newDeviceObject.deviceName, `.. using OS: ${output}`)

    this._logStack.pop();
    return output;

  }
}
