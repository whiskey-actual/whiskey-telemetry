import sql from 'mssql'
import { WhiskeyUtilities } from 'whiskey-utilities';

export class MicrosoftSql {

    constructor(logStack:string[], showDetails:boolean=false, showDebug:boolean=false) {
        this._logStack=logStack;
        this._showDetails=showDetails;
        this._showDebug=showDebug;
      }
      _logStack:string[]=[]
      _showDetails:boolean=false;
      _showDebug:boolean=false;

      
      public async persistToMicrosoftSql(sqlConfig:any, sqlStatements:sql.Request[], sprocToExecute:string) {
        this._logStack.push("persistToMicrosoftSql");
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `initializing.. `)

        try {

            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `.. connecting to mssql @ ${sqlConfig.server} ..`)
        
            const sqlPool = await sql.connect(sqlConfig)
            for(let i=0; i<sqlStatements.length; i++) {
                const r = sqlPool.request()
                r.parameters = sqlStatements[i].parameters
                await r.execute(sprocToExecute)
            }

            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `.. executing ${sprocToExecute} for ${sqlStatements.length}.. `)

        } catch(err) {
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `${err}`)
            throw(err)
        }

    }
}