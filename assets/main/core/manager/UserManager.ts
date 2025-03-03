import EventName from "../event/EventName";
import PlayerCache from "../utils/PlayerCache";
export default class UserManager {

    private static _instance: UserManager = null;

    public static get instance() {
        if (!this._instance) {
            this._instance = new UserManager();
        }
        return this._instance;
    }

    private _score: number = 0;
    public getscore(): number {
        this._score = PlayerCache.get(EventName.score)
        return this._score;
    }

    public setScore(score: number) {
        this._score = score;
        PlayerCache.set(EventName.score, score);
    }

    private _bestscore: number = 0;
    public getBestScore(): number {
        this._bestscore = PlayerCache.get(EventName.best_score);
        return this._bestscore;
    }

    public setBestScore(bestscore: number) {
        this._bestscore = bestscore;
        PlayerCache.set(EventName.best_score, bestscore);
    }
}