import axios, { AxiosInstance } from 'axios'
import { WhiskeyUtilities } from 'whiskey-utilities'
import { Device } from '../Device'


export class Crowdstrike
{

  constructor(logStack:string[]) {
    this._logStack=logStack;
  }

  _logStack:string[]=[]

  public async query(baseURL:string, clientId:string, clientSecret:string):Promise<Device[]> {

    let output:Array<Device> = []
    this._logStack.push('Crowdstrike')
    this._logStack.push('query')

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'init ..')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'getting access token ..')

    const instance = axios.create({baseURL: baseURL});
    const response = await instance.post(`/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}`)

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. access token received; querying devices ..`)

    instance.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`

    output = await this.getDevices(instance);

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. ${output.length} devices received.`)

    this._logStack.pop()
    this._logStack.pop()
    return new Promise<Device[]>((resolve) => {resolve(output)})
  }

  private async getDevices(instance:AxiosInstance):Promise<Device[]> {

    this._logStack.push('getDevices')

    const foundDevices = (await instance.get("/devices/queries/devices-scroll/v1?limit=5000")).data.resources;

    //const foundDevices = response.data.resources

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. found ${foundDevices.length} devices; fetching details ..`)

    let devices:Array<Device> = [];

    const startDate = new Date()

    for(let i=0; i<foundDevices.length; i++) {

      await instance.get(`/devices/entities/devices/v1?ids=${foundDevices[i]}`).then((response:any) => {

        try {
          const deviceDetails = response.data.resources[0];
          const device:Device = {deviceName: deviceDetails.hostname.toString()}
          device.crowdstrikeDeviceId = deviceDetails.device_id ? deviceDetails.device_id.toString() : undefined
          device.crowdstrikeCID = deviceDetails.cid ? deviceDetails.cid.toString() : undefined
          device.crowdstrikeAgentVersion = deviceDetails.agent_version ? deviceDetails.agent_version.toString() : undefined
          device.crowdstrikeBIOSManufacturer = deviceDetails.bios_manufacturer ? deviceDetails.bios_manufacturer.toString() : undefined
          device.crowdstrikeBIOSVersion = deviceDetails.bios_version ? deviceDetails.bios_version.toString() : undefined
          device.crowdstrikeExternalIP = deviceDetails.external_ip ? deviceDetails.external_ip.toString() : undefined
          device.crowdstrikeMACAddress = deviceDetails.mac_address ? deviceDetails.mac_address.toString() : undefined
          device.crowdstrikeLocalIP = deviceDetails.local_ip ? deviceDetails.local_ip.toString() : undefined
          device.crowdstrikeMachineDomain = deviceDetails.machine_domain ? deviceDetails.machine_domain.toString() : undefined
          device.crowdstrikeMajorVersion = deviceDetails.major_version ? deviceDetails.major_version.toString() : undefined
          device.crowdstrikeMinorVersion = deviceDetails.minor_version ? deviceDetails.minor_version.toString() : undefined
          device.crowdstrikeOSBuild = deviceDetails.os_build ? deviceDetails.os_build .toString(): undefined
          device.crowdstrikeOSVersion = deviceDetails.os_version ? deviceDetails.os_version.toString() : undefined
          device.crowdstrikePlatformName = deviceDetails.platform_name ? deviceDetails.platform_name.toString() : undefined
          device.crowdstrikeReducedFunctionalityMode = deviceDetails.reduced_functionality_mode ? deviceDetails.reduced_functionality_mode.toString() : undefined
          device.crowdstrikeProductTypeDesc = deviceDetails.product_type_desc ? deviceDetails.product_type_desc.toString() : undefined
          device.crowdstrikeProvisionStatus = deviceDetails.provision_status ? deviceDetails.provision_status.toString() : undefined
          device.crowdstrikeSerialNumber = deviceDetails.serial_number ? deviceDetails.serial_number.toString() : undefined
          device.crowdstrikeServicePackMajor = deviceDetails.service_pack_major ? deviceDetails.service_pack_major.toString() : undefined
          device.crowdstrikeServicePackMinor = deviceDetails.service_pack_minor ? deviceDetails.service_pack_minor.toString() : undefined
          device.crowdstrikeStatus = deviceDetails.status ? deviceDetails.status.toString() : undefined
          device.crowdstrikeSystemManufacturer = deviceDetails.system_manufacturer ? deviceDetails.system_manufacturer.toString() : undefined
          device.crowdstrikeSystemProductName = deviceDetails.system_product_name ? deviceDetails.system_product_name.toString() : undefined
          device.crowdstrikeFirstSeenDateTime = new Date(deviceDetails.first_seen)
          device.crowdstrikeLastSeenDateTime = new Date(deviceDetails.last_seen)
          device.crowdstrikeModifiedDateTime = new Date(deviceDetails.modified_timestamp)
          device.crowdstrikeKernelVersion = deviceDetails.kernel_version ? deviceDetails.kernel_version.toString() : undefined
          device.observedByCrowdstrike = true
          devices.push(device)
        } catch(err:any) {
          WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `${err.toString()}`)
        }
      })

      if(i>0 && i%100==0) {
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, WhiskeyUtilities.getProgressMessage('','processed',i,foundDevices.length,startDate,new Date()));
      }

    }

    this._logStack.pop()
    return new Promise<Device[]>((resolve) => {resolve(devices)})

  }
}
