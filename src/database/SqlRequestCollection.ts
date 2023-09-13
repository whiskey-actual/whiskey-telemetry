import mssql from 'mssql'
import { WhiskeyUtilities } from 'whiskey-utilities'

export class SqlRequestCollection {

    constructor(sprocName:string) {
        this._sprocName=sprocName
    }
    private _sprocName:string=''
    public sqlRequests:mssql.Request[] = []

    public async writeToSql(logStack:string[], sqlConfig:any, logFrequency:number=250) {
        logStack.push("writeToSql");
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, logStack, `initializing.. `)

        try {

            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, logStack, `.. connecting to mssql @ ${sqlConfig.server} ..`)
            const sqlPool = await mssql.connect(sqlConfig)
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, logStack, `.. connected; executing ${this._sprocName} for ${this.sqlRequests.length} items .. `)

            const startDate:Date = new Date()
            for(let i=0; i<this.sqlRequests.length; i++) {
                const r = sqlPool.request()
                r.parameters = this.sqlRequests[i].parameters
                await r.execute(this._sprocName)
                if(i>0 && i%logFrequency==0) {
                    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, logStack, WhiskeyUtilities.getProgressMessage('', 'persisted', i, this.sqlRequests.length, startDate, new Date()));
                  }
            }
            sqlPool.close()
        } catch(err) {
            WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, logStack, `${err}`)
            throw(err)
        } finally {
            logStack.pop()
        }
    }
}