/* eslint-disable */
type CallbackSignature = (params: any) => {};

export class SocketTestHelper {
    private callbacks = new Map<string, CallbackSignature[]>();

    on(event: string, callback: CallbackSignature): void {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }

        this.callbacks.get(event)!.push(callback);
    }

    emit(event: string, ...params: any): void {
        return;
    }

    disconnect(): void {
        return;
    }

    removeListener(event: string): void {
        this.callbacks.delete(event);
    }

    isListenerCreated(event: string): boolean {
        return this.callbacks.has(event);
    }

    peerSideEmit(event: string, params?: any) {
        if (!this.callbacks.has(event)) {
            return;
        }
        for (const callback of this.callbacks.get(event)!) {
            callback(params);
        }
    }
}
