import axios, { AxiosInstance } from 'axios'
import { Utilities } from 'whiskey-utilities'
import { SqlRequestCollection } from "../database/SqlRequestCollection";
import sql from 'mssql'


export class Crowdstrike
{

  constructor(logStack:string[], showDetails:boolean=false, showDebug:boolean=false) {
    this._showDetails=showDetails;
    this._showDebug=showDebug;
    this._utilities = new Utilities(logStack, showDetails, showDebug);
  }
  private _showDetails:boolean=false;
  private _showDebug:boolean=false;
  private _utilities:Utilities=new Utilities([])
  
  public async fetch(baseURL:string, clientId:string, clientSecret:string):Promise<SqlRequestCollection> {
   this._utilities.logStack.push('fetch')
    let output = new SqlRequestCollection("sp_add_Crowdstrike_device")
    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, 'initializing ..')

    try {

      // get access token
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, '.. getting access token ..')
      const instance = axios.create({baseURL: baseURL});
      const response = await instance.post(`/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}`)
      instance.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `.. access token received; querying devices ..`)

      const foundDevices = (await instance.get("/devices/queries/devices-scroll/v1?limit=5000")).data.resources;

    //const foundDevices = response.data.resources

    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `.. found ${foundDevices.length} devices; fetching details ..`)

    const startDate = new Date()

    for(let i=0; i<foundDevices.length; i++) {

      try {

        await instance.get(`/devices/entities/devices/v1?ids=${foundDevices[i]}`).then((response:any) => {
          const deviceDetails = response.data.resources[0];
          let q = new sql.Request()
          .input('deviceName', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.hostname))
          .input('crowdstrikeDeviceId', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.device_id))
          .input('crowdstrikeCID', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.cid))
          .input('crowdstrikeAgentVersion', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.agent_version))
          .input('crowdstrikeBIOSManufacturer', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.bios_manufacturer))
          .input('crowdstrikeBIOSVersion', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.bios_version))
          .input('crowdstrikeExternalIP', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.external_ip))
          .input('crowdstrikeMACAddress', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.mac_address))
          .input('crowdstrikeLocalIP', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.local_ip))
          .input('crowdstrikeMachineDomain', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.machine_domain))
          .input('crowdstrikeMajorVersion', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.major_version))
          .input('crowdstrikeMinorVersion', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.minor_version))
          .input('crowdstrikeOSBuild', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.os_build))
          .input('crowdstrikeOSVersion', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.os_version))
          .input('crowdstrikePlatformName', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.platform_name))
          .input('crowdstrikeReducedFunctionalityMode', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.reduced_functionality_mode))
          .input('crowdstrikeProductTypeDesc', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.product_type_desc))
          .input('crowdstrikeProvisionStatus', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.provision_status))
          .input('crowdstrikeSerialNumber', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.serial_number))
          .input('crowdstrikeServicePackMajor', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.service_pack_major))
          .input('crowdstrikeServicePackMinor', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.service_pack_minor))
          .input('crowdstrikeStatus', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.status))
          .input('crowdstrikeSystemManufacturer', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.system_manufacturer))
          .input('crowdstrikeSystemProductName', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.system_product_name))
          .input('crowdstrikeKernelVersion', sql.VarChar(255), this._utilities.CleanedString(deviceDetails.kernel_version))
          // datetimes
          .input('crowdstrikeFirstSeenDateTime', sql.DateTime2, this._utilities.CleanedDate(deviceDetails.first_seen))
          .input('crowdstrikeLastSeenDateTime', sql.DateTime2, this._utilities.CleanedDate(deviceDetails.last_seen))
          .input('crowdstrikeModifiedDateTime', sql.DateTime2, this._utilities.CleanedDate(deviceDetails.modified_timestamp))
          output.sqlRequests.push(q)
        })
      } catch(err) {
          this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, `error: ${err}`)
      }

      if(i>0 && i%100==0) {
        this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, this._utilities.getProgressMessage('','processed',i,foundDevices.length,startDate,new Date()));
      }

    }
  
    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, '.. done.')

    } catch(err) {
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, `${err}`)
      throw(err)
    } finally {
     this._utilities.logStack.pop()
    }

    return new Promise<SqlRequestCollection>((resolve) => {resolve(output)})
  }
}