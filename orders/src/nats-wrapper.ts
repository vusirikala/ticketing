import nats, {Stan} from 'node-nats-streaming';

class NatsWrapper {
    private _client?: Stan; //The ? says that the variable may be undefined for some period of time

    connect(clusterId: string, clientId: string, url: string) {
        this._client = nats.connect(clusterId, clientId, { url }) 
        
        return new Promise<void>((resolve, reject) => {
            this.client.on('connect', () => {
                console.log('Connected to NATS')
                resolve();
            })
            this.client.on('error', (err) => {
                reject(err);
            });
        })

    }

    get client() {
        if (!this._client) {
            throw new Error ('Cannot access NATS client before connecting')
        }
        return this._client;
    }

}

export const natsWrapper = new NatsWrapper();