import SnakeHead from "../snake/SnakeHead";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JoystickControl extends cc.Component {
    @property(cc.Node)
    private joystickStick: cc.Node = null; // 摇杆的控制杆

    private snakeHead: cc.Node = null;

    isTouch: boolean = true;

    protected onLoad(): void { }

    start() { }

    protected onDestroy(): void { }

    protected onEnable(): void {
        this.registerTouchEvent();
        cc.director.on('stopControl', this.dispatchJoysickEvent, this);
        cc.director.on('addHead', this.dispatchAddSnakeHeadEvent, this);
    }

    protected onDisable(): void {
        this.unregisterTouchEvent();
        cc.director.off('stopControl', this.dispatchJoysickEvent, this);
        cc.director.off('addHead', this.dispatchAddSnakeHeadEvent, this);
    }

    dispatchJoysickEvent() {
        cc.log('监听摇杆，此刻不能操作')
        this.isTouch = false;
        this.scheduleOnce(() => {
            this.isTouch = true;
            cc.log('监听摇杆，恢复操作')
        }, 1.5);
    }

    dispatchAddSnakeHeadEvent() {
        this.snakeHead = this.node.parent.parent.getChildByName('snake').getChildByName('head');
    }

    private registerTouchEvent(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    private unregisterTouchEvent(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    private onTouchStart(event: cc.Event.EventTouch): void {
        if (!this.isTouch) return;
        this.resetJoystickPosition();
    }

    private onTouchMove(event: cc.Event.EventTouch): void {
        if (!this.isTouch) return;
        const posDelta = event.getDelta();
        this.joystickStick.setPosition(this.joystickStick.getPosition().add(posDelta));
        this.updateSnakeDirection();
    }

    private onTouchEnd(event: cc.Event.EventTouch): void {
        if (!this.isTouch) return;
        this.resetJoystickPosition();
    }

    private onTouchCancel(event: cc.Event.EventTouch): void {
        if (!this.isTouch) return;
        this.resetJoystickPosition();
    }

    private updateSnakeDirection(): void {
        const dir = this.joystickStick.getPosition().normalize();
        let snakeHeadComp = this.snakeHead.getComponent(SnakeHead);
        snakeHeadComp.dir = dir;
        snakeHeadComp.setIsMove(true);
    }

    private resetJoystickPosition(): void {
        this.joystickStick.setPosition(cc.Vec2.ZERO);
    }

    protected update(dt: number): void {
        const len = this.joystickStick.position.mag();
        const maxLen = this.node.width / 2;
        const ratio = len > maxLen ? maxLen / len : 1;
        this.joystickStick.setPosition(this.joystickStick.position.mul(ratio));
    }
} 