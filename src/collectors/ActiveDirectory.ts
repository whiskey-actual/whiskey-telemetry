import { Client } from 'ldapts'
import { WhiskeyUtilities } from 'whiskey-utilities'
import { ActiveDirectoryDevice } from '../Device'
import fs from 'fs'


export class ActiveDirectory
{

  constructor(logStack:string[], ldapURL:string, bindDN:string, pw:string, searchDN:string, filePathToCACert:string, isPaged:boolean=true, sizeLimit:number=500) {
    this._logStack=logStack;
    this._ldapURL=ldapURL
    this._bindDN=bindDN
    this._pw=pw
    this._searchDN=searchDN
    this._filePathToCACert=filePathToCACert
    this._isPaged=isPaged
    this._sizeLimit=sizeLimit
  }

  _logStack:string[]=[]
  _ldapURL:string=''
  _bindDN:string=''
  _pw:string=''
  _searchDN:string=''
  _filePathToCACert:string=''
  _isPaged:boolean=false
  _sizeLimit:number=500


  public async query():Promise<ActiveDirectoryDevice[]> {

    let output:Array<ActiveDirectoryDevice> = []
    this._logStack.push('ActiveDirectory')
    this._logStack.push('query')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, 'initializing ..')


    const client = new Client(
      {
        url: this._ldapURL,
        tlsOptions:
          {
            ca: [ fs.readFileSync(this._filePathToCACert) ],
            rejectUnauthorized: false
          }
      }
    );

    try {

      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, '.. binding LDAP ..')

      await client.bind(this._bindDN, this._pw);

      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. authenticated successfully ..')
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, '.. querying devices ..')

      const { searchEntries, searchReferences } = await client.search(this._searchDN,  {
        filter: '&(objectClass=computer)',
        paged: this._isPaged,
        sizeLimit: this._sizeLimit
      },);

      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. found ${searchEntries.length} devices .. `)
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `.. creating objects ..`)

      for(let i=0; i<searchEntries.length; i++) {
        const device:ActiveDirectoryDevice = {
          deviceName: searchEntries[i].cn.toString(),
          observedByActiveDirectory: true,
          activeDirectoryDN: searchEntries[i].dn.toString(),
          activeDirectoryOperatingSystem: searchEntries[i].operatingSystem? searchEntries[i].operatingSystem.toString() : undefined,
          activeDirectoryOperatingSystemVersion: searchEntries[i].operatingSystemVersion ? searchEntries[i].operatingSystemVersion.toString() : undefined,
          activeDirectoryDNSHostName: searchEntries[i].dNSHostName ? searchEntries[i].dNSHostName.toString(): undefined,
          activeDirectoryLogonCount: Number(searchEntries[i].logonCount)==Number.NaN ? 0 : Number(searchEntries[i].logonCount),
          activeDirectoryWhenCreated: this.ldapTimestampToJS(searchEntries[i].whenCreated.toString()),
          activeDirectoryWhenChanged: searchEntries[i].whenChanged ? this.ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : undefined,
          activeDirectoryLastLogon: searchEntries[i].lastLogon ? this.ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : undefined,
          activeDirectoryPwdLastSet: searchEntries[i].pwdLastSet ? this.ldapTimestampToJS(searchEntries[i].pwdLastSet.toString()) : undefined,
          activeDirectoryLastLogonTimestamp: searchEntries[i].lastLogonTimestamp ? this.ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : undefined
        }

        output.push(device)
        //WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, 'queryActiveDirectory', `${device.activeDirectoryName} (${device.activeDirectoryOperatingSystem})`)
      }
    } catch (ex) {
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `${ex}`)
      throw ex;
    } finally {
      await client.unbind();
    }

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. done.')
    this._logStack.pop()
    this._logStack.pop()
    return new Promise<ActiveDirectoryDevice[]>((resolve) => {resolve(output)})

  }

  private ldapTimestampToJS(timestamp:string):Date {
    return new Date(parseInt(timestamp) / 1e4 - 1.16444736e13)
  }

}
