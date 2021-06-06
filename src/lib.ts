export const isStateObject = (x: object) =>
    x !== null && typeof x === "object" && !Array.isArray(x);

export const get = (path: object[], target: any) =>
    path.reduce(
        (acc, cur: any) => (isStateObject(acc) ? acc[cur] : undefined),
        target
    );

export const set = (path: object[], target: any, value: any) => {
    path.reduce((acc, cur: any, idx) => {
        if (idx + 1 === path.length) {
            acc[cur] = value;
        } else {
            acc[cur] = acc[cur] || {};
        }
        return acc[cur];
    }, target);
};
