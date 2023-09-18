import axios, { AxiosInstance } from 'axios'
import { WhiskeyUtilities } from 'whiskey-utilities'
import { SqlRequestCollection } from "../database/SqlRequestCollection";
import sql from 'mssql'


export class Crowdstrike
{

  constructor(logStack:string[], showDetails:boolean=false, showDebug:boolean=false) {
    this._logStack=logStack;
    this._showDetails=showDetails;
    this._showDebug=showDebug;
  }
  private _logStack:string[]=[]
  private _showDetails:boolean=false;
  private _showDebug:boolean=false;
  
  public async fetch(baseURL:string, clientId:string, clientSecret:string):Promise<SqlRequestCollection> {
    this._logStack.push('fetch')
    let output = new SqlRequestCollection("sp_add_Crowdstrike_device")
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'initializing ..')

    try {

      // get access token
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. getting access token ..')
      const instance = axios.create({baseURL: baseURL});
      const response = await instance.post(`/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}`)
      instance.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. access token received; querying devices ..`)

      const foundDevices = (await instance.get("/devices/queries/devices-scroll/v1?limit=5000")).data.resources;

    //const foundDevices = response.data.resources

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. found ${foundDevices.length} devices; fetching details ..`)

    let executionStack:any = []

    const startDate = new Date()

    for(let i=0; i<foundDevices.length; i++) {

      try {
        executionStack.push(
        await instance.get(`/devices/entities/devices/v1?ids=${foundDevices[i]}`).then((response:any) => {
          const deviceDetails = response.data.resources[0];
          let q = new sql.Request()
          .input('deviceName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.hostname))
          .input('crowdstrikeDeviceId', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.device_id))
          .input('crowdstrikeCID', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.cid))
          .input('crowdstrikeAgentVersion', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.agent_version))
          .input('crowdstrikeBIOSManufacturer', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.bios_manufacturer))
          .input('crowdstrikeBIOSVersion', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.bios_version))
          .input('crowdstrikeExternalIP', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.external_ip))
          .input('crowdstrikeMACAddress', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.mac_address))
          .input('crowdstrikeLocalIP', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.local_ip))
          .input('crowdstrikeMachineDomain', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.machine_domain))
          .input('crowdstrikeMajorVersion', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.major_version))
          .input('crowdstrikeMinorVersion', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.minor_version))
          .input('crowdstrikeOSBuild', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.os_build))
          .input('crowdstrikeOSVersion', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.os_version))
          .input('crowdstrikePlatformName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.platform_name))
          .input('crowdstrikeReducedFunctionalityMode', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.reduced_functionality_mode))
          .input('crowdstrikeProductTypeDesc', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.product_type_desc))
          .input('crowdstrikeProvisionStatus', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.provision_status))
          .input('crowdstrikeSerialNumber', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.serial_number))
          .input('crowdstrikeServicePackMajor', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.service_pack_major))
          .input('crowdstrikeServicePackMinor', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.service_pack_minor))
          .input('crowdstrikeStatus', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.status))
          .input('crowdstrikeSystemManufacturer', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.system_manufacturer))
          .input('crowdstrikeSystemProductName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.system_product_name))
          .input('crowdstrikeKernelVersion', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceDetails.kernel_version))
          // datetimes
          .input('crowdstrikeFirstSeenDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceDetails.first_seen))
          .input('crowdstrikeLastSeenDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceDetails.last_seen))
          .input('crowdstrikeModifiedDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceDetails.modified_timestamp))
          output.sqlRequests.push(q)
        }))
      } catch(err) {
          WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `error: ${err}`)
      }

    }

    await WhiskeyUtilities.executePromisesWithProgress(executionStack, this._logStack, 10)
  
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. done.')

    } catch(err) {
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `${err}`)
      throw(err)
    } finally {
      this._logStack.pop()
    }

    return new Promise<SqlRequestCollection>((resolve) => {resolve(output)})
  }
}