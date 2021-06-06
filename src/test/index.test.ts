import LightState from "../index";

// describe("LightState", () => {
//     it("should created new LightState without crash", () => {
//         new LightState({ initData: {} });
//     });

//     it("should created new LightState with store without crash", () => {
//         new LightState(
//             { initData: {} },
//             {
//                 storageName: "demo",
//                 getFromStorage: jest.fn(),
//                 saveToStorage: jest.fn(),
//             }
//         );
//     });
// });

// describe("LightState.setState", () => {
//     const mockApi = async () => {
//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 resolve({ foo: 10 });
//             }, 1000);
//         });
//     };

//     it("should setState -> getState sync work correctly", () => {
//         const state = new LightState({ foo: 1 });

//         state.setState({ foo: 2 });
//         expect(state.getState()).toEqual({ foo: 2 });
//         expect(state.getState("foo")).toEqual(2);
//         // @ts-ignore
//         expect(state.getState("foooo")).toEqual(undefined);
//     });

//     it("should setState -> getState ansync work correctly", () => {
//         const state = new LightState({ foo: 1 });

//         state
//             .setState(async (state) => {
//                 let data: any = await mockApi();
//                 return { ...state, ...data };
//             })
//             .then(() => {
//                 expect(state.getState()).toEqual({ foo: 10 });
//             });
//     });

//     it("should setState with callback work", () => {
//         const state = new LightState({ foo: 1 });

//         // @ts-ignore
//         state.setState({ bar: 1 }, (newState) => {
//             expect(newState).toEqual({ foo: 1, bar: 1 });
//         });
//     });

//     it("should setState async function work", async () => {
//         const store = new LightState<{ foo: number }>({ foo: 1 });
//         store.setState(
//             (state) => {
//                 expect(state).toEqual({ foo: 1 });
//                 return { foo: 2 };
//             },
//             (newState) => {
//                 expect(newState).toEqual({ foo: 2 });
//             }
//         );

//         store
//             .setState(
//                 (state) => {
//                     return { foo: 4 };
//                 },
//                 (newState) => {
//                     expect(newState).toEqual({ foo: 1, biz: 2, baz: 3 });
//                 }
//             )
//             .then(() => {
//                 expect(store.getState()).toEqual({ foo: 1, biz: 2, baz: 3 });
//             });

//         store
//             .setState(async (state) => {
//                 let data: any = await mockApi();
//                 expect(state).toEqual({ foo: 1 });
//                 return data;
//             })
//             .then(() => {
//                 expect(store.getState()).toEqual({
//                     foo: 10,
//                 });
//             });
//     });
// });

// describe("LightState.dispatch", () => {
//     it("should dispatch work", () => {
//         const store = new LightState({ foo: 1 });
//         store.dispatch(
//             (dispatch, state) => {
//                 expect(state).toEqual({ foo: 1 });
//                 dispatch({ foo: 2 }, (newState: any) => {
//                     expect(newState).toEqual({ foo: 2 });
//                 });
//                 expect(state).toEqual({ foo: 1 });
//             },
//             (newState) => {
//                 expect(newState).toEqual({ foo: 1, bar: 2 });
//             }
//         );
//     });
// });

describe("LightState utility", () => {
    it("should actions creator works", () => {
        var store = new LightState({
            foo: 1,
            loading: false,
            add: (state: any) => {
                return { foo: state.foo + 1 };
            },
            addCustom: (state: any, a: 10, dispatch: any) => {
                dispatch("setLoading");
                dispatch({ foo: 30 });
            },
            setLoading: () => ({ loading: true }),
        });
        store.actions.add();
        expect(store.getState()).toEqual({ foo: 2, loading: false });
        store.actions.addCustom(10);
        expect(store.getState()).toEqual({ foo: 30, loading: true });
    });
});
