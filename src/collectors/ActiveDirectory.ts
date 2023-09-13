import { Client } from 'ldapts'
import { WhiskeyUtilities } from 'whiskey-utilities'
import { ActiveDirectoryDevice } from '../Device'
import sql from 'mssql'

export class ActiveDirectory
{

  public static sqlProcedure:string = 'sp_add_activeDirectory_device'

  constructor(logStack:string[], showDetails:boolean=false, showDebug:boolean=false) {
    this._logStack=logStack;
    this._showDetails=showDetails;
    this._showDebug=showDebug;
  }
  _logStack:string[]=[]
  _showDetails:boolean=false;
  _showDebug:boolean=false;
  

  public async fetch(ldapURL:string, bindDN:string, pw:string, searchDN:string, isPaged:boolean=true, sizeLimit:number=500):Promise<sql.Request[]> {

    let output:Array<sql.Request> = []
    this._logStack.push('fetch')
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
          activeDirectoryOperatingSystem: searchEntries[i].operatingSystem ? searchEntries[i].operatingSystem.toString() : undefined,
          activeDirectoryOperatingSystemVersion: searchEntries[i].operatingSystemVersion ? searchEntries[i].operatingSystemVersion.toString() : undefined,
          activeDirectoryDNSHostName: searchEntries[i].dNSHostName ? searchEntries[i].dNSHostName.toString(): undefined,
          activeDirectoryLogonCount: isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount),
          activeDirectoryWhenCreated: this.ldapTimestampToJS(searchEntries[i].whenCreated.toString()),
          activeDirectoryWhenChanged: searchEntries[i].whenChanged ? this.ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : undefined,
          activeDirectoryLastLogon: searchEntries[i].lastLogon ? this.ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : undefined,
          activeDirectoryPwdLastSet: searchEntries[i].pwdLastSet ? this.ldapTimestampToJS(searchEntries[i].pwdLastSet.toString()) : undefined,
          activeDirectoryLastLogonTimestamp: searchEntries[i].lastLogonTimestamp ? this.ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : undefined
        }

        const sqlStatement:sql.Request = await this.generateSqlStatement(device)

        output.push(sqlStatement)
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
    return new Promise<sql.Request[]>((resolve) => {resolve(output)})

  }

  private async generateSqlStatement(device:ActiveDirectoryDevice):Promise<sql.Request> {
    let output:sql.Request = new sql.Request()

    this._logStack.push("generateSqlStatements");

      try {
        let q = new sql.Request()
        .input('deviceName', sql.VarChar(64), device.deviceName)
        .input('activeDirectoryDN', sql.VarChar(255), device.activeDirectoryDN)
        .input('activeDirectoryOperatingSystem', sql.VarChar(255), device.activeDirectoryOperatingSystem)
        .input('activeDirectoryOperatingSystemVersion', sql.VarChar(255), device.activeDirectoryOperatingSystemVersion)
        .input('activeDirectoryDNSHostName', sql.VarChar(255), device.activeDirectoryDNSHostName)
        .input('activeDirectoryLogonCount', sql.Int, device.activeDirectoryLogonCount)
        .input('activeDirectoryWhenCreated', sql.DateTime2, device.activeDirectoryWhenCreated)
        .input('activeDirectoryWhenChanged', sql.DateTime2, device.activeDirectoryWhenChanged)
        .input('activeDirectoryLastLogon', sql.DateTime2, device.activeDirectoryLastLogon)
        .input('activeDirectoryPwdLastSet', sql.DateTime2, device.activeDirectoryPwdLastSet)
        .input('activeDirectoryLastLogonTimestamp', sql.DateTime2, device.activeDirectoryLastLogonTimestamp)
        output = q
      }
      catch(err) {
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `ERR: ${err}`)
        this._logStack.pop()
        throw(err)
      }
    
    this._logStack.pop()
    return new Promise<sql.Request>((resolve) => {resolve(output)})
  }

  private ldapTimestampToJS(timestamp:string):Date {
    return new Date(parseInt(timestamp) / 1e4 - 1.16444736e13)
  }

}
