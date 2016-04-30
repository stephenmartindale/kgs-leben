namespace Utils {
    export const enum LogSeverity {
        Default,
        Info,
        Success,
        Error,
        Warning
    }

    interface LogOptions {
        [severity: number]: boolean;
    }

    let logOptions: LogOptions = {};
    logOptions[LogSeverity.Default] = true;
    logOptions[LogSeverity.Info] = true;
    logOptions[LogSeverity.Success] = true;
    logOptions[LogSeverity.Error] = true;
    logOptions[LogSeverity.Warning] = true;

    interface LogMethods {
        [severity: number]: (message?: string, ...optionalParams: any[]) => void;
    }

    let logMethods: LogMethods = {};
    if (console) {
        logMethods[LogSeverity.Default] = (console.log)? console.log.bind(console) : undefined;
        logMethods[LogSeverity.Info] = (console.info)? console.info.bind(console) : logMethods[LogSeverity.Default];
        logMethods[LogSeverity.Success] = logMethods[LogSeverity.Info];
        logMethods[LogSeverity.Warning] = (console.warn)? console.warn.bind(console) : logMethods[LogSeverity.Default];
        logMethods[LogSeverity.Error] = (console.error)? console.error.bind(console) : logMethods[LogSeverity.Warning];
    }

    export function log(severity: Utils.LogSeverity, message?: string, ...optionalParams: any[]) {
        if ((logOptions[severity]) && (logMethods[severity])) logMethods[severity](message, ...optionalParams);
    }
}
