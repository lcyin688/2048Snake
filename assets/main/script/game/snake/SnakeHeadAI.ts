import { Config } from "../../../core/config/Config";
import AssetManager from "../../../core/manager/AssetManager";
import { GameConsts } from "../../GameConsts";
import FoodItem from "../food/FoodItem";
import FoodMgr from "../food/FoodItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SnakeHeadAI extends cc.Component {

    dir: cc.Vec2 =  cc.Vec2.UP; // 初始方向为向上
    speed: number = 0;
    id: number = null;

    state = GameConsts.PlayStateType.state;
    configItemHead:GameConsts.ItemBlockType = null;
    socreLab: cc.Label = null;

    boxCol: cc.BoxCollider = null;
    phyBoxCol: cc.PhysicsBoxCollider = null;

    /**蛇身子 */
    snakeBodyArr:FoodItem[]=[]
    private prefabItem: cc.Prefab


    isPause: boolean = false;
    public isFlashing :boolean =true
    private snakeNode:cc.Node = null;

    /**总分数 */
    totalScore: number = 0;
    /** 名字 */
    playerName:string=""


    onLoad() {
        this.initView()
    }

   public initView(){
        if (!this.boxCol) {
            this.socreLab = this.node.getChildByName('lab').getComponent(cc.Label);
            this.boxCol = this.node.getComponent(cc.BoxCollider);
            this.phyBoxCol = this.node.getComponent(cc.PhysicsBoxCollider);
            this.node.group =GameConsts.snakePhyTagConfig.Group4
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
        AssetManager.instance.loadAsset(Config.Prefab.aiBodyItem, cc.Prefab).then(prefab => {
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

    setName(str: string) {
        this.playerName=str
        this.node.name = str
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
        this.speed = speed*0.9
        // cc.log('当前移速:' + this.speed);
    }

    public getSpeed(): number {
        return this.speed;
    }


    init() {
        // 确保 snakeArray 包含蛇头节点
        this.snakeNode =this.node.parent
        this.startGame()
    }


    startGame(){
        this.node.active =true
        this.isPause =false
        this.setHeadId(0);
        this.snakeBodyArr = [];
        this.setSpeed(Config.MoveSpeed.Speed );
        this.setPlayState(GameConsts.PlayStateType.play)
        //进入游戏玩家需要闪烁两秒，在闪烁其间玩家可以移动，但是不能吃掉其他方块
        this.isFlashing = true;
        let time=0.3
        let action =cc.tween(this.node).to(time,{opacity:100}).delay(time).to(time,{opacity:250})
        cc.tween(this.node)
        .repeat(4, action)
        .call(()=>{
            this.isFlashing = false;
        })
        .start();
        let score = this.getTotalScore()
        this.reflashScore(score)
        this.updateSnakeDirection()
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
            { tag1: this.boxCol.tag, tag2: this.boxCol.tag+1 },
            { tag1: this.boxCol.tag+1, tag2: this.boxCol.tag }
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
        cc.log(`AI 触发碰撞，tag：${other.tag}`)
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
            default:
                this.collisionElseEnter(other, self);
                break;
        }
    }
    /**其他的碰撞 AI碰到AI AI 碰到玩家 */
    collisionElseEnter(other: cc.Collider, self: cc.Collider) {
        cc.log(`AI 触发碰撞，tag：${other.tag}`)
        


    }


    /**获得加速道具 */
    private getPropSpeed(other: cc.Collider) {
        other.node.active =false
        this.setSpeed(this.speed * 1.5)
        cc.tween(this.node).delay(20).call(()=>{
            other.node.active =true
        }).start()
    }
    /**获得加速道具 */
    private getPropDouble(other: cc.Collider) {
        other.node.active =false
        this.setScoreDouble(15)
        cc.tween(this.node).delay(1).call(()=>{
            other.node.active =true
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
            if (foodItem.state==GameConsts.FoodStateType.playing) {
                this.moveBodyItem(foodItem,i)
            }
        }
    }

    private  moveBodyItem(foodItem:FoodItem, i: number){
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
        let foodItem = other.node.getComponent(FoodItem);
        if (foodItem) {
            let id = foodItem.configItem.idx
            if (this.id>=id) { // 我可以吃他
                //获取自己当前的组成 头部是最大的元素
                foodItem.setFoodState(GameConsts.FoodStateType.died)
                        //计算出 最新的数据 分别 裁切
                let score = this.getTotalScore()+foodItem.configItem.score
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

    private setScoreDouble(bet:number){
        let score = this.getTotalScore()*bet
        this.updateNowData(score)
    }

    private reflashScore(score:number){
        this.totalScore = score
        cc.director.emit('reflashRankData');
    }

    private updateNowData(score:number){
        this.reflashScore(score)
        // 将 GameConsts.snakeConfig 转换为数组
        let snakeConfigArray = Object.values(GameConsts.snakeConfig);
        let snakeConfigArrayFinal:GameConsts.ItemBlockType[]=[]
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
        //如果身子已经是 1024 那就游戏结束
        if (configItemHead.idx==9) {
            this.isPause =true
            cc.director.emit('gameOverFinal');
            return
        }
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
                foodItem.setFoodState(GameConsts.FoodStateType.playing)
                foodItem.setId(v.idx)
                foodItem.setGroupTag(GameConsts.snakePhyTagConfig.Group4)
            }else{ //需要新加载的时候
                let foodNode = cc.instantiate(this.prefabItem);
                this.snakeNode.addChild(foodNode);
                let foodItem: FoodItem = foodNode.getComponent(FoodItem);
                if (foodItem) {
                    foodItem.setBoxTag(GameConsts.ItemColliderType.playerBody)
                    foodItem.setPhyBoxTag(GameConsts.ItemColliderType.playerBody)
                    foodItem.setFoodState(GameConsts.FoodStateType.playing);
                    foodItem.setId(v.idx);
                    foodItem.setGroupTag(GameConsts.snakePhyTagConfig.Group4)
                    foodItem.node.name=this.playerName+"_"+v.score
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
        if (this.state==GameConsts.PlayStateType.died) {//死了后统统清0
            return 0
        }
        let totalScore = this.configItemHead.score
        for (let i = 0; i < this.snakeBodyArr.length; i++) {
            if (this.snakeBodyArr[i].state==GameConsts.FoodStateType.playing) {
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

   public setColliderTag(tag:number){
        this.boxCol.tag = tag
        this.phyBoxCol.tag = tag
    }

    private updateSnakeDirection() {
        let timeArr =[2,3,5,7,8]
        let randomIndex = Math.floor(Math.random()*timeArr.length)
        this.scheduleOnce(()=>{
            const randomDir = cc.v2(Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
            this.dir = randomDir;
            this.updateSnakeDirection()
        }, timeArr[randomIndex]);
    }

    /**嘎了 */
    public beKill() {
        this.isPause = true
        this.node.stopAllActions()
        cc.tween(this.node).to(0.5,{opacity:1}).call(()=>{
            this.node.active =false
            this.reflashScore(0)
            this.state = GameConsts.PlayStateType.died;
            // this.configItemHead=null
            for (let i = 0; i < this.snakeBodyArr.length; i++) {
                const v = this.snakeBodyArr[i];
                v.setFoodState(GameConsts.FoodStateType.died)

            }
        }).start() 
    }


}
