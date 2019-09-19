import { safeTouch } from 'safe-touch'
function touch<T>(param: T | any) {
    return new Promise<T | any>((resolve, reject) => {
        if (param) resolve(param)
        else reject()
    })
}

export { touch }