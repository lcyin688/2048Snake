import { Config } from "../../../core/config/Config";
import { GameConsts } from "../../GameConsts";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FoodItem extends cc.Component {


    private id: number = null;

    configItem:GameConsts.ItemBlockType = null;
    socreLab: cc.Label = null;
    boxCol: cc.BoxCollider = null;
    state = GameConsts.FoodStateType.state;
    phyboxCol: cc.PhysicsBoxCollider = null;
    onLoad() { 
        this.socreLab = this.node.getChildByName('lab').getComponent(cc.Label);
        this.boxCol = this.node.getComponent(cc.BoxCollider);
        this.setBoxTag(GameConsts.ItemColliderType.food)
        this.phyboxCol = this.node.getComponent(cc.PhysicsBoxCollider);
        this.setPhyBoxTag(GameConsts.ItemColliderType.food)
        this.setGroupTag(GameConsts.snakePhyTagConfig.Group1)
    }

    public setGroupTag(tag:string){
        this.node.group =tag
    }

    setFoodState(type: GameConsts.FoodStateType) {
        this.state = type;
        if(type == GameConsts.FoodStateType.died) { 
            this.node.active = false;
        }else  {
            this.node.active = true;
        }

    }

    public setId(id: number) {
        this.id = id;
        this.configItem = GameConsts.snakeConfig[this.id];
        this.node.name="food_"+this.configItem.score
        this.setSize(this.configItem.foodSize,this.configItem.foodSize)
        this.setStr();  
        let spName =  Config.Texture.FoodSp + this.configItem.spName;
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

    public getId(): number {
        return this.id;
    }



    public setStr() {
        this.socreLab.string = this.configItem.score.toString();
        let clrTmp = cc.color(0, 0, 0);
        this.socreLab.node.color = clrTmp.fromHEX(this.configItem.colorStr).clone();
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


    public rotateHead(headPos) {
        let angle = cc.v2(1, 0).signAngle(headPos) * 180 / Math.PI;
        this.node.angle = angle - 90;
    }

    public setBoxTag(typ: GameConsts.ItemColliderType) {
        this.boxCol.tag = typ
    }

    public setPhyBoxTag(typ: GameConsts.ItemColliderType) {
        this.phyboxCol.tag = typ
    }

}
