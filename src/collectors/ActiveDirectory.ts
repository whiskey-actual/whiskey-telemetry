import { Client } from 'ldapts'
import { WhiskeyUtilities } from 'whiskey-utilities'
import { SqlRequestCollection } from '../database/SqlRequestCollection';
import sql from 'mssql'

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
  

  public async fetch(ldapURL:string, bindDN:string, pw:string, searchDN:string, isPaged:boolean=true, sizeLimit:number=500):Promise<SqlRequestCollection> {

    let output = new SqlRequestCollection('sp_add_activeDirectory_device')
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
      const { searchEntries, searchReferences } = await client.search(searchDN,  {filter: '&(objectClass=computer)', paged: isPaged, sizeLimit: sizeLimit},);
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. found ${searchEntries.length} devices .. `)
      
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `.. creating objects ..`)
      for(let i=0; i<searchEntries.length; i++) {
        try {
          let q = new sql.Request()
          .input('deviceName', sql.VarChar(64), WhiskeyUtilities.CleanedString(searchEntries[i].cn))
          .input('activeDirectoryDN', sql.VarChar(255), WhiskeyUtilities.CleanedString(searchEntries[i].dn))
          .input('activeDirectoryOperatingSystem', sql.VarChar(255), WhiskeyUtilities.CleanedString(searchEntries[i].operatingSystem))
          //.input('activeDirectoryOperatingSystemVersion', sql.VarChar(255), WhiskeyUtilities.CleanedString(searchEntries[i].operatingSystemVersion))
          .input('activeDirectoryDNSHostName', sql.VarChar(255), WhiskeyUtilities.CleanedString(searchEntries[i].dNSHostName))
          // int
          .input('activeDirectoryLogonCount', sql.Int, isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount))
          // datetimes
          .input('activeDirectoryWhenCreated', sql.DateTime2, this.ldapTimestampToJS(searchEntries[i].whenCreated.toString()))
          .input('activeDirectoryWhenChanged', sql.DateTime2, searchEntries[i].whenChanged ? this.ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : undefined)
          .input('activeDirectoryLastLogon', sql.DateTime2, searchEntries[i].lastLogon ? this.ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : undefined)
          .input('activeDirectoryPwdLastSet', sql.DateTime2, searchEntries[i].pwdLastSet ? this.ldapTimestampToJS(searchEntries[i].pwdLastSet.toString()) : undefined)
          .input('activeDirectoryLastLogonTimestamp', sql.DateTime2, searchEntries[i].lastLogonTimestamp ? this.ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : undefined)
          output.sqlRequests.push(q)
        } catch (err) {
          WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `${err}`)
        }  
      }
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `.. objects created.`)

    } catch (ex) {
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `${ex}`)
      throw ex;
    } finally {
      await client.unbind();
    }

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'done.')
    this._logStack.pop()
    return new Promise<SqlRequestCollection>((resolve) => {resolve(output)})

  }

  private ldapTimestampToJS(timestamp:string):Date {
    return new Date(parseInt(timestamp) / 1e4 - 1.16444736e13)
  }

}
