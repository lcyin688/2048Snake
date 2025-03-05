
export namespace Config {

    export namespace Prefab {
        export const FoodItem = "prefab/food/foodItem";
        export const SnakeHead = "prefab/snakeHead/head";
        export const SnakeAIHead = "prefab/snakeHead/headAI";
        export const Countdown = "prefab/countdown/countdown";
        export const AddSpeedProp = "prefab/prop/addSpeed";
        export const DoubleProp = "prefab/prop/double";
    }

    export namespace Volume {
        export const musicvolume = 0.6;
        export const effectvolume = 1;
    }

    export namespace Texture {
        export const FoodSp = "texture/game/item/"
    }

    export namespace MoveSpeed {
        export const Speed: number = 3;
    }

    export namespace Screen {
        export const Width: number = 12800 - 1200 * 2;
        export const Height: number = 10800 - 1200 * 2;
    }

    export namespace FoodLength {
        export const numFoods: number = 500; // 食物数量
    }

    export const PropSize ={
        /** 加速道具 */
        addSpeedPropSize:cc.size(116,116),
        /** 翻倍道具 */
        doubledPropSize:cc.size(116,116),
        /** 减半道具 */
        halvedPropSize:cc.size(116,116)
    }
}


