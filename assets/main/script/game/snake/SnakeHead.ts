import { Config } from "../../../core/config/Config";
import AssetManager from "../../../core/manager/AssetManager";
import { GameConsts } from "../../GameConsts";
import FoodItem from "../food/FoodItem";
import FoodMgr from "../food/FoodItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SnakeHead extends cc.Component {


    dir: cc.Vec2 = null
    speed: number = 0;
    id: number = null;

    state = GameConsts.PlayStateType.state;
    configItemHead:GameConsts.ItemBlockType = null;
    socreLab: cc.Label = null;
    boxCol: cc.BoxCollider = null;

    /**蛇身子 */
    snakeBodyArr:FoodItem[]=[]
    private prefabItem: cc.Prefab


    isPause: boolean = false;

    private snakeNode:cc.Node = null;

    onLoad() {
        this.socreLab = this.node.getChildByName('lab').getComponent(cc.Label);
        this.boxCol = this.node.getComponent(cc.BoxCollider);
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
        AssetManager.instance.loadAsset(Config.Prefab.FoodItem, cc.Prefab).then(prefab => {
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
        this.setSize(this.configItemHead.foodSize,this.configItemHead.foodSize)
        this.setStr();  
        let spName =  Config.Texture.FoodSp + this.configItemHead.spName;
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

    public getHeadId(): number {
        return this.id;
    }

    public setSprite(sp: cc.SpriteFrame) {
        this.node.getComponent(cc.Sprite).spriteFrame = sp;
    }

    public setSize(width: number, height: number) {
        this.node.width = width;
        this.node.height = height;

        this.socreLab.node.width=width-8
        this.socreLab.node.height=width-8

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
        this.snakeNode =this.node.parent
        this.dir = null;
        this.snakeBodyArr = [];
        this.setSpeed(Config.MoveSpeed.Speed);
        this.setPlayState(GameConsts.PlayStateType.state)

        
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
            cc.log('忽略碰撞');
            return;
        }
        cc.log(`触发碰撞，tag：${other.tag}`)
        switch (other.tag) {
            case GameConsts.ItemColliderType.food:
                this.eatFood(other);
            case GameConsts.ItemColliderType.ai:
                // this.eatFood(other);
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
            default:
                break;
        }
    }

    update(dt) {
        if (dt != 0.02) dt = 0.02;
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
            if (foodItem.state==GameConsts.FoodStateType.player) {
                let data = this.getEndPositionAngleUpDate(i,foodItem)
                this.moveBodyItem(foodItem,data)

                // foodItem.node.setPosition(data.endPoint);
                // foodItem.rotateHead(data.dir)
            }
        }
    }

    private  moveBodyItem(foodItem:FoodItem, data: {endPoint: cc.Vec2; dir: cc.Vec2;}){
        
        let endpos = new cc.Vec3(data.endPoint.x, data.endPoint.y, 0);


                // foodItem.node.setPosition(data.endPoint);
                // foodItem.rotateHead(data.dir)


        foodItem.node.stopAllActions()
        cc.tween(foodItem.node)
        .to(0.2, { position:  endpos })
        .start()
        let angle = cc.v2(1, 0).signAngle(data.dir) * 180 / Math.PI;
        cc.tween(foodItem.node)
        .to(0.2, { rotation:  angle })
        .start()
    }


    /** 这里坐标和角度都需要 缓变 */
    private getEndPositionAngleUpDate(i:number,foodItem:FoodItem){
        let startNode:cc.Node
        if (i==0) {
            startNode = this.node
        }else{
            startNode = this.snakeBodyArr[i-1].node
        }
        let dis = startNode.width / 2 + foodItem.configItem.foodSize / 2
        let pos = startNode.getPosition().clone()
        let oppositeDir: cc.Vec2 = cc.v2(-this.dir.x, -this.dir.y); // 反方向向量
        let endPoint: cc.Vec2 = pos.add(oppositeDir.mul(dis));
        const dir =endPoint.sub(pos).normalize()
        return {endPoint:endPoint,dir:dir}
   }

    rotateHead(headPos) {
        let angle = cc.v2(1, 0).signAngle(headPos) * 180 / Math.PI;
        this.node.angle = angle - 90;
    }

    eatFood(other: cc.Collider) {
        let foodItem = other.node.getComponent(FoodItem);
        if (foodItem) {
            let id = foodItem.configItem.idx
            if (this.id>=id) { // 我可以吃他
                //获取自己当前的组成 头部是最大的元素
                foodItem.setFoodState(GameConsts.FoodStateType.died)
                this.updateNowData(foodItem.configItem.score)

            } else { //推着走
                
            }
        }
    }

    private updateNowData(addScore:number){
        //计算出 最新的数据 分别 裁切
        let score = this.getTotalScore()+addScore
        // 将 GameConsts.snakeConfig 转换为数组
        let snakeConfigArray = Object.values(GameConsts.snakeConfig);
        let snakeConfigArrayFinal=[]
        let configItemHead:GameConsts.ItemBlockType;
        let isFirst = true
        for (let i = snakeConfigArray.length-1; i >=0; i--) {
            const v = snakeConfigArray[i];
            if (score >= v.score) {
                score-=v.score
                if (isFirst) {
                    isFirst =false
                    configItemHead=v
                } else {
                    snakeConfigArrayFinal.push(v) 
                }

            }
        }
        //最大的永远是身子
        this.setHeadId(configItemHead.idx)
        for (let i = 0; i < snakeConfigArrayFinal.length; i++) {
            const v = snakeConfigArrayFinal[i];
            if (this.snakeBodyArr.length>i) {
                let foodItem = this.snakeBodyArr[i]
                if (foodItem.state==GameConsts.FoodStateType.died) {
                    let data = this.getEndPositionAngle(i,foodItem)
                    // cc.log(" 腺癌应该方的坐标是 data ",data)
                    foodItem.node.setPosition(data.endPoint);
                    foodItem.rotateHead(data.dir)
                    // this.isPause =true
                    // cc.director.emit('stopControl');
                }
                foodItem.setFoodState(GameConsts.FoodStateType.player)
                foodItem.setId(v.idx)

            }else{ //需要新加载的时候
                let foodNode = cc.instantiate(this.prefabItem);
                this.snakeNode.addChild(foodNode);
                let foodItem: FoodItem = foodNode.getComponent(FoodItem);
                if (foodItem) {
                    foodItem.setTag(GameConsts.ItemColliderType.playerBody)
                    foodItem.setFoodState(GameConsts.FoodStateType.player);
                    foodItem.setId(v.idx);
                }
                let data = this.getEndPositionAngle(i,foodItem)
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
            if (i>=snakeConfigArrayFinal.length) {
                v.setFoodState(GameConsts.FoodStateType.died)
            }
            
        }
    }

    private getTotalScore(){
        //计算出 最新的数据 分别 裁切
        let totalScore = this.configItemHead.score
        for (let i = 0; i < this.snakeBodyArr.length; i++) {
            if (this.snakeBodyArr[i].state==GameConsts.FoodStateType.player) {
                const score = this.snakeBodyArr[i].configItem.score;
                totalScore+=score
            }
        }
        return totalScore   
    }

    private getEndPositionAngle(i:number,foodItem:FoodItem){
        let startNode:cc.Node
        if (i==0) {
            startNode = this.node
        }else{
            startNode = this.snakeBodyArr[i-1].node
        }
        let dis = startNode.width / 2 + foodItem.configItem.foodSize / 2
        //新生成的粗暴的直接放到最后
        let pos = startNode.getPosition().clone()
        // 归一化方向向量（如果 dir 不是单位向量）
        // 计算终点坐标
        let oppositeDir: cc.Vec2 = cc.v2(-this.dir.x, -this.dir.y); // 反方向向量
        let endPoint: cc.Vec2 = pos.add(oppositeDir.mul(dis));
        const dir =endPoint.sub(pos).normalize()
        return {endPoint:endPoint,dir:dir}
   }

}
