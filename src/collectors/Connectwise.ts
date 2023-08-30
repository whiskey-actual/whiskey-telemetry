import https from 'https'
import axios from 'axios'
import { WhiskeyUtilities } from 'whiskey-utilities'
import { Device } from '../Device'


export class Connectwise
{

  constructor(logStack:string[], baseURL:string, clientId:string, userName:string, password:string) {
    this._logStack=logStack;
    this._baseURL=baseURL
    this._clientId=clientId
    this._userName=userName
    this._password=password
  }

  _logStack:string[]=[]
  _baseURL:string=''
  _clientId:string=''
  _userName:string=''
  _password:string=''

  public async query():Promise<Device[]> {

    let output:Array<Device> = []
    this._logStack.push('Connectwise')
    this._logStack.push('query')

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'initializing ..')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. getting access token ..')

    const httpsAgent = new https.Agent({ rejectUnauthorized: false})
    axios.defaults.httpsAgent=httpsAgent;
    const instance = axios.create({baseURL: this._baseURL, headers: {clientId: this._clientId}});
    const response = await instance.post('/apitoken', { UserName: this._userName, Password: this._password});
    const accessToken = response.data.AccessToken;
    instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. received accessToken ..`)

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. querying computers ..`)
    const queryComputers = await instance.get('/Computers?pagesize=10000&orderby=ComputerName asc')
    const computers = queryComputers.data
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. ${computers.length} devices received.`)
    for(let i=0; i<computers.length; i++) {
      let d:Device = {deviceName: computers[i].ComputerName.toString()}
      d.connectwiseId = computers[i].Id;
      d.connectwiseLocation = computers[i].Location.Name;
      d.connectwiseClient = computers[i].Client.Name;
      d.connectwiseOperatingSystem = computers[i].OperatingSystemName;
      d.connectwiseOperatingSystemVersion = computers[i].OperatingSystemVersion;
      d.connectwiseDomainName = computers[i].DomainName;
      d.connectwiseLastObserved = computers[i].RemoteAgentLastContact;
      d.connectwiseAgentVersion = computers[i].RemoteAgentVersion;
      d.connectwiseComment = computers[i].Comment;
      d.connectwiseWindowsUpdateDate = computers[i].WindowsUpdateDate;
      d.connectwiseAntivirusDefinitionDate = computers[i].AntivirusDefinitionDate;
      d.connectwiseTotalMemory = computers[i].TotalMemory;
      d.connectwiseFreeMemory = computers[i].FreeMemory;
      d.connectwiseIpAddress = computers[i].LocalIPAddress;
      d.connectwiseMacAddress = computers[i].MACAddress;
      d.connectwiseLastUserName = computers[i].LastUserName;
      d.connectwiseFirstSeen = computers[i].DateAdded;
      d.connectwiseType = computers[i].Type;
      d.connectwiseStatus = computers[i].Status;
      d.connectwiseSerialNumber = computers[i].SerialNumber;
      d.connectwiseBiosManufacturer = computers[i].BiosManufacturer;
      d.observedByConnectwise = true;
      output.push(d)
    }

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. querying network devices ..`)
    const queryNetworkDevices = await instance.get('/NetworkDevices?pagesize=10000&orderby=Name asc')
    const networkDevices = queryNetworkDevices.data
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. ${networkDevices.length} devices received.`)
    for(let i=0; i<computers.length; i++) {
      let d:Device = {deviceName: computers[i].ComputerName.toString()}
      d.connectwiseId = computers[i].Id;
      d.connectwiseLocation = computers[i].Location.Name;
      d.connectwiseType = computers[i].Type;
      d.connectwiseMacAddress = computers[i].MACAddress;
      d.connectwiseFirstSeen = computers[i].DateAdded;
      d.connectwiseLastObserved = computers[i].RemoteAgentLastContact;
      d.connectwiseBiosManufacturer = computers[i].BiosManufacturer;
      d.connectwiseModel = computers[i].ModelName;
      d.connectwiseDescription = computers[i].Description;
      d.connectwiseClient = computers[i].Client.Name;
      d.observedByConnectwise = true;
      output.push(d)
    }

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. done.')
    this._logStack.pop()
    this._logStack.pop()
    return new Promise<Device[]>((resolve) => {resolve(output)})
  }

}
