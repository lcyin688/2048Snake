import { GameConsts } from "../../GameConsts";
import FoodMgr from "../food/FoodItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SnakeHeadAI extends cc.Component {

    dir: cc.Vec2 = cc.Vec2.UP; // 初始方向为向上
    speed: number = 4;
    snakeAiArray: cc.Node[] = []; // 蛇身节点数组
    pointsArray: cc.Vec2[] = []; // 蛇身节点位置数组
    sectionLen: number = 44;
    isColliding: boolean = false; // 标记是否碰撞到墙壁

    onLoad() {
        this.init();
        this.schedule(this.updateSnakeDirection, 5);
    }

    start() { }

    init() {
        this.snakeAiArray.push(this.node);
        this.dir = null;
        this.pointsArray = [];
    }

    onCollisionEnter(other: cc.Collider, self) {
        switch (other.tag) {
            case 0:
                this.eatFood(other.node);
                break;
            case 7:
                this.dir = cc.v2(0, -1);
                break;
            case 8:
                this.dir = cc.v2(0, 1);
                break;
            case 9:
                this.dir = cc.v2(1, 0);
                break;
            case 10:
                this.dir = cc.v2(-1, 0);
                break;
            default:
                break;
        }
    }

    update(dt) {
        if (this.dir) {
            this.moveSnake(dt);
            this.rotateHead(this.dir);
        }
    }

    updateSnakeDirection() {
        const randomDir = cc.v2(Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
        this.dir = randomDir;
    }

    moveSnake(dt) {
        let dis = this.dir.mul(this.speed);
        this.node.setPosition(this.node.getPosition().add(dis));
        this.pointsArray.push(this.node.getPosition());

        let step = this.sectionLen / this.speed;

        for (let i = 1; i < this.snakeAiArray.length; i++) {
            if (this.pointsArray.length <= step * i) {
                let lastBody = this.snakeAiArray[this.snakeAiArray.length - 1];
                let lastBOBody = this.snakeAiArray[this.snakeAiArray.length - 2];
                let dir = lastBOBody.getPosition().sub(lastBody.getPosition()).normalize();
                dis = dir.mul(this.speed);
                this.snakeAiArray[i].setPosition(this.snakeAiArray[i].getPosition().add(dis));
            } else {
                this.snakeAiArray[i].setPosition(this.pointsArray[this.pointsArray.length - step * i]);
            }
            this.snakeAiArray[i].angle = this.node.angle
        }
        if (this.pointsArray.length > step * (this.snakeAiArray.length - 1)) {
            this.pointsArray.splice(0, 1);
        }
    }


    rotateHead(headPos) {
        let angle = cc.v2(1, 0).signAngle(headPos) * 180 / Math.PI;
        this.node.angle = angle - 90;
    }


    eatFood(node: cc.Node) {
        let foodMgr = node.getComponent(FoodMgr);
        let foodCollider = foodMgr.getComponent(cc.Collider);
        foodCollider.tag = GameConsts.ItemColliderType.player;
        node.setParent(this.node.parent);
        this.snakeAiArray.push(node);
    }


    protected onDestroy(): void {
        this.unschedule(this.updateSnakeDirection)
    }
}
