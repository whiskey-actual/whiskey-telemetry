import https from 'https'
import axios from 'axios'
import { WhiskeyUtilities } from 'whiskey-utilities'
import { ConnectwiseDevice } from '../Device'


export class Connectwise
{

  constructor(logStack:string[], showDetails:boolean=false, showDebug:boolean=false) {
    this._logStack=logStack;
    this._showDetails=showDetails;
    this._showDebug=showDebug;
  }
  _logStack:string[]=[]
  _showDetails:boolean=false;
  _showDebug:boolean=false;
  
  public async query(baseURL:string, clientId:string, userName:string, password:string):Promise<ConnectwiseDevice[]> {

    let output:Array<ConnectwiseDevice> = []
    this._logStack.push('Connectwise')
    this._logStack.push('query')

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'initializing ..')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. getting access token ..')

    const httpsAgent = new https.Agent({ rejectUnauthorized: false})
    axios.defaults.httpsAgent=httpsAgent;
    const instance = axios.create({baseURL: baseURL, headers: {clientId: clientId}});
    const response = await instance.post('/apitoken', { UserName: userName, Password: password});
    const accessToken = response.data.AccessToken;
    instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. received accessToken ..`)

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. querying computers ..`)
    const queryComputers = await instance.get('/Computers?pagesize=10000&orderby=ComputerName asc')
    const computers = queryComputers.data
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. ${computers.length} devices received.`)
    for(let i=0; i<computers.length; i++) {
      let d:ConnectwiseDevice = {
        deviceName: computers[i].ComputerName.toString(),
        observedByConnectwise: true,
        connectwiseId: computers[i].Id,
        connectwiseLocation: computers[i].Location.Name,
        connectwiseClient: computers[i].Client.Name,
        connectwiseOperatingSystem: computers[i].OperatingSystemName,
        connectwiseOperatingSystemVersion: computers[i].OperatingSystemVersion,
        connectwiseDomainName: computers[i].DomainName,
        connectwiseLastObserved: computers[i].RemoteAgentLastContact,
        connectwiseAgentVersion: computers[i].RemoteAgentVersion,
        connectwiseComment: computers[i].Comment,
        connectwiseWindowsUpdateDate: computers[i].WindowsUpdateDate,
        connectwiseAntivirusDefinitionDate: computers[i].AntivirusDefinitionDate,
        connectwiseTotalMemory: computers[i].TotalMemory,
        connectwiseFreeMemory: computers[i].FreeMemory,
        connectwiseIpAddress: computers[i].LocalIPAddress,
        connectwiseMacAddress: computers[i].MACAddress,
        connectwiseLastUserName: computers[i].LastUserName,
        connectwiseFirstSeen: computers[i].DateAdded,
        connectwiseType: computers[i].Type,
        connectwiseStatus: computers[i].Status,
        connectwiseSerialNumber: computers[i].SerialNumber,
        connectwiseBiosManufacturer: computers[i].BiosManufacturer,
        connectwiseModel: computers[i].Model,
        connectwiseDescription: computers[i].Description,
      }
      output.push(d)
    }

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. querying network devices ..`)
    const queryNetworkDevices = await instance.get('/NetworkDevices?pagesize=10000&orderby=Name asc')
    const networkDevices = queryNetworkDevices.data
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. ${networkDevices.length} devices received.`)
    for(let i=0; i<computers.length; i++) {
      let d:ConnectwiseDevice = {
        deviceName: computers[i].ComputerName.toString(),
        observedByConnectwise: true,
        connectwiseId: computers[i].Id,
        connectwiseLocation: computers[i].Location.Name,
        connectwiseClient: computers[i].Client.Name,
        connectwiseOperatingSystem: computers[i].OperatingSystemName,
        connectwiseOperatingSystemVersion: computers[i].OperatingSystemVersion,
        connectwiseDomainName: computers[i].DomainName,
        connectwiseLastObserved: computers[i].RemoteAgentLastContact,
        connectwiseAgentVersion: computers[i].RemoteAgentVersion,
        connectwiseComment: computers[i].Comment,
        connectwiseWindowsUpdateDate: computers[i].WindowsUpdateDate,
        connectwiseAntivirusDefinitionDate: computers[i].AntivirusDefinitionDate,
        connectwiseTotalMemory: computers[i].TotalMemory,
        connectwiseFreeMemory: computers[i].FreeMemory,
        connectwiseIpAddress: computers[i].LocalIPAddress,
        connectwiseMacAddress: computers[i].MACAddress,
        connectwiseLastUserName: computers[i].LastUserName,
        connectwiseFirstSeen: computers[i].DateAdded,
        connectwiseType: computers[i].Type,
        connectwiseStatus: computers[i].Status,
        connectwiseSerialNumber: computers[i].SerialNumber,
        connectwiseBiosManufacturer: computers[i].BiosManufacturer,
        connectwiseModel: computers[i].Model,
        connectwiseDescription: computers[i].Description,
      }
      output.push(d)
    }

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. done.')
    this._logStack.pop()
    this._logStack.pop()
    return new Promise<ConnectwiseDevice[]>((resolve) => {resolve(output)})
  }

}
