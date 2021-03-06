class NestError extends Error {}

interface IKey {
    filename: string;
    pos: number;
    opts: any;
}

export function getTypeName(value: any, nest = 0): string | null {
    if (nest === 5) {
        throw new NestError('NestError');
    }
    if (value === null) {
        return 'null';
    }
    if (['undefined', 'number', 'string', 'boolean'].indexOf(typeof value) >= 0) {
        return typeof value;
    }
    if (value instanceof Array) {
        const itemTypes = Array.from(new Set(value.map((v) => getTypeName(v, nest + 1)))).filter((t) => t !== null);
        if (itemTypes.length === 0) {
            return null;
        }
        if (itemTypes.length === 1) {
            return itemTypes[0] + '[]';
        }
        return `Array<${itemTypes.sort().join('|')}>`;
    }
    if (value.constructor && value.constructor.name) {
        const { name } = value.constructor;
        return name === 'Object' ? 'object' : name;
    }
    return typeof value;
}

const logs: { [key: string]: Set<string> } = {};

export function $_$twiz(name: string, value: any, pos: number, filename: string, opts: any) {
    const index = JSON.stringify({ filename, pos, opts } as IKey);
    try {
        const typeName = getTypeName(value);
        if (!logs[index]) {
            logs[index] = new Set();
        }
        if (typeName) {
            logs[index].add(typeName);
        }
    } catch (e) {
        if (e instanceof NestError) {
            // simply ignore the type
        }
        throw e;
    }
}

// tslint:disable:no-namespace
export namespace $_$twiz {
    export const typeName = getTypeName;
    export const get = () => {
        return Object.keys(logs).map((key) => {
            const { filename, pos, opts } = JSON.parse(key) as IKey;
            return [filename, pos, Array.from(logs[key]), opts] as [string, number, string[], any];
        });
    };
}
