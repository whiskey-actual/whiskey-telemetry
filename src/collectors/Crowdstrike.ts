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

    const startDate = new Date()

    for(let i=0; i<foundDevices.length; i++) {

      try {

        await instance.get(`/devices/entities/devices/v1?ids=${foundDevices[i]}`).then((response:any) => {
          const deviceDetails = response.data.resources[0];
          let q = new sql.Request()
          .input('deviceName', sql.VarChar(255), deviceDetails.hostname.toString())
          .input('crowdstrikeDeviceId', sql.VarChar(255), deviceDetails.device_id)
          .input('crowdstrikeCID', sql.VarChar(255), deviceDetails.cid)
          .input('crowdstrikeAgentVersion', sql.VarChar(255), deviceDetails.agent_version)
          .input('crowdstrikeBIOSManufacturer', sql.VarChar(255), deviceDetails.bios_manufacturer)
          .input('crowdstrikeBIOSVersion', sql.VarChar(255), deviceDetails.bios_version)
          .input('crowdstrikeExternalIP', sql.VarChar(255), deviceDetails.external_ip)
          .input('crowdstrikeMACAddress', sql.VarChar(255), deviceDetails.mac_address)
          .input('crowdstrikeLocalIP', sql.VarChar(255), deviceDetails.local_ip)
          .input('crowdstrikeMachineDomain', sql.VarChar(255), deviceDetails.machine_domain)
          .input('crowdstrikeMajorVersion', sql.VarChar(255), deviceDetails.major_version)
          .input('crowdstrikeMinorVersion', sql.VarChar(255), deviceDetails.minor_version)
          .input('crowdstrikeOSBuild', sql.VarChar(255), deviceDetails.os_build)
          .input('crowdstrikeOSVersion', sql.VarChar(255), deviceDetails.os_version)
          .input('crowdstrikePlatformName', sql.VarChar(255), deviceDetails.platform_name)
          .input('crowdstrikeReducedFunctionalityMode', sql.VarChar(255), deviceDetails.reduced_functionality_mode)
          .input('crowdstrikeProductTypeDesc', sql.VarChar(255), deviceDetails.product_type_desc)
          .input('crowdstrikeProvisionStatus', sql.VarChar(255), deviceDetails.provision_status)
          .input('crowdstrikeSerialNumber', sql.VarChar(255), deviceDetails.serial_number)
          .input('crowdstrikeServicePackMajor', sql.VarChar(255), deviceDetails.service_pack_major)
          .input('crowdstrikeServicePackMinor', sql.VarChar(255), deviceDetails.service_pack_minor)
          .input('crowdstrikeStatus', sql.VarChar(255), deviceDetails.status)
          .input('crowdstrikeSystemManufacturer', sql.VarChar(255), deviceDetails.system_manufacturer)
          .input('crowdstrikeSystemProductName', sql.VarChar(255), deviceDetails.system_product_name)
          .input('crowdstrikeFirstSeenDateTime', sql.VarChar(255), new Date(deviceDetails.first_seen))
          .input('crowdstrikeLastSeenDateTime', sql.VarChar(255), new Date(deviceDetails.last_seen))
          .input('crowdstrikeModifiedDateTime', sql.VarChar(255), new Date(deviceDetails.modified_timestamp))
          .input('crowdstrikeKernelVersion', sql.VarChar(255), deviceDetails.kernel_version)
          output.sqlRequests.push(q)
        })
      } catch(err) {
          WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `error: ${err}`)
      }

      if(i>0 && i%100==0) {
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, WhiskeyUtilities.getProgressMessage('','processed',i,foundDevices.length,startDate,new Date()));
      }

    }
  
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