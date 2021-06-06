export default class Store<T> {
    private cbs: any[];
    private data: T;
    constructor(data: T) {
        this.cbs = [];
        this.data = data;
    }

    setData(newData: T) {
        this.data = newData;
        for (var i = this.cbs.length - 1; i >= 0; i--) {
            this.cbs[i](newData);
        }
    }

    getData() {
        return this.data;
    }

    subscribe(cb: any) {
        this.cbs.push(cb);
    }

    unsubscribe(observer: any) {
        var index = this.cbs.indexOf(observer);

        if (~index) {
            this.cbs.splice(index, 1);
        }
    }

    unSubscribeAll() {
        this.cbs = [];
    }
}
