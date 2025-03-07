import { Config } from "../../../core/config/Config";
import AssetManager from "../../../core/manager/AssetManager";
import { AudioClipName } from "../../../core/sound/AudioClipName";
import AudioManager from "../../../core/sound/AudioManger";
import { GameConsts } from "../../GameConsts";
import FoodItem from "../food/FoodItem";
import FoodMgr from "../food/FoodItem";
import SnakeHeadAI from "./SnakeHeadAI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SnakeHead extends cc.Component {



    dir: cc.Vec2 = null
    speed: number = 0;
    id: number = null;

    state = GameConsts.PlayStateType.state;
    configItemHead: GameConsts.ItemBlockType = null;
    socreLab: cc.Label = null;

    boxCol: cc.BoxCollider = null;
    phyBoxCol: cc.PhysicsBoxCollider = null;

    /**蛇身子 */
    snakeBodyArr: FoodItem[] = []
    private prefabItem: cc.Prefab


    isPause: boolean = false;
    public isFlashing: boolean = true
    private snakeNode: cc.Node = null;

    /**自己的总分数 */
    totalScore: number = 0;
    /** 自己的名字 */
    playerName: string = ""


    onLoad() {
        this.initView();
    }

    public initView() {
        if (!this.boxCol) {
            this.socreLab = this.node.getChildByName('lab').getComponent(cc.Label);
            this.boxCol = this.node.getComponent(cc.BoxCollider);
            this.phyBoxCol = this.node.getComponent(cc.PhysicsBoxCollider);
            this.node.group = GameConsts.snakePhyTagConfig.Group5
            this.initCountdownNode();
        }
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
        AssetManager.instance.loadAsset(Config.Prefab.playerBodyItem, cc.Prefab).then(prefab => {
            if (prefab) {
                this.prefabItem = prefab
                this.init();
            }
        }).catch(err => {
            cc.error(err);
        })
    }

    /** 车头属性 */
    public setHeadId(id: number) {
        this.id = id;
        this.configItemHead = GameConsts.snakeConfig[this.id];
        this.setSize(this.configItemHead.foodSize, this.configItemHead.foodSize)
        this.setStr();
        let spName = Config.Texture.FoodSp + this.configItemHead.spName;
        cc.resources.load(spName, cc.SpriteFrame, (err: Error, spriteFrame: cc.SpriteFrame) => {
            if (err) {
                cc.log(err);
                return;
            }
            if (spriteFrame) {
                this.setSprite(spriteFrame);
            }
        })
    }

    setName(str: string) {
        this.playerName = str
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

        this.socreLab.node.width = width - 8
        this.socreLab.node.height = width - 8

        this.boxCol.size = cc.size(width, height);
    }

    public setStr() {
        this.socreLab.string = this.configItemHead.score.toString();
        let clrTmp = cc.color(0, 0, 0);
        this.socreLab.node.color = clrTmp.fromHEX(this.configItemHead.colorStr).clone();
    }



    public setSpeed(speed: number) {
        this.speed = speed;
        // cc.log('当前移速:' + this.speed);
    }

    public getSpeed(): number {
        return this.speed;
    }


    init() {
        // 确保 snakeArray 包含蛇头节点
        this.snakeNode = this.node.parent
        this.snakeBodyArr = [];
        this.startGame()
    }


    startGame() {
        this.isPause = false
        this.resetSnakeBody()
        this.setHeadId(0);
        this.node.position = cc.v3(0, 0);
        this.dir = null;
        this.setSpeed(Config.MoveSpeed.Speed);
        this.setPlayState(GameConsts.PlayStateType.state)
        //进入游戏玩家需要闪烁两秒，在闪烁其间玩家可以移动，但是不能吃掉其他方块
        this.isFlashing = true;
        let time = 0.3
        let action = cc.tween(this.node).to(time, { opacity: 100 }).delay(time).to(time, { opacity: 250 })
        cc.tween(this.node)
            .repeat(4, action)
            .call(() => {
                this.isFlashing = false;
            })
            .start();
        let score = this.getTotalScore()
        this.reflashScore(score)
    }

    private resetSnakeBody(){
        for (let i = 0; i < this.snakeBodyArr.length; i++) { //本身就是从大到小排列的
            const item = this.snakeBodyArr[i];
            if (item.state!=GameConsts.FoodStateType.died) {
                item.setFoodState(GameConsts.FoodStateType.died)
            }
        }
    }

    setPlayState(type: GameConsts.PlayStateType) {
        this.state = type;
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

    onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        const ignoreTags = [
            { tag1: GameConsts.ItemColliderType.player, tag2: GameConsts.ItemColliderType.playerBody },
            { tag1: GameConsts.ItemColliderType.playerBody, tag2: GameConsts.ItemColliderType.player }
        ];

        // 检查是否需要忽略碰撞
        let shouldIgnore = false;
        for (let pair of ignoreTags) {
            if ((other.tag === pair.tag1 && self.tag === pair.tag2) || (other.tag === pair.tag2 && self.tag === pair.tag1)) {
                shouldIgnore = true;
                break;
            }
        }
        if (shouldIgnore) {
            // cc.log('忽略碰撞');
            return;
        }
        cc.log(`触发碰撞，tag：${other.tag}`)
        switch (other.tag) {
            case GameConsts.ItemColliderType.food:
                this.eatFood(other);
                break;
            case GameConsts.ItemColliderType.wallUp:
                this.dir = cc.v2(0, -1);
                cc.director.emit('stopControl');
                break;
            case GameConsts.ItemColliderType.wallDown:
                this.dir = cc.v2(0, 1);
                cc.director.emit('stopControl');
                break;
            case GameConsts.ItemColliderType.wallLeft:
                this.dir = cc.v2(1, 0);
                cc.director.emit('stopControl');
                break;
            case GameConsts.ItemColliderType.wallRight:
                this.dir = cc.v2(-1, 0);
                cc.director.emit('stopControl');
                break;
            case GameConsts.ItemColliderType.speedPropTag:
                this.getPropSpeed(other);
                break;
            case GameConsts.ItemColliderType.doublePropTag:
                this.getPropDouble(other);
                break;
            default: // AI 吃到AI 整个AI 死亡
                this.collisionAiEnter(other, self);
                break;
        }
    }

    /** 碰到AI */
    private collisionAiEnter(other: cc.Collider, self: cc.Collider) {
        // cc.log(`AI 触发碰撞，tag：${other.tag}`)
        // 大于 100 才是AI
        if (other.tag >= GameConsts.ItemColliderType.ai) {
            //判断是身子还是 车头 车头要咬死 屁股要吃了当前碰撞的 格子 如果是中间吃掉的要让他分离
            let yuNum = other.tag % 10;
            if (yuNum == 0) { //头 直接杀了吃它全部积分
                cc.director.emit('touchAiHead', other);
            } else {//身子
                cc.director.emit('touchAiBody', other);
            }
        }
    }


    /**获得加速道具 */
    private getPropSpeed(other: cc.Collider) {
        other.node.active = false
        this.setSpeed(this.speed * 1.5)
        cc.tween(this.node).delay(20).call(() => {
            other.node.active = true
        }).start()
    }
    /**获得加速道具 */
    private getPropDouble(other: cc.Collider) {
        other.node.active = false
        this.setScoreDouble(15)
        cc.tween(this.node).delay(1).call(() => {
            other.node.active = true
        }).start();
    }



    update(dt) {
        // if (dt != 0.02) dt = 0.02;
        if (this.dir && !this.isPause) {
            this.moveSnake();
            this.rotateHead(this.dir);
        }
    }

    moveSnake() {
        let dis = this.dir.mul(this.speed);
        this.node.setPosition(this.node.getPosition().add(dis));
        for (let i = 0; i < this.snakeBodyArr.length; i++) {
            let foodItem = this.snakeBodyArr[i]
            if (foodItem.state == GameConsts.FoodStateType.playing) {
                this.moveBodyItem(foodItem, i)
            }
        }
    }

    private moveBodyItem(foodItem: FoodItem, i: number) {
        let startNode: cc.Node
        if (i == 0) {
            startNode = this.node
        } else {
            startNode = this.snakeBodyArr[i - 1].node
        }
        let dis = startNode.width / 2 + foodItem.configItem.foodSize / 2
        let pos = startNode.getPosition().clone()
        let oppositeDir: cc.Vec2 = cc.v2(-this.dir.x, -this.dir.y); // 反方向向量
        let endPoint: cc.Vec2 = pos.add(oppositeDir.mul(dis));
        //知道终点和现在的位置去算矢量
        let posNow = foodItem.node.getPosition().clone()
        //当前矢量


        let normalizedVector: cc.Vec2 = endPoint.sub(posNow).normalize();
        let moveV2 = normalizedVector.mul(this.speed);
        let endPosFianal = posNow.add(moveV2);
        foodItem.node.setPosition(endPosFianal);
        foodItem.rotateHead(normalizedVector)
    }
    rotateHead(headPos) {
        let angle = cc.v2(1, 0).signAngle(headPos) * 180 / Math.PI;
        this.node.angle = angle - 90;
    }

    eatFood(other: cc.Collider) {
        if (this.isFlashing) {
            return; // 如果处于闪烁状态，不执行吃食物的逻辑
        }
        AudioManager.instance.playEffect(AudioClipName.effect.click)
        let foodItem = other.node.getComponent(FoodItem);
        if (foodItem) {
            let id = foodItem.configItem.idx
            if (this.id >= id) { // 我可以吃他
                //获取自己当前的组成 头部是最大的元素
                foodItem.setFoodState(GameConsts.FoodStateType.died)
                //计算出 最新的数据 分别 裁切
                let score = this.getTotalScore() + foodItem.configItem.score
                this.updateNowData(score)
            } else { //推着走
                // this.pushFood(other.node);
            }
        }
    }

    /**推着走 */
    private pushFood(foodNode: cc.Node) {
        // 获取食物节点的刚体组件
        let rigidBody = foodNode.getComponent(cc.RigidBody);
        if (rigidBody) {
            rigidBody.linearVelocity = this.dir.mul(this.speed);
        }
    }

    private setScoreDouble(bet: number) {
        let score = this.getTotalScore() * bet
        this.updateNowData(score)
    }

    private reflashScore(score: number) {
        this.totalScore = score
        cc.director.emit('reflashRankData');
    }

    public updateNowData(score: number) {
        this.reflashScore(score)
        // 将 GameConsts.snakeConfig 转换为数组
        let snakeConfigArray = Object.values(GameConsts.snakeConfig);
        let snakeConfigArrayFinal: GameConsts.ItemBlockType[] = []
        let configItemHead: GameConsts.ItemBlockType;
        let isFirst = true
        for (let i = snakeConfigArray.length - 1; i >= 0; i--) {
            const v = snakeConfigArray[i];
            if (score >= v.score) {
                score -= v.score
                if (isFirst) {
                    isFirst = false
                    configItemHead = v
                } else {
                    snakeConfigArrayFinal.push(v)
                }

            }
        }
        //最大的永远是身子
        this.setHeadId(configItemHead.idx)
        for (let i = 0; i < snakeConfigArrayFinal.length; i++) {
            const v = snakeConfigArrayFinal[i];
            if (this.snakeBodyArr.length > i) {
                let foodItem = this.snakeBodyArr[i]
                if (foodItem.state == GameConsts.FoodStateType.died) {
                    let data = this.getEndPositionAngle(i, foodItem)
                    // cc.log(" 腺癌应该方的坐标是 data ",data)
                    foodItem.node.setPosition(data.endPoint);
                    foodItem.rotateHead(data.dir)
                    // this.isPause =true
                    // cc.director.emit('stopControl');
                }
                foodItem.setFoodState(GameConsts.FoodStateType.playing)
                foodItem.setId(v.idx)
                foodItem.setGroupTag(GameConsts.snakePhyTagConfig.Group5)

            } else { //需要新加载的时候
                let foodNode = cc.instantiate(this.prefabItem);
                this.snakeNode.addChild(foodNode);
                let foodItem: FoodItem = foodNode.getComponent(FoodItem);
                if (foodItem) {
                    foodItem.setBoxTag(GameConsts.ItemColliderType.playerBody)
                    foodItem.setPhyBoxTag(GameConsts.ItemColliderType.playerBody)
                    foodItem.setFoodState(GameConsts.FoodStateType.playing);
                    foodItem.setId(v.idx);
                    foodItem.setGroupTag(GameConsts.snakePhyTagConfig.Group5)
                    foodItem.setRigidBodyState(false)
                }
                let data = this.getEndPositionAngle(i, foodItem)
                // cc.log(" 腺癌应该方的坐标是 data ",data)
                foodItem.node.setPosition(data.endPoint);
                foodItem.rotateHead(data.dir)
                this.snakeBodyArr.push(foodItem);
                // this.isPause =true
                // cc.director.emit('stopControl');
            }
        }
        //如果合并后变短了多余的先隐藏起来
        for (let i = 0; i < this.snakeBodyArr.length; i++) {
            const v = this.snakeBodyArr[i];
            if (i >= snakeConfigArrayFinal.length) {
                v.setFoodState(GameConsts.FoodStateType.died)
            }

        }
        //如果身子已经是 1024 那就游戏结束
        if (configItemHead.idx == 9) {
            this.isPause = true
            cc.director.emit('gameOverFinal');
        }

    }

    private getTotalScore() {
        //计算出 最新的数据 分别 裁切
        if (this.state == GameConsts.PlayStateType.died) {//死了后统统清0
            return 0
        }
        //计算出 最新的数据 分别 裁切
        let totalScore = this.configItemHead.score
        for (let i = 0; i < this.snakeBodyArr.length; i++) {
            if (this.snakeBodyArr[i].state == GameConsts.FoodStateType.playing) {
                const score = this.snakeBodyArr[i].configItem.score;
                totalScore += score
            }
        }
        return totalScore
    }

    private getEndPositionAngle(i: number, foodItem: FoodItem) {
        let startNode: cc.Node
        if (i == 0) {
            startNode = this.node
        } else {
            startNode = this.snakeBodyArr[i - 1].node
        }
        let dis = startNode.width / 2 + foodItem.configItem.foodSize / 2
        //新生成的粗暴的直接放到最后
        let pos = startNode.getPosition().clone()
        // 归一化方向向量（如果 dir 不是单位向量）
        // 计算终点坐标
        let oppositeDir: cc.Vec2 = cc.v2(-this.dir.x, -this.dir.y); // 反方向向量
        let endPoint: cc.Vec2 = pos.add(oppositeDir.mul(dis));
        const dir = endPoint.sub(pos).normalize()
        return { endPoint: endPoint, dir: dir }
    }

    public setColliderTag(tag: number) {
        this.boxCol.tag = tag
        this.phyBoxCol.tag = tag
    }

    /**嘎了 */
    public beKill() {
        this.isPause = true
        this.node.stopAllActions()
        this.reflashScore(0)
        cc.director.emit('gameOverFinal');
        this.state = GameConsts.PlayStateType.died;
        for (let i = 0; i < this.snakeBodyArr.length; i++) {
            const v = this.snakeBodyArr[i];
            v.setFoodState(GameConsts.FoodStateType.died)

        }
    }

}
