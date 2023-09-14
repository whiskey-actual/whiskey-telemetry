import mssql, { IProcedureResult } from 'mssql'
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

    public async writeToSql(sqlRequestCollection:SqlRequestCollection, logFrequency:number=1000) {
    this._logStack.push("writeToSql");
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `initializing.. `)

    try {

        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `.. connecting to mssql @ ${this._sqlConfig.server} ..`)
        const sqlPool = await mssql.connect(this._sqlConfig)
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `.. connected; executing ${sqlRequestCollection.sprocName} for ${sqlRequestCollection.sqlRequests.length} items .. `)

        let executionArray:Promise<void|IProcedureResult<any>>[] = []

        const startDate:Date = new Date()
        for(let i=0; i<sqlRequestCollection.sqlRequests.length; i++) {
            const r = sqlPool.request()
            try {
                r.parameters = sqlRequestCollection.sqlRequests[i].parameters
                r.verbose = true
                executionArray.push(
                    r
                    .execute(sqlRequestCollection.sprocName)
                    .catch((reason:any) =>{
                        console.debug(r)
                    })
                )
                //await r.execute(sqlRequestCollection.sprocName)
            } catch(err) {
                WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `${err}`)
                console.debug(sqlRequestCollection.sqlRequests[i])
            }
            
        }
        //await Promise.all(executionArray);

        await this.executePromisesWithProgress(executionArray, (p:number)=>{
            if(p>0 && p%logFrequency===0) {
                WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, WhiskeyUtilities.getProgressMessage('', 'persisted', p, sqlRequestCollection.sqlRequests.length, startDate, new Date()));
            }
        })

        
        sqlPool.close()
    } catch(err) {
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `${err}`)
        throw(err)
    } finally {
        this._logStack.pop()
    }

     
    }

    private executePromisesWithProgress(promises:Promise<void|IProcedureResult<any>>[], progressCallback:any) {
        let d:number=0
        progressCallback(0);

        for(const promise of promises) {
            promise
            .then(() => {
                d++;
                progressCallback(d)
            })
            .catch((err: any) => {
                WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `${err}`)
            })
            
            
        }
        return Promise.all(promises);
    }

}