
export namespace Config {

    export namespace Prefab {
        export const Food = "prefab/food/";
        export const SnakeHead = "prefab/snakeHead/head";
        export const SnakeAIHead = "prefab/snakeHead/headAI";
        export const Countdown = "prefab/countdown/countdown";
        export const AddSpeedProp = "prefab/prop/AddSpeed";
        export const Blockmulby2Prop = "prefab/prop/Blockmulby2";
    }

    export namespace Volume {
        export const musicvolume = 0.6;
        export const effectvolume = 1;
    }

    export namespace Texture {
        export const FoodSp = "texture/game/item/"
    }

    export namespace Size {
        export const FoodSize = [50, 55, 60, 65, 70, 75, 80]
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

    export namespace PropSize {
        export const AddSpeedPropWidth: number = 116;
        export const AddSpeedPropHeight: number = 116;

        export const Blockmulby2PropWidth: number = 116;
        export const Blockmulby2PropHeight: number = 116;
    }
}


