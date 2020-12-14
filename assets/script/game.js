const Stack = require("./stack");
const gap = 10;
//键对值
const colour1 = {
    0: [100, 100, 100],
    1: [255, 255, 255],
    2: [255, 0, 0],
    3: [255, 255, 0],
}
cc.Class({
    extends: cc.Component,

    properties: {
        //砖块预制物
        brick_prefab: {
            type: cc.Prefab,
            default: null
        },
        //光点预制物
        game_character_prefab: {
            type: cc.Prefab,
            default: null
        },
        game_node: {
            type: cc.Node,
            default: null
        }
    },
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    //启动按钮
    enablement() {
        //this.add_brick(di_tu_arr);
        let num = 0;
        this.time = 0;
        //this.location = [];
        //这部分没用
        this.bei_dianji = false;
        for (let i = 0; i < this.di_tu_arr.length; i++) {
            for (let j = 0; j < this.di_tu_arr[i].length; j++) {
                let temp = this.di_tu_arr[i][j].getComponent('brick').ID;
                let colour = colour1[temp];
                this.di_tu_arr[i][j].getComponent('brick').brick_colour(colour[0], colour[1], colour[2]);
                this.di_tu_arr[i][j].getComponent('brick').setVisited(false);
                if (num < 2 && this.di_tu_arr[i][j].getComponent('brick').bei_dianji) {
                    this.location[num] = {
                        obj: this.di_tu_arr[i][j],
                        hang: i,
                        lie: j,
                        clock: this.di_tu_arr[i][j].getComponent('brick').clock
                    }
                    num++;
                    this.bei_dianji = true;
                }
            }
        }
        if (!this.bei_dianji) {
            this.time = 3;
        }

        let qi_dian = this.location[0].clock < this.location[1].clock ? this.location[0] : this.location[1];
        let zhong_dian = this.location[0].clock > this.location[1].clock ? this.location[0] : this.location[1];
        let qi_dian_colour = colour1[2];
        let zhong_dian_colour = colour1[3];
        qi_dian.obj.getComponent('brick').brick_colour(qi_dian_colour[0], qi_dian_colour[1], qi_dian_colour[2]);
        qi_dian.obj.getComponent('brick').reset_button();
        zhong_dian.obj.getComponent('brick').brick_colour(zhong_dian_colour[0], zhong_dian_colour[1], zhong_dian_colour[2]);
        zhong_dian.obj.getComponent('brick').reset_button();
        let origin_hang = qi_dian.hang;
        let origin_lie = qi_dian.lie;
        let location_hang = zhong_dian.hang;
        let location_lie = zhong_dian.lie;
        let path = this.look_for_exit(this.di_tu_arr[origin_hang][origin_lie], this.di_tu_arr[location_hang][location_lie], this.di_tu_arr);
        this.game_character = cc.instantiate(this.game_character_prefab);
        if (this.xing_jie_dian) {
            this.xing_jie_dian.destroy();
            this.xing_jie_dian = null;
        }
        this.xing_jie_dian = new cc.Node();
        this.xing_jie_dian.parent = this.game_node;
        this.game_character.position = path[path.length - 1].position;
        this.xing_jie_dian.addChild(this.game_character);
        for (let i = path.length - 1; i >= 0; i--) {
            this.node.runAction(cc.sequence(cc.delayTime(0.5 + (path.length - i) / 5), cc.callFunc(function () {
                this.game_character.position = path[i].position;
            }.bind(this))))
        }
    },
    start() {
        this.location = [];
        this.map = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 1, 1, 1, 0, 0, 1, 1],
            [1, 0, 0, 1, 1, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 1, 0, 0, 1],
            [1, 0, 0, 1, 1, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 1, 0, 1],
            [1, 1, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
        this.Stack = new Stack.Stack();
        this.Stack1 = new Stack.Stack();
        this.add_brick(this.map);
        this.location[0] = {
            hang: 8,
            lie: 8,
            obj: this.di_tu_arr[8][8],
            clock: 0
        }
        this.location[1] = {
            hang: 1,
            lie: 7,
            obj: this.di_tu_arr[1][7],
            clock: 1
        }
        // let dir = "right";
        // let post1 = this.findNextPoint({ hang: 9, lie: 9 }, dir, di_tu_arr);
        // let post2 = this.findNextPoint({ hang: 0, lie: 0 }, dir, di_tu_arr);
        // let post3 = this.findNextPoint({ hang: 9, lie: 0 }, dir, di_tu_arr);
        // let post4 = this.findNextPoint({ hang: 0, lie: 9 }, dir, di_tu_arr);

        // let x = ;
        let a = 100;
    },
    //找出口 传入起点,终点, 地图, 知道要做
    look_for_exit(start, end, ditu) {
        /**
         * 初始化，将起点加入堆栈；
            while(堆栈不为空){
                取出栈顶位置为当前位置；
                如果 当前位置是终点，
                则 使用堆栈记录的路径标记从起点至终点的路径；
                否则{
                    按照从下、右、上、左的顺序将当前位置下一个可以探索的位置入栈；
                    如果 当前位置的四周均不通
                    则 当前位置出栈；
                }
            }
        */

        this.directions = ['down', 'right', 'up', 'left'];
        // 初始化，将起点加入堆栈；
        this.Stack.push(start);
        let res = [];
        while (!this.Stack.isEmpty()) {
            let dangqian = this.Stack.peek();
            if (this.tell_isame_position(dangqian, end)) {
                // 差不多找到路么了, 而且这个路径就是栈里面存的东西

                let x = end.getComponent('brick').hang;
                let y = end.getComponent('brick').lie;
                while (!this.Stack.isEmpty()) {
                    let cell = this.Stack.pop();
                    let cell_x = cell.getComponent('brick').hang;
                    let cell_y = cell.getComponent('brick').lie;
                    // 要注意的是，只有和上一次的cell相邻的cell才是路径上的通道
                    if (Math.abs(cell_x - x) + Math.abs(cell_y - y) <= 1) {
                        cc.log(`路径点(${cell_x}, ${cell_y})`);
                        res.push(cell);
                    }
                    x = cell_x;
                    y = cell_y;
                }

                return res;
            }
            else {
                // 向四个方向探索
                let isDead = true;
                for (let i in this.directions) {
                    let t_dir = this.directions[i];
                    let next_position = this.findNextPoint(dangqian, t_dir, ditu);
                    if (next_position && next_position.getComponent('brick').ID != 1 && next_position.getComponent('brick').isValid()) {
                        next_position.getComponent('brick').setVisited(true);
                        this.Stack.push(next_position);
                        cc.log(`位置行:${next_position.getComponent('brick').hang} 列: ${next_position.getComponent('brick').lie} 入栈`);
                        isDead = false;
                    }
                }
                // 四个方向都不能走，则该点为死胡同，出栈
                if (isDead) {
                    let k = this.Stack.pop();
                    cc.log(`位置行:${k.getComponent('brick').hang} 列: ${k.getComponent('brick').lie} 出栈`);
                }
            }
        }
    },
    //传一个位置进去, 要判断这个位置是不是已经在栈里了
    isInStack(next_position) {
        let x = next_position.getComponent('brick').hang;
        let y = next_position.getComponent('brick').lie;
        let arr = this.Stack.getItem();
        for (let i = 0; i < arr.length; i++) {
            let hang = arr[i].getComponent('brick').hang;
            let lie = arr[i].getComponent('brick').lie;
            if (x === hang && y === lie) {
                return true;
            }
        }
        return false;
    },
    //判断一个位置的四周通不通, 只有一个通那就是通, 否则就是不通
    //如果某个位置已经在栈里面了, 也就访问过了的意思, 就不算做通路
    whether_Way(dangqian, ditu) {
        for (let key in this.directions) {
            let next_position = this.findNextPoint(dangqian, this.directions[key], ditu)
            if (next_position && next_position.getComponent('brick').ID != 1) {
                return true;
            }
        }
        return false;
    },
    //判断两个点是不是同一个位置
    tell_isame_position(pos1, pos2) {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    },
    //根据传进来的点 找到下一个方向的点
    findNextPoint(chuanjinliadedain, xiayigefangxiang, ditu) {
        // let hang = chuanjinliadedain.hang;
        // let lie = chuanjinliadedain.lie;

        let hang = chuanjinliadedain.getComponent('brick').hang;
        let lie = chuanjinliadedain.getComponent('brick').lie;
        let next_hang = hang;
        let next_lie = lie;
        if (xiayigefangxiang == "up") {
            next_hang = hang - 1;
        }
        else if (xiayigefangxiang == "down") {
            next_hang = hang + 1;
        }
        else if (xiayigefangxiang == 'left') {
            next_lie = lie - 1;
        }
        else if (xiayigefangxiang == 'right') {
            next_lie = lie + 1;
        }

        //找出四个边界
        let up_edge = 0;
        let down_edge = ditu.length - 1;
        let left_dege = 0;
        let right_edge = ditu[0].length - 1;

        //行,列跟边界去比较
        if (/*超出边界 直接返回空*/next_hang < up_edge || next_hang > down_edge || next_lie < left_dege || next_lie > right_edge) {
            return null;
        }

        //
        return ditu[next_hang][next_lie];

    },
    //根据地图添加砖块和通道
    add_brick(map) {
        this.di_tu_arr = [];
        for (let i = 0; i < map.length; i++) {
            this.di_tu_arr[i] = [];
            for (let j = 0; j < map[i].length; j++) {
                let brick = cc.instantiate(this.brick_prefab);
                let colour = colour1[map[i][j]];
                let B = colour[2];
                let G = colour[1];
                let R = colour[0];
                brick.getComponent('brick').brick_colour(R, G, B);
                brick.getComponent('brick').Name(map[i][j], i, j);
                this.di_tu_arr[i][j] = brick;
                if (map[i][j] != 0) {
                    this.di_tu_arr[i][j].getComponent('brick').forbid_click(false);
                }
                this.game_node.addChild(brick);
            }
        }
        this.describe_map();
    },
    //画地图
    describe_map() {
        let beginning = 100;//上面的起点
        let destination = 340;//下面的终点
        let m_width = this.di_tu_arr[0][0].getChildByName('brick_sprite').width;//110
        let m_heigth = this.di_tu_arr[0][0].getChildByName('brick_sprite').height;//110
        let right_interval = 10;//往右的间隔
        let down_interval = 10;//往下的间隔
        for (let i = 0; i < this.di_tu_arr.length; i++) {
            for (let j = 0; j < this.di_tu_arr[i].length; j++) {
                let x = beginning + j * (m_width + right_interval);
                let y = destination - i * (m_heigth + down_interval);
                this.di_tu_arr[i][j].position = cc.v2(x, y);
            }
        }
    },

    // update (dt) {},
});
