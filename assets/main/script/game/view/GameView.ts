import { Config } from "../../../core/config/Config";
import AssetManager from "../../../core/manager/AssetManager";
import { AudioClipName } from "../../../core/sound/AudioClipName";
import AudioManager from "../../../core/sound/AudioManger";
import { GameConsts } from "../../GameConsts";
import FoodItem from "../food/FoodItem";
import SnakeHead from "../snake/SnakeHead";
import SnakeHeadAI from "../snake/SnakeHeadAI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameView extends cc.Component {

    @property(cc.Camera)
    private camera: cc.Camera = null;

    @property(cc.Node)
    private menu: cc.Node = null;

    @property(cc.Node)
    private viewArea: cc.Node = null;

    @property(cc.Node)
    private snakeNode: cc.Node = null;

    @property(cc.Node)
    private snakeAINode: cc.Node = null;

    @property(cc.Node)
    private rankList: cc.Node = null;

    private otherRectPos: cc.Vec2[] = [];

    //排行榜数据 实时刷新
    private rankData: GameConsts.ItemRank[] = [];
    private selfSnake:SnakeHead=null
    private aiSnakeArr:SnakeHeadAI[]=[]

    private addSpeedProp: cc.Node = null;
    private doubleProp: cc.Node = null;

    private gameRankArr: GameConsts.GameItemRank[] = null;

    private gameover:cc.Node=null
    private overLose:cc.Node=null
    private overFinal:cc.Node=null
    private btnRestartFinal:cc.Node=null
    private btnRestartLose:cc.Node=null
    private btnRelogin:cc.Node=null

    
    private overCount:cc.Label=null
    private btnBack:cc.Node=null
    private sound:cc.Node=null

    


    private updateOverCount: Function = null;
    private overCountTime:number=0
    /**复活CD */
    private  isRelifeCdState:boolean=false

    private foodNodePool:FoodItem[]=[]

    private foodPrefab:cc.Prefab=null
    private aiPrefab:cc.Prefab=null

    onload() {
        this.sound.getChildByName("off").active=AudioManager.instance.MusicSource.mute
    }
    protected onEnable(): void {
        this.btnRestartFinal.on(cc.Node.EventType.TOUCH_END, this.onClickBtnRestart, this);
        this.btnRestartLose.on(cc.Node.EventType.TOUCH_END, this.onClickBtnRestartLose, this);
        this.btnRelogin.on(cc.Node.EventType.TOUCH_END, this.onClickBtnRelogin, this);
        this.btnBack.on(cc.Node.EventType.TOUCH_END, this.onClickBtnBack, this);
        this.sound.on(cc.Node.EventType.TOUCH_END, this.onClickBtnSound, this);

        

        
        cc.director.on('gameOverFinal', this.gameOverFinal, this);
        cc.director.on('gameOverLose', this.gameOverLose, this);
        cc.director.on('reflashRankData', this.reflashRankData, this);
        cc.director.on('touchAiBody', this.touchAiBody, this);
        cc.director.on('touchAiHead', this.touchAiHead, this);

        
    }

    protected onDisable(): void {
        this.btnRestartFinal.off(cc.Node.EventType.TOUCH_END, this.onClickBtnRestart, this);
        this.btnRestartLose.off(cc.Node.EventType.TOUCH_END, this.onClickBtnRestartLose, this);
        this.btnRelogin.off(cc.Node.EventType.TOUCH_END, this.onClickBtnRelogin, this);
        this.btnBack.off(cc.Node.EventType.TOUCH_END, this.onClickBtnBack, this);
        this.sound.off(cc.Node.EventType.TOUCH_END, this.onClickBtnSound, this);


        cc.director.off('gameOverFinal', this.gameOverFinal, this);
        cc.director.off('gameOverLose', this.gameOverLose, this);
        cc.director.off('reflashRankData', this.reflashRankData, this);
        cc.director.off('touchAiBody', this.touchAiBody, this);
        cc.director.off('touchAiHead', this.touchAiHead, this);
        
    }
    onLoad() {

        cc.director.getPhysicsManager().enabled = true; 
        cc.director.getCollisionManager().enabled = true;
        cc.director.getPhysics3DManager().enabled=true;


        this.gameRankArr = [];
        for (let i = 0; i < 5; i++) {
            let nodeItem = this.rankList.getChildByName(`rank${i+1}`)
            if (nodeItem) {
                let item: GameConsts.GameItemRank={
                    node:nodeItem,
                    playerName:nodeItem.getChildByName("playerName").getComponent(cc.Label),
                    score:nodeItem.getChildByName("score").getComponent(cc.Label),
                    rank:nodeItem.getChildByName("rankLab"),
                    tag:nodeItem.getChildByName("tag")
                }
                this.gameRankArr.push(item);
            }
        }
        this.gameover=this.node.getChildByName("gameOver")
        this.overLose=this.gameover.getChildByName("overLose")
        this.overFinal=this.gameover.getChildByName("overFinal")
        this.btnRestartFinal=this.overFinal.getChildByName("btnRestart")
        this.btnRestartLose=this.overLose.getChildByName("btnRestart")
        this.btnRelogin=this.overLose.getChildByName("btnRelogin")
        this.overCount=this.menu.getChildByName("overCount").getComponent(cc.Label)

        this.btnBack=this.menu.getChildByName("btnBack")
        this.sound=this.menu.getChildByName("sound")
     }



    startGame(){
        
        AudioManager.instance.playMusic(AudioClipName.music.bgm)
        this.gameover.active =false
        this.clearAllData()
        this.initFood();
        this.initSnakeHead();
        this.initSnakeAIHead();
        this.initAddSpeedProp();
        this.initDoubleProp();
        this.setOverCountTime()

    }

    private clearAllData(){

    }

    private setOverCountTime()
    {
        this.overCountTime =GameConsts.overCountTime
        this.overCount.string = this.getTimeStr(this.overCountTime);
        this.updateOverCount = () => {
            this.overCount.string = this.getTimeStr(this.overCountTime);
            if (this.overCountTime<=0) {
                // 关闭调度器
                this.unschedule(this.updateOverCount);
                this.gameOverFinal();
            }
            this.overCountTime--;
        };
        this.schedule(this.updateOverCount, 1);
    }

    private getTimeStr(num:number){
        let str ="00:00"
        if (num>0) {
            let min = Math.floor(num/60)
            let sec = num%60
            str= `${min<10?"0"+min:min}:${sec<10?"0"+sec:sec}`
        }
        return str
    }

    update(dt) {

        // 获取相机节点在世界坐标系中的位置
        let cameraWorldPos = this.camera.node.convertToWorldSpaceAR(cc.Vec3.ZERO);

        // 将相机节点的世界坐标转换为UI坐标
        let menuPos = this.node.convertToNodeSpaceAR(cameraWorldPos);

        // 设置menu节点的位置为UI坐标
        this.menu.setPosition(menuPos);

        
        if (this.gameover.active) {
            this.gameover.setPosition(menuPos);
        }
        // 保持menu节点的角度与相机节点一致
        this.menu.angle = this.camera.node.angle;
    }

    initFood() {
        // 定义食物 ID 数组
   
        // 生成不重复的食物位置
        const foodPositions: cc.Vec2[] = this.generateRandomPositions(Config.FoodLength.numFoods);

        this.otherRectPos = this.generateOtherRectRandomPositions(foodPositions);

        for (let i = 0; i < this.otherRectPos.length; i++) {
            CC_DEBUG && cc.log(`viewArea中空余场地位置,x:${Math.floor(this.otherRectPos[i].x)},y:${Math.floor(this.otherRectPos[i].y)}`);
        }
        if (this.foodPrefab) {
            this.initFoodFinal(foodPositions)
        } else {
            AssetManager.instance.loadAsset(Config.Prefab.FoodItem, cc.Prefab).then(prefab => {
                if (prefab) {
                    this.foodPrefab=prefab
                    this.initFoodFinal(foodPositions)
                }
            }).catch(err => {
                cc.error(err);
            }) 
        }
    }
    private initFoodFinal(foodPositions: cc.Vec2[]){
        const foodIds: number[] = [ 0,0,0,1, 2, 3, 4];
                // 循环加载食物预制件
                for (let i = 0; i < Config.FoodLength.numFoods; i++) {
                    let foodIdx = foodIds[i % foodIds.length];
                    // cc.log("initFood foodIdx  001 ==  "+foodIdx);
                    if (this.foodNodePool.length > i) {
                        let foodItem= this.foodNodePool[i];
                            foodItem.setFoodState(GameConsts.FoodStateType.state);
                            foodItem.setId(foodIdx);
                    }else{
                        let foodNode = cc.instantiate(this.foodPrefab);
                        foodNode.setPosition(foodPositions[i]);
                        this.viewArea.addChild(foodNode);
                        let foodItem: FoodItem = foodNode.getComponent(FoodItem);
                        if (foodItem) {
                            foodItem.setFoodState(GameConsts.FoodStateType.state);
                            foodItem.setId(foodIdx);
                        }
                        this.foodNodePool.push(foodItem);
                    }
                }
    }

    generateRandomPositions(numPositions: number): cc.Vec2[] {
        const positions: cc.Vec2[] = [];
        const generatedPositions = new Set<string>();
        const minDistance = 200;

        /**
         * x和y参数是负数，因为屏幕的原点通常被定义为左下角，而不是左上角。因此，左下角的坐标是(0,0)，而不是(screenWidth,screenHeight)。
         * 为了将屏幕的可见区域定义为以原点为中心的矩形，x和y参数需要向左和向下移动半个屏幕的宽度和高度，即-screenWidth / 2和-screenHeight / 2。
         */
        const screenRect = cc.rect(-Config.Screen.Width / 2, -Config.Screen.Height / 2, Config.Screen.Width, Config.Screen.Height);

        // 玩家位置
        const playerPosition = new cc.Vec2(0, 0);

        while (positions.length < numPositions) {
            const x = screenRect.xMin + Math.random() * screenRect.width;
            const y = screenRect.yMin + Math.random() * screenRect.height;
            const position = new cc.Vec2(x, y);

            // 检查生成的位置是否与玩家位置太近
            const isTooCloseToPlayer = cc.Vec2.distance(position, playerPosition) < minDistance;

            if (isTooCloseToPlayer) {
                continue; // 如果位置太靠近玩家，跳过本次循环
            }

            if (generatedPositions.has(position.toString())) {
                continue; // 如果位置已经生成过，跳过本次循环
            }

            const isDuplicate = positions.some(p => cc.Vec2.distance(p, position) < minDistance);
            if (!isDuplicate) {
                positions.push(position);
                generatedPositions.add(position.toString());
            }
        }

        return positions;
    }

    generateOtherRectRandomPositions(existingPositions: cc.Vec2[]): cc.Vec2[] {
        const positions: cc.Vec2[] = [];
        const generatedPositions = new Set<string>();
        const minDistance = 200;

        // 定义所有区域的边界矩形
        const screenRect = cc.rect(-Config.Screen.Width / 2, -Config.Screen.Height / 2, Config.Screen.Width, Config.Screen.Height);
        const addSpeedPropRect = cc.rect(-Config.PropSize.addSpeedPropSize.width / 2, -Config.PropSize.addSpeedPropSize.height / 2, Config.PropSize.addSpeedPropSize.width, Config.PropSize.addSpeedPropSize.height);
        const blockmulby2Rect = cc.rect(-Config.PropSize.doubledPropSize.width / 2, -Config.PropSize.doubledPropSize.height / 2, Config.PropSize.doubledPropSize.width, Config.PropSize.doubledPropSize.height);
        const snakeHeadAI1Rect = cc.rect(-25, -25, 50, 50);
        const snakeHeadAI2Rect = cc.rect(-25, -25, 50, 50);
        const snakeHeadAI3Rect = cc.rect(-25, -25, 50, 50);
        const snakeHeadAI4Rect = cc.rect(-25, -25, 50, 50);
        const snakeHeadAI5Rect = cc.rect(-25, -25, 50, 50);

        // 定义所有区域
        const rects = [addSpeedPropRect, blockmulby2Rect, snakeHeadAI1Rect, snakeHeadAI2Rect, snakeHeadAI3Rect, snakeHeadAI4Rect, snakeHeadAI5Rect];

        // 生成除了食物位置之外的特定区域的位置
        for (const rect of rects) {
            while (positions.length < rects.length) {
                const x = screenRect.xMin + Math.random() * screenRect.width;
                const y = screenRect.yMin + Math.random() * screenRect.height;
                const position = new cc.Vec2(x, y);

                // 检查当前位置是否已经生成过或者与其他位置太近
                const isDuplicate = positions.some(p => cc.Vec2.distance(p, position) < minDistance) ||
                    existingPositions.some(p => cc.Vec2.distance(p, position) < minDistance);

                if (!isDuplicate) {
                    positions.push(position);
                    generatedPositions.add(position.toString());
                    break; // 如果生成了有效位置，退出当前循环
                }
            }
        }

        return positions;
    }

    initSnakeHead() {
        if (!this.selfSnake) {
            AssetManager.instance.loadAsset(Config.Prefab.SnakeHead, cc.Prefab).then(prefab => {
                if (prefab) {
                    let head: cc.Node = cc.instantiate(prefab);
                    this.snakeNode.addChild(head);
                    let snakeHead = head.getComponent(SnakeHead);
                    snakeHead.initView()
                    snakeHead.setName("letsGo")
                    snakeHead.setColliderTag(GameConsts.ItemColliderType.player)
                    this.selfSnake =snakeHead
                    cc.director.emit('addHead');
                }
            }).catch(err => {
                cc.error(err)
            })
        }else{
            this.selfSnake.startGame()
        }
    }


    initSnakeAIHead() {
        //随机几个Ai头
        if (this.aiPrefab) {
            this.initSnakAIFinal()
        } else {
            AssetManager.instance.loadAsset(Config.Prefab.SnakeAIHead, cc.Prefab).then(prefab => {
                if (prefab) {
                    this.aiPrefab=prefab
                    this.initSnakAIFinal()
                }
            }).catch(err => {
                cc.error(err);
            }) 
        }
    }
    private initSnakAIFinal(){
        let aiCount = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < this.aiSnakeArr.length; i++) {
            this.aiSnakeArr[i].node.active =false
        }
        for (let i = 0; i < aiCount; i++) {
            let snakeHead :SnakeHeadAI
            if (this.aiSnakeArr.length > i) {
                snakeHead = this.aiSnakeArr[i]

            }else{
                let head: cc.Node = cc.instantiate(this.aiPrefab);
                this.snakeAINode.addChild(head);
                head.setPosition(cc.v2(Math.floor(this.otherRectPos[i].x), Math.floor(this.otherRectPos[i].y)));
                cc.log("AISnake position:" + head.position);
                snakeHead = head.getComponent(SnakeHeadAI);
                snakeHead.initView()
                this.aiSnakeArr.push(snakeHead)
            }
            snakeHead.setName("player"+(i+1))
            snakeHead.setColliderTag(GameConsts.ItemColliderType.ai+i*10)
            snakeHead.node.setPosition(cc.v2(Math.floor(this.otherRectPos[i].x), Math.floor(this.otherRectPos[i].y)));
            snakeHead.startGame()

        }
    }

    initAddSpeedProp() {
        if (this.addSpeedProp) {
            this.addSpeedProp.active =true
        }else{
            AssetManager.instance.loadAsset(Config.Prefab.AddSpeedProp, cc.Prefab).then(prefab => {
                if (prefab) {
                    let speedProp = cc.instantiate(prefab);
                    speedProp.setParent(this.viewArea);
                    speedProp.setPosition(cc.v2(Math.floor(this.otherRectPos[5].x), Math.floor(this.otherRectPos[5].y)));
                    this.addSpeedProp =speedProp
                }
            })
        }
    }

    private initDoubleProp() {
        if (this.doubleProp) {
            this.doubleProp.active =true
        }else{
            AssetManager.instance.loadAsset(Config.Prefab.DoubleProp, cc.Prefab).then(prefab => {
                if (prefab) {
                    let doubleProp = cc.instantiate(prefab);
                    doubleProp.setParent(this.viewArea);
                    // doubleProp.setPosition(cc.v2(400, 0));
                    doubleProp.setPosition(cc.v2(Math.floor(this.otherRectPos[6].x), Math.floor(this.otherRectPos[6].y)));
                    this.doubleProp =doubleProp
                }
            })
        }


    }

    /** 刷新排名数据 */
    private reflashRankData(){
        this.rankData = []
        // 获取自己的数据
        let selfData: GameConsts.ItemRank = {
            score: this.selfSnake.totalScore,
            playerName: this.selfSnake.playerName,
            isSelf: true
        }
        this.rankData.push(selfData)
        for (let i = 0; i < this.aiSnakeArr.length; i++) {
            const v = this.aiSnakeArr[i];
            let data: GameConsts.ItemRank = {
                score: v.totalScore,
                playerName: v.playerName,
                isSelf: false
            }
            this.rankData.push(data)
        }
        this.reflashRankView()
    }

    /** 刷新排名 */
    private reflashRankView(){
        for (let i = 0; i < this.gameRankArr.length; i++) {
            const v = this.gameRankArr[i];
            if (this.rankData.length>i) {
                v.node.active=true
                v.playerName.string=this.rankData[i].playerName
                v.score.string=this.rankData[i].score.toString()
                let clrTmp = cc.color(0, 0, 0);
                v.tag.active =this.rankData[i].isSelf
                if (this.rankData[i].isSelf) {
                    v.playerName.node.color = clrTmp.fromHEX("#fef500")
                    v.score.node.color = clrTmp.fromHEX("#fef500")
                    v.rank.color = clrTmp.fromHEX("#fef500")
                }else{
                    v.playerName.node.color = clrTmp.fromHEX("#ffffff")
                    v.score.node.color = clrTmp.fromHEX("#ffffff")
                    v.rank.color = clrTmp.fromHEX("#ffffff")
                }
            }else{
                v.node.active=false
            }
        }
    }


    /**时间到 真实结束 展示排行榜 */
    private gameOverFinal(){
        this.gameover.active =true
        this.overLose.active =false
        this.overFinal.active =true
        let contentNode=this.overFinal.getChildByName("scro").getComponent(cc.ScrollView).content
        let itemNode=this.overFinal.getChildByName("rankItem")
        itemNode.active =false
        contentNode.removeAllChildren()
        for (let i = 0; i < this.rankData.length; i++) {
            const v = this.rankData[i];
            let item = cc.instantiate(itemNode)
            item.active =true
            item.parent =contentNode
            item.getChildByName("tag").active =v.isSelf
            let str =(i+1)+"  "+v.playerName+"    "+v.score.toString()
            let desLab = item.getChildByName("des")
            desLab.getComponent(cc.Label).string=str
            let clrTmp = cc.color(0, 0, 0);
            if (v.isSelf) {
                this.overFinal.getChildByName("rankSelf").getComponent(cc.Label).string=str
                desLab.color = clrTmp.fromHEX("#fef500")
            }else{
                desLab.color = clrTmp.fromHEX("#ffffff")
            }

        }
    }

    /** 中途被淘汰 */
    private gameOverLose(){
        this.gameover.active =true
        this.overLose.active =true
        this.overFinal.active =false
        this.isRelifeCdState = true

        let timeCountLab=  this.overLose.getChildByName("timeCount").getComponent(cc.Label)
        let timeCount = GameConsts.relifeCDTime
        let updateOverCountTemp = () => {
            timeCountLab.string = timeCount.toString()
            if (timeCount<=0) {
                // 关闭调度器
                this.unschedule(updateOverCountTemp);
                this.isRelifeCdState = false;
            }
            timeCount--;
        };
        this.schedule(updateOverCountTemp, 1);
    }
    
    /** 重新开始游戏 */
    private onClickBtnRestart(){
        AudioManager.instance.playEffect(AudioClipName.effect.click)
        this.gameover.active=false
        this.selfSnake.startGame()
        this.setOverCountTime()
    }

    private onClickBtnRestartLose(){
        AudioManager.instance.playEffect(AudioClipName.effect.click)
        if (!this.isRelifeCdState) {
            this.gameover.active=false
            this.selfSnake.startGame()
        }
    }

    private onClickBtnRelogin(){
        AudioManager.instance.playEffect(AudioClipName.effect.click)
        this.node.active = false;
        this.node.parent.getChildByName("Loading").active = true;
    }
    private onClickBtnBack(){
        AudioManager.instance.playEffect(AudioClipName.effect.click)
        this.node.active = false;
        this.node.parent.getChildByName("Loading").active = true;
    }

    private onClickBtnSound(){
        AudioManager.instance.playEffect(AudioClipName.effect.click)
        AudioManager.instance.toggleMusic()
        this.sound.getChildByName("off").active=AudioManager.instance.MusicSource.mute
    }
    


    /**AI 头碰到我的头 */
    private touchAiHead(other: cc.Collider){
        let snakHeadAI = other.node.getComponent(SnakeHeadAI);
        if (snakHeadAI) {
            if (this.selfSnake.configItemHead.idx >snakHeadAI.configItemHead.idx) {
                let score = snakHeadAI.totalScore+this.selfSnake.totalScore
                this.selfSnake.updateNowData(score)
                snakHeadAI.beKill()
            } else if (this.selfSnake.configItemHead.idx <snakHeadAI.configItemHead.idx) {
                //游戏结束
                let score = snakHeadAI.totalScore+this.selfSnake.totalScore
                snakHeadAI.updateNowData(score)
                this.selfSnake.beKill()
            }
        }
    }

    /**AI 身体 碰到我的头 */
    private touchAiBody(other: cc.Collider){
        if (other.tag>=GameConsts.ItemColliderType.ai) {
            //判断是身子还是 车头 车头要咬死 屁股要吃了当前碰撞的 格子 如果是中间吃掉的要让他分离
            let yuNum = other.tag % 10;
            if (yuNum!=0) { //头 直接杀了吃它全部积分找出他的主人
                let snakHeadAI = this.getAiSnakHost(other)
                if (snakHeadAI) {
                    let configItem = other.getComponent(FoodItem)?.configItem
                    let idx= configItem.idx
                    if (this.selfSnake.configItemHead.idx >idx) { 
                        let arr=  snakHeadAI.bodyKill(other)
                        this.createFoodItemArr(arr.slice(1))
                        let score = configItem.score+this.selfSnake.totalScore
                        this.selfSnake.updateNowData(score)
                    } else if (this.selfSnake.configItemHead.idx <idx) {// 否则被他给杀死
                        //游戏结束
                        let score = snakHeadAI.totalScore+this.selfSnake.totalScore
                        snakHeadAI.updateNowData(score)
                        this.selfSnake.beKill()
                    }
                }
            }
        }

    }

    private createFoodItemArr(arr:FoodItem[]){
        let canUsePool :FoodItem[]= []
        for (let i = 0; i < this.foodNodePool.length; i++) {
            const v = this.foodNodePool[i];
            if (v.state==GameConsts.FoodStateType.died) {
                canUsePool.push(v)
            }
        }
        if (canUsePool.length<arr.length) {
            for (let i = 0; i < arr.length-canUsePool.length; i++) {
                let foodNode = cc.instantiate(this.foodPrefab);
                this.viewArea.addChild(foodNode);
                let foodItem: FoodItem = foodNode.getComponent(FoodItem);
                this.foodNodePool.push(foodItem);
                canUsePool.push(foodItem)
            }
        }
        //原位置放回去
        for (let i = 0; i < arr.length; i++) {
            canUsePool[i].setId(arr[i].configItem.idx);
            canUsePool[i].node.setPosition(arr[i].node.getPosition());
            canUsePool[i].node.rotation=arr[i].node.rotation
        }
    }


    private getAiSnakHost(other: cc.Collider){
        let tagNum =other.tag- other.tag % 10;
        for (let i = 0; i < this.aiSnakeArr.length; i++) {
            const v = this.aiSnakeArr[i];
            if (v.boxCol.tag==tagNum) {
                return v
            }
        }
        return null
    }


}
