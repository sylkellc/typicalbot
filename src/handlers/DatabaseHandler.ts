import * as Sentry from '@sentry/node';
import TypicalClient from '../lib/TypicalClient';
import { MongoClient, Db } from 'mongodb';

export default class DatabaseHandler {
    client: TypicalClient;

    mongo: MongoClient | null = null;
    db: Db | null = null;

    constructor(client: TypicalClient) {
        this.client = client;

        this.init().catch((err) => Sentry.captureException(err));
    }

    async init() {
        this.mongo = new MongoClient(process.env.MONGO_URI!, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            poolSize: parseInt(process.env.MONGO_POOL_SIZE!)
        });

        await this.mongo.connect();

        this.db = this.mongo.db(process.env.MONGO_DATABASE!);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    get(table: string, key?: object) {
        return key
            ? this.db
                ?.collection(table)
                .findOne(key)
            : this.db
                ?.collection(table)
                .find({})
                .toArray();
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    has(table: string, key: object) {
        return !!this.db
            ?.collection(table)
            .findOne(key);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    insert(table: string, data: object = {}) {
        return this.db
            ?.collection(table)
            .insertOne(data)
            .then(res => this.client.logger.debug(`Inserted ${res.result.n} documents`))
            .catch(err => Sentry.captureException(err, scope => {
                scope.clear();
                scope.setTag('clusterId', process.env.CLUSTER!);
                return scope;
            }));
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    update(table: string, key: object, data: object = {}) {
        return this.db
            ?.collection(table)
            .updateOne(key, { $set: data })
            .then(res => this.client.logger.debug(`Updated ${res.result.n} documents`))
            .catch(err => Sentry.captureException(err, scope => {
                scope.clear();
                scope.setTag('clusterId', process.env.CLUSTER!);
                return scope;
            }));
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    delete(table: string, key: object) {
        return this.db
            ?.collection(table)
            .deleteOne(key)
            .then(res => this.client.logger.debug(`Deleted ${res.result.n} documents`))
            .catch(err => Sentry.captureException(err, scope => {
                scope.clear();
                scope.setTag('clusterId', process.env.CLUSTER!);
                return scope;
            }));
    }
}
