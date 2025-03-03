const { ccclass, property } = cc._decorator;

@ccclass
export default class FoodMgr extends cc.Component {

    private id: number = null;
    private idx: number = null;

    onLoad() { }

    start() { }

    public setId(id: number) {
        this.id = id;
    }

    public getId(): number {
        return this.id;
    }

    public setIdx(idx: number) {
        this.idx = idx;
    }

    public getIdx(): number {
        return this.idx;
    }

    public setStr() {
        let Label = this.node.getChildByName('lab').getComponent(cc.Label);
        Label.string = this.id.toString();
    }

    public setSprite(sp: cc.SpriteFrame) {
        this.node.getComponent(cc.Sprite).spriteFrame = sp;
    }

    public setSize(width: number, height: number) {
        this.node.width = width;
        this.node.height = height;
    }

    public foodTween(pos: cc.Vec3, callback: Function) {
        cc.tween(this.node)
            .to(0.2, { position: pos })
            .call(() => {
                callback && callback();
            })
            .start();
    }

    update(dt) { }
}
