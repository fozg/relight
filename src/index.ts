import { useState, useEffect, useRef } from "react";
import shallowEqual from "shallowequal";
import Store from "./Store";
import mapStateToPropsDefault from "./utils/mapStateToProps";
import { isStateObject } from "./lib";
import { getFromStore, saveToStore } from "./storage";

interface IOptions {
    storageName: string;
    getFromStorage?: any;
    saveToStorage?: any;
}
type Dispatch<T> = (
    dispatch: ((d: T | Partial<T> | Dispatch<T>) => Promise<void>) | T,
    state?: T | ((newstate: T) => void)
) => Promise<void> | void;

class ReactLightState<T, A = {}> {
    private initState: T;
    private actionsCreator?: A;
    private options: IOptions;
    private store: Store<T>;
    public actions: any = {};

    constructor(initState: T, options?: IOptions) {
        this.initState = this.filterObject(
            initState,
            (item) => typeof item !== "function"
        ) as T;
        this.actionsCreator =
            (this.filterObject(
                initState,
                (item) => typeof item === "function"
            ) as A) || undefined;
        const {
            storageName = null,
            getFromStorage = getFromStore,
            saveToStorage = saveToStore,
        } = options || {};
        this.options = { storageName, getFromStorage, saveToStorage };
        if (this.options.storageName) {
            this.store = new Store(
                this.options.getFromStorage(this.options.storageName) ||
                    this.initState
            );
        } else {
            this.store = new Store(this.initState);
        }

        this.setState = this.setState.bind(this);
        this.dispatch = this.dispatch.bind(this);
        this.getState = this.getState.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.resetState = this.resetState.bind(this);
        this.useStore = this.useStore.bind(this);

        this.buildActions();
    }

    private filterObject = (obj: Object, predicate: (input: any) => boolean) =>
        Object.keys(obj)
            // @ts-ignore
            .filter((key: any) => predicate(obj[key]))
            // @ts-ignore
            .reduce((res, key) => ((res[key] = obj[key]), res), {});

    private buildActions() {
        Object.keys(this.actionsCreator).map((actionName) => {
            this.actions[actionName] = (...args: any) => {
                // @ts-ignore
                // this.setState(this.actionsCreator[actionName](this.getState()));
                // @ts-ignore
                // return this.actionsCreator[actionName](this.dispatch, this.getState())
                // this.actionsCreator[actionName](
                //     this.getState(),
                //     ...args,
                //     this.dispatch
                // );

                this.dispatch((dispatch: Dispatch<T>, state: T) => {
                    // @ts-ignore
                    let test = this.actionsCreator[actionName](
                        state,
                        ...args,
                        dispatch
                    );
                    console.log({ test });
                    dispatch(test);
                });
            };
        });
    }

    setState(
        data: ((state: T) => T | Promise<T>) | T | Partial<T>,
        cb?: (newState: T) => void
    ): Promise<void> {
        if (typeof data === "function") {
            return (async () => {
                let newData = await (data as Function)(this.getState());
                this.setState(newData, cb);
            })();
        } else {
            let newData = { ...this.getState(), ...data };
            this.store.setData(newData as T);
            if (cb) cb(newData as T);
            if (this.options.storageName) {
                this.options.saveToStorage(this.options.storageName, newData);
            }
        }
    }

    dispatch(
        func:
            | ((dispatch: Dispatch<T>, state: T | Partial<T>) => void)
            | T
            | string,
        setStateCallback?: (newState: T | Partial<T>) => void
    ) {
        if (typeof func === "string") {
            this.actions[func]();
        } else if (typeof func !== "function") {
            this.setState(func, setStateCallback);
            return;
        }
        return (async () => {
            let data = await (func as Function)(this.dispatch, this.getState());
            this.dispatch(data, setStateCallback);
        })();
    }

    getState(key?: keyof T): Partial<T> | T {
        if (key) {
            return this.store.getData()[key];
        } else {
            return this.store.getData();
        }
    }

    subscribe(cb: Function) {
        this.store.subscribe(cb);
        return cb;
    }

    unsubscribe(cb: Function) {
        return this.store.unsubscribe(cb);
    }

    /**
     * Reset the `LightState` data to `initState` data.
     */
    resetState() {
        this.store.setData(this.initState);
    }

    useStore(mapStateToProps = mapStateToPropsDefault) {
        let [state, setState] = useState(
            mapStateToProps<T>(this.store.getData())
        );
        const [error, setError] = useState(null);
        // As our effect only fires on mount and unmount it won't have the state
        // changes visible to it, therefore we use a mutable ref to track this.
        const stateRef = useRef(state);
        // Helps avoid firing of events when unsubscribed, i.e. unmounted
        const isActive = useRef(true);
        // Tracks when a hooked component is unmounting
        const unmounted = useRef(false);
        if (error) {
            throw error;
        }
        useEffect(() => {
            isActive.current = true;
            const calculateState = () => {
                if (!isActive.current) {
                    return;
                }
                try {
                    const newState = mapStateToProps(this.store.getData());
                    if (
                        newState === stateRef.current ||
                        (isStateObject(newState) &&
                            isStateObject(stateRef.current) &&
                            shallowEqual(newState, stateRef.current))
                    ) {
                        // Do nothing
                        return;
                    }
                    stateRef.current = newState;
                    setState(stateRef.current);
                } catch (err) {
                    isActive.current = false;

                    setTimeout(() => {
                        if (!unmounted.current && !isActive.current) {
                            setError(err);
                        }
                    }, 200); // give a window of opportunity
                }
            };
            const unsubscribe = this.store.subscribe(calculateState);
            return this.store.unsubscribe(unsubscribe);
        });

        return state;
    }
}

export default ReactLightState;
