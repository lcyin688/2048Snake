interface CACHEST {
    data: any
}

export default class PlayerCache {
    /**
     * 设置缓存
     * @param key key
     * @param value value
     */
    public static set(key: string, value: any): void {
        const data: CACHEST = {
            data: value,
        };
        const strData: string = JSON.stringify(data);
        cc.sys.localStorage.setItem(key, strData);
    }

    /**
     * 获取缓存
     * @param key key
     * @returns 
     */
    public static get<T>(key: string, value?: T): T | null {
        const data = cc.sys.localStorage.getItem(key);
        if (data === undefined || data == null) return value === undefined ? null : value;
        try {
            const jsonData: CACHEST = JSON.parse(data);
            return jsonData.data;
        } catch (e) {
            return data;
        }
    }
    /**
     * 删除一个缓存
     * @param key 
     */
    public static remove(key) {
        cc.sys.localStorage.removeItem(key);
    }
}
