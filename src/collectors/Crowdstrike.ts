import axios, { AxiosInstance } from 'axios'
import { WhiskeyUtilities } from 'whiskey-utilities'
import { CrowdstrikeDevice } from '../Device'


export class Crowdstrike
{

  constructor(logStack:string[], showDetails:boolean=false, showDebug:boolean=false) {
    this._logStack=logStack;
    this._showDetails=showDetails;
    this._showDebug=showDebug;
  }
  _logStack:string[]=[]
  _showDetails:boolean=false;
  _showDebug:boolean=false;
  


  public async query(baseURL:string, clientId:string, clientSecret:string):Promise<CrowdstrikeDevice[]> {

    let output:Array<CrowdstrikeDevice> = []
    this._logStack.push('Crowdstrike')
    this._logStack.push('query')

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'initializing ..')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. getting access token ..')

    const instance = axios.create({baseURL: baseURL});
    const response = await instance.post(`/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}`)

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. access token received; querying devices ..`)

    instance.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`

    output = await this.getDevices(instance);

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. ${output.length} devices received.`)

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. done.')
    this._logStack.pop()
    this._logStack.pop()
    return new Promise<CrowdstrikeDevice[]>((resolve) => {resolve(output)})
  }

  private async getDevices(instance:AxiosInstance):Promise<CrowdstrikeDevice[]> {

    this._logStack.push('getDevices')

    const foundDevices = (await instance.get("/devices/queries/devices-scroll/v1?limit=5000")).data.resources;

    //const foundDevices = response.data.resources

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. found ${foundDevices.length} devices; fetching details ..`)

    let devices:Array<CrowdstrikeDevice> = [];

    const startDate = new Date()

    for(let i=0; i<foundDevices.length; i++) {

      await instance.get(`/devices/entities/devices/v1?ids=${foundDevices[i]}`).then((response:any) => {

        try {
          const deviceDetails = response.data.resources[0];
          const d:CrowdstrikeDevice = {
            deviceName: deviceDetails.hostname.toString(),
            observedByCrowdstrike: true,
            crowdstrikeDeviceId: deviceDetails.device_id,
            crowdstrikeCID: deviceDetails.cid,
            crowdstrikeAgentVersion: deviceDetails.agent_version,
            crowdstrikeBIOSManufacturer: deviceDetails.bios_manufacturer,
            crowdstrikeBIOSVersion: deviceDetails.bios_version,
            crowdstrikeExternalIP: deviceDetails.external_ip,
            crowdstrikeMACAddress: deviceDetails.mac_address,
            crowdstrikeLocalIP: deviceDetails.local_ip,
            crowdstrikeMachineDomain: deviceDetails.machine_domain,
            crowdstrikeMajorVersion: deviceDetails.major_version,
            crowdstrikeMinorVersion: deviceDetails.minor_version,
            crowdstrikeOSBuild: deviceDetails.os_build,
            crowdstrikeOSVersion: deviceDetails.os_version,
            crowdstrikePlatformName: deviceDetails.platform_name,
            crowdstrikeReducedFunctionalityMode: deviceDetails.reduced_functionality_mode,
            crowdstrikeProductTypeDesc: deviceDetails.product_type_desc,
            crowdstrikeProvisionStatus: deviceDetails.provision_status,
            crowdstrikeSerialNumber: deviceDetails.serial_number,
            crowdstrikeServicePackMajor: deviceDetails.service_pack_major,
            crowdstrikeServicePackMinor: deviceDetails.service_pack_minor,
            crowdstrikeStatus: deviceDetails.status,
            crowdstrikeSystemManufacturer: deviceDetails.system_manufacturer,
            crowdstrikeSystemProductName: deviceDetails.system_product_name,
            crowdstrikeFirstSeenDateTime: new Date(deviceDetails.first_seen),
            crowdstrikeLastSeenDateTime: new Date(deviceDetails.last_seen),
            crowdstrikeModifiedDateTime: new Date(deviceDetails.modified_timestamp),
            crowdstrikeKernelVersion: deviceDetails.kernel_version,
          }

          devices.push(d)
        } catch(err:any) {
          WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `${err.toString()}`)
        }
      })

      if(i>0 && i%100==0) {
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, WhiskeyUtilities.getProgressMessage('','processed',i,foundDevices.length,startDate,new Date()));
      }

    }

    this._logStack.pop()
    return new Promise<CrowdstrikeDevice[]>((resolve) => {resolve(devices)})

  }
}
