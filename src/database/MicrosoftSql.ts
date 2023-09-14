import mssql from 'mssql'
import { SqlRequestCollection } from './SqlRequestCollection';
import { WhiskeyUtilities } from 'whiskey-utilities';

export class MicrosoftSql {

    constructor(logStack:string[], sqlConfig:any, showDetails:boolean=false, showDebug:boolean=false) {
        this._logStack=logStack;
        this._sqlConfig = sqlConfig;
        this._showDetails=showDetails;
        this._showDebug=showDebug;
      }
      private _logStack:string[]=[]
      private _showDetails:boolean=false;
      private _showDebug:boolean=false;
      private _sqlConfig:any=undefined

      public async writeToSql(sqlRequestCollection:SqlRequestCollection, logFrequency:number=250) {
        this._logStack.push("writeToSql");
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `initializing.. `)

        try {

            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `.. connecting to mssql @ ${this._sqlConfig.server} ..`)
            const sqlPool = await mssql.connect(this._sqlConfig)
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `.. connected; executing ${sqlRequestCollection.sprocName} for ${sqlRequestCollection.sqlRequests.length} items .. `)

            let executionArray = []

            const startDate:Date = new Date()
            for(let i=0; i<sqlRequestCollection.sqlRequests.length; i++) {
                const r = sqlPool.request()
                try {
                    //executionArray.push(r.execute(sqlRequestCollection.sprocName))
                    await r.execute(sqlRequestCollection.sprocName)
                } catch(err) {
                    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `${err}`)
                    console.debug(sqlRequestCollection.sqlRequests[i])
                }
                
                if(i>0 && i%logFrequency==0) {
                    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, WhiskeyUtilities.getProgressMessage('', 'queued', i, sqlRequestCollection.sqlRequests.length, startDate, new Date()));
                }
            }
            //await Promise.all(executionArray);
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, WhiskeyUtilities.getProgressMessage('', 'persisted', sqlRequestCollection.sqlRequests.length, sqlRequestCollection.sqlRequests.length, startDate, new Date()));
            sqlPool.close()
        } catch(err) {
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `${err}`)
            throw(err)
        } finally {
            this._logStack.pop()
        }
    }

}