export default class AssetManager {

    // 单例模式
    private static _instance: AssetManager = null;

    public static get instance() {
        if (!this._instance) {
            this._instance = new AssetManager();
        }
        return this._instance;
    }

    /**
      * 加载资源的方法
      * @param path 资源路径
      * @param type 资源类型
      */
    loadAsset<T extends cc.Asset>(path: string, type: { new(): T }): Promise<T>;
    loadAsset(path: string, type: typeof cc.Asset): Promise<cc.Asset>;

    loadAsset(path: string, type: any): Promise<any> {
        return new Promise((resolve, reject) => {
            cc.resources.load(path, type, (err: Error, asset: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(asset);
                }
            });
        });
    }


    //     // 加载预制体
    // this.loadAsset('prefabs/myPrefab', cc.Prefab).then(prefab => {
    //     // 成功加载预制体后的处理逻辑
    //     const node = cc.instantiate(prefab);
    //     this.node.addChild(node);
    //   }).catch(err => {
    //     // 加载预制体失败的处理逻辑
    //     cc.error(err);
    //   });

    //   // 加载图片资源
    //   this.loadAsset('images/myImage', cc.SpriteFrame).then(spriteFrame => {
    //     // 成功加载图片资源后的处理逻辑
    //     const node = new cc.Node();
    //     const sprite = node.addComponent(cc.Sprite);
    //     sprite.spriteFrame = spriteFrame;
    //     this.node.addChild(node);
    //   }).catch(err => {
    //     // 加载图片资源失败的处理逻辑
    //     cc.error(err);
    //   });
}
