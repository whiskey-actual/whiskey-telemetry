import { Client } from 'ldapts'
import { Utilities } from 'whiskey-utilities'
import { ActiveDirectoryDevice } from '../Device';

export class ActiveDirectory
{

  constructor(logStack:string[], showDetails:boolean=false, showDebug:boolean=false) {
    this._showDetails=showDetails;
    this._showDebug=showDebug;
    this._utilities = new Utilities(logStack, showDetails, showDebug);
  }
  private _showDetails:boolean=false;
  private _showDebug:boolean=false;
  private _utilities = new Utilities([])
  

  public async fetch(ldapURL:string, bindDN:string, pw:string, searchDN:string, isPaged:boolean=true, sizeLimit:number=500):Promise<ActiveDirectoryDevice[]> {

    let output:ActiveDirectoryDevice[]=[]
    this._utilities.logStack.push('fetch')
    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Info, 'initializing ..')

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

      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Info, '.. binding LDAP ..')
      await client.bind(bindDN, pw);
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, '.. authenticated successfully ..')
      
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Info, '.. querying devices ..')
      const { searchEntries, searchReferences } = await client.search(searchDN,  {filter: '&(objectClass=computer)', paged: isPaged, sizeLimit: sizeLimit},);
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `.. found ${searchEntries.length} devices .. `)
      
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Info, `.. creating objects ..`)
      for(let i=0; i<searchEntries.length; i++) {
        try {

          const device:ActiveDirectoryDevice = {
            // mandatory
            observedByActiveDirectory: true,
            deviceName: searchEntries[i].cn.toString().trim(),
            activeDirectoryDN: searchEntries[i].dn.toString().trim(),
            // strings
            activeDirectoryOperatingSystem: this._utilities.CleanedString(searchEntries[i].operatingSystem),
            activeDirectoryOperatingSystemVersion: this._utilities.CleanedString(searchEntries[i].operatingSystemVersion),
            activeDirectoryDNSHostName: this._utilities.CleanedString(searchEntries[i].dNSHostName),
            // numbers
            activeDirectoryLogonCount: isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount),
            // dates
            activeDirectoryWhenCreated: this._utilities.ldapTimestampToJS(searchEntries[i].whenCreated.toString()),
            activeDirectoryWhenChanged: searchEntries[i].whenChanged ? this._utilities.ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : undefined,
            activeDirectoryLastLogon: searchEntries[i].lastLogon ? this._utilities.ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : undefined,
            activeDirectoryPwdLastSet: searchEntries[i].pwdLastSet ? this._utilities.ldapTimestampToJS(searchEntries[i].pwdLastSet.toString()) : undefined,
            activeDirectoryLastLogonTimestamp: searchEntries[i].lastLogonTimestamp ? this._utilities.ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : undefined
          }
          output.push(device)

          // let q = new sql.Request()
          // .input('deviceName', sql.VarChar(64), this._utilities.CleanedString(searchEntries[i].cn))
          // .input('activeDirectoryDN', sql.VarChar(255), this._utilities.CleanedString(searchEntries[i].dn))
          // .input('activeDirectoryOperatingSystem', sql.VarChar(255), this._utilities.CleanedString(searchEntries[i].operatingSystem))
          // //.input('activeDirectoryOperatingSystemVersion', sql.VarChar(255), this._utilities.CleanedString(searchEntries[i].operatingSystemVersion))
          // .input('activeDirectoryDNSHostName', sql.VarChar(255), this._utilities.CleanedString(searchEntries[i].dNSHostName))
          // // int
          // .input('activeDirectoryLogonCount', sql.Int, isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount))
          // // datetimes
          // .input('activeDirectoryWhenCreated', sql.DateTime2, this._utilities.ldapTimestampToJS(searchEntries[i].whenCreated.toString()))
          // .input('activeDirectoryWhenChanged', sql.DateTime2, searchEntries[i].whenChanged ? this._utilities.ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : undefined)
          // .input('activeDirectoryLastLogon', sql.DateTime2, searchEntries[i].lastLogon ? this._utilities.ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : undefined)
          // .input('activeDirectoryPwdLastSet', sql.DateTime2, searchEntries[i].pwdLastSet ? this._utilities.ldapTimestampToJS(searchEntries[i].pwdLastSet.toString()) : undefined)
          // .input('activeDirectoryLastLogonTimestamp', sql.DateTime2, searchEntries[i].lastLogonTimestamp ? this._utilities.ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : undefined)
          // output.sqlRequests.push(q)
        } catch (err) {
          this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, `${err}`)
        }  
      }
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Info, `.. objects created.`)

    } catch (ex) {
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, `${ex}`)
      throw ex;
    } finally {
      await client.unbind();
    }

    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, 'done.')
   this._utilities.logStack.pop()
    return new Promise<ActiveDirectoryDevice[]>((resolve) => {resolve(output)})

  }

}
