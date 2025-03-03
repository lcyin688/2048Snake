const { ccclass, property } = cc._decorator;

@ccclass
export default class Countdown extends cc.Component {

    @property(cc.Label)
    time: cc.Label = null;

    onLoad() { }

    start() { }

    protected onEnable(): void {
        this.countDown();
    }

    protected onDisable(): void {
        this.unscheduleAllCallbacks();
    }

    countDown(time: number = 3) {
        this.time.string = time.toString();
        this.schedule(() => {
            time--;
            this.time.string = time.toString();
            if (time <= 0) {
                this.node.active = false;
                cc.director.emit('countdown is done')
            }
        }, 1, time - 1)
    }
}
