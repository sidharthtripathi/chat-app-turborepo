import {createClient} from 'redis'
export const redisDB = createClient({
    url : process.env.REDISDB_URL
})