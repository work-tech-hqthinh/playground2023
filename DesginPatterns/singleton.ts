
process.on('exit', () => {
    console.log(`TOOK [${((performance.now() - tick) / 1000).toFixed(3)}] seconds to execute`);
})

/** @@REFEFENCE TO RECURSIVE PROMISE CHAIN
 * https://stackoverflow.com/questions/29020722/recursive-promise-in-javascript
 */

const tick = performance.now();
interface ILDAP {
    connectWithRetry(): void;
    connectWithoutRetry(): void;
    bind(): void;
    // getInstance: () => LDAP;
}

type AcceptedResolve = 'continue' | 'success';

class LDAP implements ILDAP {
    public isConnected: boolean = false;

    private static instance: LDAP;

    public retries: number = 0;

    public maxRetries: number = 3;
    public curRetries: number = 0;

    private minSecRequired: number = 3_000;
    private maxSecRequired: number = 20_000;

    constructor() {
        // this.connectWithoutRetry();
        this.connectWithRetry();
    }


    retryRecursive(): Promise<AcceptedResolve> {
        return new Promise<AcceptedResolve>((resolve, reject) => {
            setTimeout(() => {
                if (++this.curRetries <= this.maxRetries) {
                    console.log(`curRetries: [${this.curRetries}] - Time: ${((performance.now() - tick) / 1000).toFixed(3)}`);
                    resolve('continue');

                } else {
                    resolve('success');
                }
            }, this.minSecRequired)

        }).then<AcceptedResolve>((result) => {

            if (result === 'continue') {
                return this.retryRecursive();
            }
            return 'success';
        })
    };


    connectWithRetry(): void {
        const exitTimeoutId = setTimeout(() => {
            console.log(`[KILLED]: Due to connection takes too much time`);
            process.exit(1);
        }, this.maxSecRequired);


        this.retryRecursive().then(result => {
            if (result == 'success') clearTimeout(exitTimeoutId);
        }).catch(e => {
            console.log(`PROBLEM: ${e}`);
        })

    }

    connectWithoutRetry(): void {
        const timeoutId = setTimeout(() => {
            console.log(`[KILLED]: Due to connection takes too much time`);
            process.exit(1);
        }, this.maxSecRequired);

        setTimeout(() => {
            clearTimeout(timeoutId);
        }, this.minSecRequired);
    }

    bind(): void {

    }

    static getInstance(): LDAP {
        if (!LDAP.instance) LDAP.instance = new LDAP();
        return LDAP.instance;
    }
}

LDAP.getInstance();