export interface IProgram {
    /** Most importantly, every program MUST specify the command that will be used to close the program. */
    exitCommand: string; 

    /** Prefix that will replace the default. Ex: sverminal> becomes promptPrefix>
     * This is a required parameter so that the user knows a program is running.
    */
    promptPrefix: string;
 
    /** Optional welcome message. */
    welcomeMessage?: string;

    /** Input processor */
    processCommand(command: string): Promise<void>;
}