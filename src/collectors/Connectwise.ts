import axios from 'axios'
import { WhiskeyUtilities } from 'whiskey-utilities'
import { Device } from '../Device'


export class Connectwise
{

  constructor(logStack:string[]) {
    this._logStack=logStack;
  }

  _logStack:string[]=[]

  public async query(baseURL:string, clientId:string, userName:string, password:string):Promise<Device[]> {

    let output:Array<Device> = []
    this._logStack.push('Connectwise')
    this._logStack.push('query')

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'init ..')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'getting access token ..')
    const instance = axios.create({baseURL: baseURL, headers: {clientId: clientId}});
    const response = await instance.post('/apitoken', { UserName: userName, Password: password});
    const accessToken = response.data.AccessToken;
    instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. received accessToken; querying devices ..`)

    const queryResponse = await instance.get('/Computers?pagesize=10000&orderby=ComputerName asc')
    const computers = queryResponse.data
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. ${computers.length} devices received.`)
    for(let i=0; i<computers.length; i++) {
      let d:Device = {deviceName: computers[i].ComputerName.toString()}
      output.push(d)
    }

    this._logStack.pop()
    this._logStack.pop()
    return new Promise<Device[]>((resolve) => {resolve(output)})
  }

}
