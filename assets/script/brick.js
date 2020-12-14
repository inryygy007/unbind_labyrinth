
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        //this.isVisited = false;//一开始初始化为没有被访问过
    },
    //设置禁止点击
    forbid_click(state) {
        this.node.getChildByName("New Button").getComponent('cc.Button').interactable = state;
    },
    //砖块颜色控制
    brick_colour(R, G, B) {
        this.node.getChildByName('brick_sprite').color = new cc.Color(R, G, B);
    },
    //名字
    Name(name, hang, lie) {
        this.ID = name;
        this.hang = hang;
        this.lie = lie;
    },
    //点击按钮
    button() {
        this.bei_dianji = true;
        this.clock = Date.now();
    },
    //是否这个块被访问过
    isValid() {
        return !this.isVisited;
    },
    //设置这个块被访问过
    setVisited(is_visited) {
        this.isVisited = is_visited;
    },
    //重置按钮状态
    reset_button() {
        this.bei_dianji = false;
    }
    // update (dt) {},
});
