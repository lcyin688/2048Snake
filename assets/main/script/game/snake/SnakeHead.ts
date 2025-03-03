import { Config } from "../../../core/config/Config";
import AssetManager from "../../../core/manager/AssetManager";
import { GameConsts } from "../../GlobalConfig";
import FoodMgr from "../food/FoodMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SnakeHead extends cc.Component {

    dir: cc.Vec2 = null
    speed: number = 0;
    snakeArray: cc.Node[] = [];
    pointsArray: cc.Vec2[] = [];
    id: number = null;
    isMove: boolean = false;

    onLoad() {
        this.initCountdownNode();
    }

    protected onEnable(): void {
        cc.director.on('show countdown', this.dispatchShowCountdownEvent, this);
        cc.director.on('hide countdown', this.dispatchHideCountdownEvent, this);
    }

    protected onDisable(): void {
        cc.director.off('show countdown', this.dispatchShowCountdownEvent, this);
        cc.director.off('hide countdown', this.dispatchHideCountdownEvent, this);
    }

    dispatchShowCountdownEvent() {
        this.node.getChildByName('countdown').active = true;
    }

    dispatchHideCountdownEvent() {
        this.node.getChildByName('countdown').active = false;
    }

    start() {
        this.init();
    }

    public setHeadId(id: number) {
        this.id = id;
    }

    public getHeadId(): number {
        return this.id;
    }

    public setSprite(sp: cc.SpriteFrame) {
        this.node.getComponent(cc.Sprite).spriteFrame = sp;
    }

    public setSize(width: number, height: number) {
        this.node.width = width;
        this.node.height = height;
    }

    public setStr() {
        let Label = this.node.getChildByName('lab').getComponent(cc.Label);
        Label.string = this.id.toString();
    }

    public setSpeed(speed: number) {
        this.speed = speed;
        CC_DEBUG && cc.log('当前移速:' + this.speed);
    }

    public getSpeed(): number {
        return this.speed;
    }

    public setIsMove(bool: boolean) {
        this.isMove = bool;
    }

    public getIsMove(): boolean {
        return this.isMove;
    }

    init() {
        // 确保 snakeArray 包含蛇头节点
        this.snakeArray.push(this.node);
        this.dir = null;
        this.pointsArray = [];
        this.setSpeed(Config.MoveSpeed.Speed);

    }

    initCountdownNode() {
        AssetManager.instance.loadAsset(Config.Prefab.Countdown, cc.Prefab).then(prefab => {

            if (prefab) {
                let node: cc.Node = cc.instantiate(prefab);
                node.setParent(this.node);
                node.setPosition(cc.v2(0, 60));
                node.active = false;
            }

        }).catch(err => {
            cc.error(err);
        })
    }

    onCollisionEnter(other: cc.Collider, self) {
        cc.log(`触发碰撞，tag：${other.tag}`)
        switch (other.tag) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
                this.eatFood(other.node);
                break;
            case 7:
                this.dir = cc.v2(0, -1);
                cc.director.emit('stopControl');
                break;
            case 8:
                this.dir = cc.v2(0, 1);
                cc.director.emit('stopControl');
                break;
            case 9:
                this.dir = cc.v2(1, 0);
                cc.director.emit('stopControl');
                break;
            case 10:
                this.dir = cc.v2(-1, 0);
                cc.director.emit('stopControl');
                break;
            default:
                break;
        }
    }

    update(dt) {
        if (dt != 0.02) dt = 0.02;
        if (this.dir) {
            this.moveSnake(dt);
            this.rotateHead(this.dir);
        }
    }

    moveSnake(dt) {
        let dis = this.dir.mul(this.speed);
        this.node.setPosition(this.node.getPosition().add(dis));
        this.pointsArray.push(this.node.getPosition());

        // 计算蛇身节点之间的间隔距离
        let step = Math.floor(this.node.width / this.speed);

        for (let i = 1; i < this.snakeArray.length; i++) {
            if (this.pointsArray.length <= step * i) {
                let lastBody = this.snakeArray[this.snakeArray.length - 1];
                let lastBOBody = this.snakeArray[this.snakeArray.length - 2];
                let dir = lastBOBody.getPosition().sub(lastBody.getPosition()).normalize();
                dis = dir.mul(this.speed);
                this.snakeArray[i].setPosition(this.snakeArray[i].getPosition().add(dis));
            } else {
                // 确保 snakeArray 中的节点数量足够
                if (this.pointsArray.length - step * i >= 0) {
                    this.snakeArray[i].setPosition(this.pointsArray[this.pointsArray.length - step * i]);
                }
            }
            this.snakeArray[i].angle = this.node.angle;
        }

        // 移除移动路径上超出的点
        if (this.pointsArray.length > step * (this.snakeArray.length - 1)) {
            this.pointsArray.splice(0, 1);
        }
    }

    rotateHead(headPos) {
        let angle = cc.v2(1, 0).signAngle(headPos) * 180 / Math.PI;
        this.node.angle = angle - 90;
    }

    eatFood(node: cc.Node) {
        this.snakeArray.push(node);
        node.setParent(this.node.parent);
        let foodMgr = node.getComponent(FoodMgr);
        let foodCollider = foodMgr.getComponent(cc.Collider);
        foodCollider.tag = GameConsts.ItemType.food;

        if (this.snakeArray.length >= 2) {
            let idx = this.snakeArray.length - 1;
            let lastNode = this.snakeArray[idx];
            cc.log("lastNode:" + lastNode.name);
            let secondLastNode = this.snakeArray[idx - 1];
            cc.log("secondLastNode:" + secondLastNode.name);

            if (secondLastNode.name == 'head') {
                let lastFoodMgr = lastNode.getComponent(FoodMgr);
                if (lastFoodMgr.getId() === this.getHeadId()) {
                    // this.removeSameFood();
                    let lastNodeMgr = lastNode.getComponent(FoodMgr);
                    lastNodeMgr.foodTween(secondLastNode.position, () => {
                        lastNode.removeFromParent();
                    });
                    this.snakeArray.splice(idx, 1); // 从数组中删除 lastNode

                    let foodIdx = lastFoodMgr.getId() / lastFoodMgr.getId();
                    let spName = this.getIconName(foodIdx)
                    cc.resources.load(spName, cc.SpriteFrame, (err: Error, spriteFrame: cc.SpriteFrame) => {
                        if (err) {
                            cc.log(err);
                            return;
                        }

                        if (spriteFrame) {
                            this.setSprite(spriteFrame);
                            this.setHeadId(lastFoodMgr.getId() * 2);
                            this.setStr();
                            this.setSize(Config.Size.FoodSize[foodIdx], Config.Size.FoodSize[foodIdx]);
                        }
                    })
                    // 合并两个节点
                    let newValue = lastFoodMgr.getId() * 2;
                    cc.log(this.snakeArray)
                }

                for (let i = 0; i < this.snakeArray.length; i++) {
                    cc.log(this.snakeArray[i])
                }

            } else {
                // 从末尾向前遍历找到第一对具有相同ID的节点
                while (idx >= 1 && lastNode && secondLastNode) {
                    let lastFoodMgr = lastNode.getComponent(FoodMgr);
                    let secondLastFoodMgr = secondLastNode.getComponent(FoodMgr);

                    if (secondLastFoodMgr && lastFoodMgr.getId() === secondLastFoodMgr.getId()) {
                        // this.removeSameFood();
                        lastFoodMgr.foodTween(secondLastFoodMgr.node.position, () => {
                            lastNode.removeFromParent();
                        })

                        let foodIdx = lastFoodMgr.getId() / lastFoodMgr.getId();
                        let spName = this.getIconName(foodIdx);
                        cc.resources.load(spName, cc.SpriteFrame, (err: Error, spriteFrame: cc.SpriteFrame) => {
                            if (err) {
                                cc.log(err);
                                return;
                            }

                            if (spriteFrame) {
                                secondLastFoodMgr.setSprite(spriteFrame);
                                secondLastFoodMgr.setId(lastFoodMgr.getId() * 2);
                                secondLastFoodMgr.setStr();
                                secondLastFoodMgr.setSize(Config.Size.FoodSize[foodIdx], Config.Size.FoodSize[foodIdx]);
                            }
                        })
                        let newValue = lastFoodMgr.getId() * 2;
                        break; // 找到一对相同ID的节点后，结束循环
                    }

                    idx--;
                    lastNode = this.snakeArray[idx];
                    secondLastNode = this.snakeArray[idx - 1];
                }
            }
        }
    }


    /** 获取贴图名  */
    private getIconName(foodIdx: number) {
        let spName = Config.Texture.FoodSp + `icon_${foodIdx}`
        return spName
    }

}
