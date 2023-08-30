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

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'init ..')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'getting access token ..')

    const httpsAgent = new https.Agent({ rejectUnauthorized: false})
    axios.defaults.httpsAgent=httpsAgent;
    const instance = axios.create({baseURL: this._baseURL, headers: {clientId: this._clientId}, httpsAgent: {rejectUnauthorized: false}});
    const response = await instance.post('/apitoken', { UserName: this._userName, Password: this._password});
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
