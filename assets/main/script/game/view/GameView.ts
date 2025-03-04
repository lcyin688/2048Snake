import { Config } from "../../../core/config/Config";
import AssetManager from "../../../core/manager/AssetManager";
import { GameConsts } from "../../GameConsts";
import FoodItem from "../food/FoodItem";
import SnakeHead from "../snake/SnakeHead";

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

    private otherRectPos: cc.Vec2[] = [];

    private foodNodePool: FoodItem[] = [];

    onLoad() { }

    start() {
        this.initFood();
        this.initSnakeHead();
        // this.initSnakeAIHead();
        // this.initAddSpeedProp();
        // this.initBlockmulby2Prop();
    }

    update(dt) {

        // 获取相机节点在世界坐标系中的位置
        let cameraWorldPos = this.camera.node.convertToWorldSpaceAR(cc.Vec3.ZERO);

        // 将相机节点的世界坐标转换为UI坐标
        let menuPos = this.node.convertToNodeSpaceAR(cameraWorldPos);

        // 设置menu节点的位置为UI坐标
        this.menu.setPosition(menuPos);

        // 保持menu节点的角度与相机节点一致
        this.menu.angle = this.camera.node.angle;
    }

    initFood() {
        // 定义食物 ID 数组
        const foodIds: number[] = [0, 1, 2, 3, 4];
        // 生成不重复的食物位置
        const foodPositions: cc.Vec2[] = this.generateRandomPositions(Config.FoodLength.numFoods);

        this.otherRectPos = this.generateOtherRectRandomPositions(foodPositions);

        for (let i = 0; i < this.otherRectPos.length; i++) {
            CC_DEBUG && cc.log(`viewArea中空余场地位置,x:${Math.floor(this.otherRectPos[i].x)},y:${Math.floor(this.otherRectPos[i].y)}`);
        }

        // 循环加载食物预制件
        for (let i = 0; i < Config.FoodLength.numFoods; i++) {
            let foodIdx = foodIds[i % foodIds.length];
            // cc.log("initFood foodIdx  001 ==  "+foodIdx);
            AssetManager.instance.loadAsset(Config.Prefab.FoodItem, cc.Prefab).then(prefab => {
                if (prefab) {
                    let foodNode = cc.instantiate(prefab);
                    foodNode.setPosition(foodPositions[i]);
                    this.viewArea.addChild(foodNode);
                    let foodItem: FoodItem = foodNode.getComponent(FoodItem);
                    if (foodItem) {
                        foodItem.setFoodState(GameConsts.FoodStateType.state);
                        foodItem.setId(foodIdx);
                    }
                    this.foodNodePool.push(foodItem);
                }
            }).catch(err => {
                cc.error(err);
            })
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
        const addSpeedPropRect = cc.rect(-Config.PropSize.AddSpeedPropWidth / 2, -Config.PropSize.AddSpeedPropHeight / 2, Config.PropSize.AddSpeedPropWidth, Config.PropSize.AddSpeedPropHeight);
        const blockmulby2Rect = cc.rect(-Config.PropSize.Blockmulby2PropWidth / 2, -Config.PropSize.Blockmulby2PropHeight / 2, Config.PropSize.Blockmulby2PropWidth, Config.PropSize.Blockmulby2PropHeight);
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
        AssetManager.instance.loadAsset(Config.Prefab.SnakeHead, cc.Prefab).then(prefab => {
            if (prefab) {
                let head: cc.Node = cc.instantiate(prefab);
                head.getComponent(cc.Collider).tag = GameConsts.ItemColliderType.player;
                this.snakeNode.addChild(head);
                let snakeHead = head.getComponent(SnakeHead);
                snakeHead.setHeadId(0);
                head.position = cc.v3(0, 0);
                cc.director.emit('addHead');
            }
        }).catch(err => {
            cc.error(err)
        })
    }


    initSnakeAIHead() {
        AssetManager.instance.loadAsset(Config.Prefab.SnakeAIHead, cc.Prefab).then(prefab => {
            for (let i = 0; i < 5; i++) {
                if (prefab) {
                    let headAI: cc.Node = cc.instantiate(prefab);
                    headAI.getComponent(cc.Collider).tag = GameConsts.ItemColliderType.ai;
                    this.snakeAINode.addChild(headAI);
                    headAI.setPosition(cc.v2(Math.floor(this.otherRectPos[i].x), Math.floor(this.otherRectPos[i].y)));
                    cc.log("AISnake position:" + headAI.position);
                }
            }
        }).catch(err => {
            cc.error(err)
        })
    }

    initAddSpeedProp() {
        AssetManager.instance.loadAsset(Config.Prefab.AddSpeedProp, cc.Prefab).then(prefab => {
            if (prefab) {
                let speedProp = cc.instantiate(prefab);
                speedProp.setParent(this.viewArea);
                speedProp.setPosition(cc.v2(Math.floor(this.otherRectPos[5].x), Math.floor(this.otherRectPos[5].y)));
            }
        })
    }

    initBlockmulby2Prop() {
        AssetManager.instance.loadAsset(Config.Prefab.Blockmulby2Prop, cc.Prefab).then(prefab => {
            if (prefab) {
                let blockmulby2Prop = cc.instantiate(prefab);
                blockmulby2Prop.setParent(this.viewArea);
                blockmulby2Prop.setPosition(cc.v2(Math.floor(this.otherRectPos[6].x), Math.floor(this.otherRectPos[6].y)));
            }
        })
    }
}
