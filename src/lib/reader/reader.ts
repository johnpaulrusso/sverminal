import { writable } from "svelte/store";

export class SverminalReader {

    readonly prompt = writable<string>();
    response: string = "";
    isReading = false;

    subscribe(callback: (value: string) => void) {
		this.prompt.subscribe(callback);
	}

    async read(prompt: string): Promise<string>{
        this.isReading = true;
        this.response = "";
        this.prompt.set(prompt);
        return new Promise<string>(resolve => {
            const interval = setInterval(() => {
              if (this.response != "" && this.response != undefined) {
                this.isReading = false;
                this.prompt.set("");
                clearInterval(interval);
                resolve(this.response);
              }
            }, 100); // Check every 100 milliseconds
        });
    }
}