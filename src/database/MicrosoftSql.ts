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
            const pool = new sql.ConnectionPool(sqlConfig)
            await pool.connect()

            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `.. executing ${sprocToExecute} for ${sqlStatements.length}.. `)

            for(let i=0; i<sqlStatements.length; i++) {
                await sqlStatements[i].execute(sprocToExecute)
            }

        } catch(err) {
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `${err}`)
            throw(err)
        }

    }
}