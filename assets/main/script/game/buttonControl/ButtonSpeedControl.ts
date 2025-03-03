import { Config } from "../../../core/config/Config";
import SnakeHead from "../snake/SnakeHead";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ButtonSpeedControl extends cc.Component {

    private snakeHead: cc.Node = null;
    private snakeHeadComp: SnakeHead = null;

    onLoad() { }

    start() { }

    protected onEnable(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        cc.director.on('addHead', this.dispatchAddSnakeHeadEvent, this);
        cc.director.on('countdown is done', this.dispatchCancelSetSpeedEvent, this)
    }

    protected onDisable(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        cc.director.off('addHead', this.dispatchAddSnakeHeadEvent, this);
    }

    onTouchStart(event: cc.Event.EventTouch) {
        if (!this.snakeHead || !this.snakeHeadComp.getIsMove()) return;
        this.snakeHeadComp.setSpeed(this.snakeHeadComp.getSpeed() + this.snakeHeadComp.getSpeed() * 0.5);
        this.node.opacity = 150;
        cc.director.emit('show countdown')
    }

    onTouchEnd(event: cc.Event.EventTouch) {
        if (!this.snakeHead || !this.snakeHeadComp.getIsMove()) return;
        this.snakeHeadComp.setSpeed(Config.MoveSpeed.Speed);
        this.node.opacity = 255;
        cc.director.emit('hide countdown')
    }

    dispatchAddSnakeHeadEvent() {
        this.snakeHead = this.node.parent.parent.getChildByName('snake').getChildByName('head');
        if (this.snakeHead) this.snakeHeadComp = this.snakeHead.getComponent(SnakeHead); //先获取组件
    }

    dispatchCancelSetSpeedEvent() {
        this.onTouchEnd(null);
    }

    update(dt) { }
}
