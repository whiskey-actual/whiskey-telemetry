import { Client } from 'ldapts'
import { WhiskeyUtilities } from 'whiskey-utilities'
import { ActiveDirectoryDevice } from '../Device'
import sql from 'mssql'
import fs from 'fs'


export class ActiveDirectory
{

  constructor(logStack:string[], showDetails:boolean=false, showDebug:boolean=false) {
    this._logStack=logStack;
    this._showDetails=showDetails;
    this._showDebug=showDebug;
  }
  _logStack:string[]=[]
  _showDetails:boolean=false;
  _showDebug:boolean=false;
  

  public async query(ldapURL:string, bindDN:string, pw:string, searchDN:string, isPaged:boolean=true, sizeLimit:number=500):Promise<ActiveDirectoryDevice[]> {

    let output:Array<ActiveDirectoryDevice> = []
    this._logStack.push('query')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, 'initializing ..')


    const client = new Client(
      {
        url: ldapURL,
        tlsOptions:
          {
            rejectUnauthorized: false
          }
      }
    );

    try {

      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, '.. binding LDAP ..')

      await client.bind(bindDN, pw);

      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. authenticated successfully ..')
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, '.. querying devices ..')

      const { searchEntries, searchReferences } = await client.search(searchDN,  {
        filter: '&(objectClass=computer)',
        paged: isPaged,
        sizeLimit: sizeLimit
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
          activeDirectoryLogonCount: isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount),
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
    return new Promise<ActiveDirectoryDevice[]>((resolve) => {resolve(output)})

  }

  public async persist(sqlConfig:any, devices:ActiveDirectoryDevice[]):Promise<Boolean> {

    this._logStack.push("persist");
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `persisting ${devices.length} devices ..`)

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `.. connecting to mssql @ ${sqlConfig.server} ..`)
    let pool = await sql.connect(sqlConfig)
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `.. connected, persisting devices .. `)

    for(let i=0; i<devices.length; i++) {
      try {
        let result = await pool.request()
        .input('deviceName', sql.VarChar(64), devices[i].deviceName)
        .input('activeDirectoryDN', sql.VarChar(255), devices[i].activeDirectoryDN)
        .input('activeDirectoryOperatingSystem', sql.VarChar(255), devices[i].activeDirectoryOperatingSystem)
        .input('activeDirectoryOperatingSystemVersion', sql.VarChar(255), devices[i].activeDirectoryOperatingSystemVersion)
        .input('activeDirectoryDNSHostName', sql.VarChar(255), devices[i].activeDirectoryDNSHostName)
        .input('activeDirectoryLogonCount', sql.Int, devices[i].activeDirectoryLogonCount)
        .input('activeDirectoryWhenCreated', sql.DateTime2, devices[i].activeDirectoryWhenCreated)
        .input('activeDirectoryWhenChanged', sql.DateTime2, devices[i].activeDirectoryWhenChanged)
        .input('activeDirectoryLastLogon', sql.DateTime2, devices[i].activeDirectoryLastLogon)
        .input('activeDirectoryPwdLastSet', sql.DateTime2, devices[i].activeDirectoryPwdLastSet)
        .input('activeDirectoryLastLogonTimestamp', sql.DateTime2, devices[i].activeDirectoryLastLogonTimestamp)
        .execute('sp_add_device_activeDirectory')

        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Debug, this._logStack, `${result}`)
        
      }
      catch(err) {
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `ERR: ${err}`)
        this._logStack.pop()
        throw(err)
      }
    }

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `done.`)
    
    this._logStack.pop()
    return new Promise<Boolean>((resolve) => {resolve(true)})
  }

  private ldapTimestampToJS(timestamp:string):Date {
    return new Date(parseInt(timestamp) / 1e4 - 1.16444736e13)
  }

}
