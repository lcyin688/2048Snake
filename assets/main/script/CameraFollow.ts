const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraFollow extends cc.Component {
    private snakeHead: cc.Node = null; // 蛇头节点

    protected update(dt: number): void {
        this.snakeHead = this.node.parent.getChildByName('GameView').getChildByName('snake').getChildByName('head');

        if (this.snakeHead) {
            // 将摄像机节点的位置设置为蛇头节点的位置
            this.node.setPosition(this.snakeHead.position);
        }

        // 保持摄像机节点的旋转不变
        this.node.angle = 0; // 设置摄像机节点的旋转角度为0度，即保持固定方向
    }
}
