import { Client } from 'ldapts'
import { WhiskeyUtilities } from 'whiskey-utilities'
import { Device } from '../Device'
import fs from 'fs'


export class ActiveDirectory
{

  constructor(logStack:string[]) {
    this._logStack=logStack;
  }

  _logStack:string[]=[]

  public async query(ldapURL:string, bindDN:string, pw:string, searchDN:string, filePathToCACert:string, isPaged:boolean=true, sizeLimit:number=500):Promise<Device[]> {

    let output:Array<Device> = []
    this._logStack.push('ActiveDirectory')
    this._logStack.push('query')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'initializing..')


    const client = new Client(
      {
        url: ldapURL,
        tlsOptions:
          {
            ca: [ fs.readFileSync(filePathToCACert) ],
            rejectUnauthorized: false
          }
      }
    );

    try {

      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. binding LDAP ..')

      await client.bind(bindDN, pw);

      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. authenticated successfully, querying devices..  ')

      const { searchEntries, searchReferences } = await client.search(searchDN,  {
        filter: '&(objectClass=computer)',
        paged: isPaged,
        sizeLimit: sizeLimit
      },);

      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. found ${searchEntries.length} devices, creating objects .. `)

      for(let i=0; i<searchEntries.length; i++) {
        const device:Device = {deviceName: searchEntries[i].cn.toString()}
        device.observedByActiveDirectory = true;
        device.activeDirectoryDN = searchEntries[i].dn.toString();
        device.activeDirectoryWhenCreated=searchEntries[i].whenCreated ? this.ldapTimestampToJS(searchEntries[i].whenCreated.toString()) : undefined;
        device.activeDirectoryWhenChanged=searchEntries[i].whenChanged ? this.ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : undefined;
        device.activeDirectoryLastLogon=searchEntries[i].lastLogon ? this.ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : undefined;
        device.activeDirectoryPwdLastSet=searchEntries[i].pwdLastSet ? this.ldapTimestampToJS(searchEntries[i].pwdLastSet.toString()) : undefined;
        device.activeDirectoryLogonCount=searchEntries[i].logonCount ? Number(searchEntries[i].logonCount) : undefined
        device.activeDirectoryOperatingSystem=searchEntries[i].operatingSystem ? searchEntries[i].operatingSystem.toString() : undefined;
        device.activeDirectoryOperatingSystemVersion=searchEntries[i].operatingSystemVersion ? searchEntries[i].operatingSystemVersion.toString() : undefined;
        device.activeDirectoryDNSHostName=searchEntries[i].dNSHostName ? searchEntries[i].dNSHostName.toString() : undefined;
        device.activeDirectoryLastLogonTimestamp=searchEntries[i].lastLogonTimestamp ? this.ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : undefined;
        output.push(device)
        //WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, 'queryActiveDirectory', `${device.activeDirectoryName} (${device.activeDirectoryOperatingSystem})`)
      }
    } catch (ex) {
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `${ex}`)
      throw ex;
    } finally {
      await client.unbind();
    }

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `done.`)
    this._logStack.pop()
    this._logStack.pop()
    return new Promise<Device[]>((resolve) => {resolve(output)})

  }

  private ldapTimestampToJS(timestamp:string):Date {
    return new Date(parseInt(timestamp) / 1e4 - 1.16444736e13)
  }

}
